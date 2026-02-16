using StudenthubAPI.Data;
using StudenthubAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using StudenthubAPI.BO;
using System.Data;

namespace StudenthubAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LearningCentresController : ControllerBase
    {
        private readonly DataContext _dataContext;

        public LearningCentresController(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        #region Get Operations

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetLearningCentres([FromQuery] int? clusterId = null, [FromQuery] bool isActive = true)
        {
            try
            {
                var learningCentres = await _dataContext.Set<LearningCentre>()
                    .FromSqlRaw("EXEC spGetLearningCentres @ClusterId, @IsActive",
                        new SqlParameter("@ClusterId", (object)clusterId ?? DBNull.Value),
                        new SqlParameter("@IsActive", isActive))
                    .AsNoTracking()
                    .ToListAsync();

                return Ok(learningCentres);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving learning centres", error = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("Stats")]
        public async Task<IActionResult> GetLearningCenterStats([FromQuery] bool isActive = true)
        {
            try
            {
                var clusters = await _dataContext.Set<LearningCenterStatsBO>()
                              .FromSqlRaw("EXEC sp_GetAllLearningCentersStats @IsActive",
                                new SqlParameter("@IsActive", isActive))
                              .AsNoTracking()
                             .ToListAsync();

                if (clusters == null)
                    return NotFound(new { message = "Clusters not found" });

                return Ok(clusters);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving cluster statistics", error = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetLearningCentreById(int id)
        {
            try
            {
                var learningCentre = _dataContext.Set<LearningCentre>()
                    .FromSqlRaw("EXEC spGetLearningCentres @ClusterId = NULL")
                    .AsNoTracking()
                    .AsEnumerable()
                    .FirstOrDefault(lc => lc.id == id);

                if (learningCentre == null)
                    return NotFound(new { message = "Learning centre not found" });

                return Ok(learningCentre);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving learning centre", error = ex.Message });
            }
        }

        /// <summary>
        /// Get students in a specific cluster
        /// </summary>
        [Authorize]
        [HttpGet("{learningCentreId}/Students")]
        public async Task<IActionResult> GetLearningCentreStudents(int learningCentreId)
        {
            try
            {
                var students = await _dataContext.Set<StudentBO>()
                    .FromSqlRaw("EXEC sp_GetStudentsByLearningCentre @LearningCentreID",
                        new SqlParameter("@LearningCentreID", learningCentreId))
                    .AsNoTracking()
                    .ToListAsync();

                return Ok(students);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving cluster students", error = ex.Message });
            }
        }

        /// <summary>
        /// Get teachers assigned to a specific cluster
        /// </summary>
        [Authorize]
        [HttpGet("{learningCentreId}/Teachers")]
        public async Task<IActionResult> GetLearningCentreTeachers(int learningCentreId)
        {
            try
            {
                var teachers = await _dataContext.Set<TeacherBO>()
                    .FromSqlRaw("EXEC sp_GetTeachersByLearningCentre @LearningCentreID",
                        new SqlParameter("@LearningCentreID", learningCentreId))
                    .AsNoTracking()
                    .ToListAsync();

                return Ok(teachers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving cluster teachers", error = ex.Message });
            }
        }

        #endregion

        #region Create Operations

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateLearningCentre([FromBody] CreateLearningCentreBO request)
        {
            try
            {
                if (request == null)
                    return BadRequest(new { message = "Request body is required" });

                var learningCenterIdParameter = new SqlParameter("@LearningCenterId", SqlDbType.Int)
                {
                    Direction = ParameterDirection.Output
                };

                var outputParameter = new SqlParameter("@Output", SqlDbType.NVarChar, 50)
                {
                    Direction = ParameterDirection.Output
                };

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "EXEC spInsertLearningCentre @ClusterId, @Name, @Address, @City, @State, @Latitude, @Longitude, @GeoRadiusMeters, @Notes, @IsActive, @LearningCenterId OUTPUT, @Output OUTPUT",
                    new SqlParameter("@ClusterId", request.cluster_id),
                    new SqlParameter("@Name", request.name),
                    new SqlParameter("@Address", (object)request.address ?? DBNull.Value),
                    new SqlParameter("@City", (object)request.city ?? DBNull.Value),
                    new SqlParameter("@State", (object)request.state ?? DBNull.Value),
                    new SqlParameter("@Latitude", (object)request.latitude ?? DBNull.Value),
                    new SqlParameter("@Longitude", (object)request.longitude ?? DBNull.Value),
                    new SqlParameter("@GeoRadiusMeters", (object)request.geo_radius_meters ?? DBNull.Value),
                    new SqlParameter("@Notes", (object)request.notes ?? DBNull.Value),
                    new SqlParameter("@IsActive", true),
                    learningCenterIdParameter,
                    outputParameter);

                var result = outputParameter.Value?.ToString();
                var learningCenterId = learningCenterIdParameter.Value != DBNull.Value ? (int)learningCenterIdParameter.Value : 0;

                if (result == "Success" && learningCenterId > 0)
                {
                    return CreatedAtAction(nameof(GetLearningCentreById), new { id = learningCenterId },
                        new { message = "Learning center created successfully", learningCenterId = learningCenterId });
                }

                return BadRequest(new { message = "Failed to create learning center" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating learning centre", error = ex.Message });
            }
        }

        #endregion

        #region Update Operations

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLearningCentre(int id, [FromBody] UpdateLearningCentreBO request)
        {
            try
            {
                if (request == null)
                    return BadRequest(new { message = "Request body is required" });


                var outputParameter = new SqlParameter("@Output", SqlDbType.NVarChar, 50)
                {
                    Direction = ParameterDirection.Output
                };

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "EXEC spUpdateLearningCentre @LearningCentreId, @Name, @Address, @City, @State, @Latitude, @Longitude, @GeoRadiusMeters, @Notes, @Output OUTPUT",
                    new SqlParameter("@LearningCentreId", id),
                    new SqlParameter("@Name", request.name),
                    new SqlParameter("@Address", (object)request.address ?? DBNull.Value),
                    new SqlParameter("@City", (object)request.city ?? DBNull.Value),
                    new SqlParameter("@State", (object)request.state ?? DBNull.Value),
                    new SqlParameter("@Latitude", (object)request.latitude ?? DBNull.Value),
                    new SqlParameter("@Longitude", (object)request.longitude ?? DBNull.Value),
                    new SqlParameter("@GeoRadiusMeters", (object)request.geo_radius_meters ?? DBNull.Value),
                    new SqlParameter("@Notes", (object)request.notes ?? DBNull.Value),
                    outputParameter);

                var result = outputParameter.Value?.ToString();

                if (result == "Success")
                {
                    return Ok(new { message = "Student updated successfully" });
                }

                return BadRequest(new { message = "Failed to update student" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating learning centre", error = ex.Message });
            }
        }

        #endregion
    }
}
