using StudenthubAPI.Data;
using StudenthubAPI.Models;
using StudenthubAPI.BO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Diagnostics.Metrics;
using Microsoft.AspNetCore.Authorization;

namespace StudenthubAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClustersController : ControllerBase
    {
        private readonly DataContext _dataContext;

        public ClustersController(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        #region Get Operations

        /// <summary>
        /// Get all clusters
        /// </summary>
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAllClusters([FromQuery] bool isActive = true)
        {
            try
            {
                var clusters = await _dataContext.Set<ClusterBO>()
                    .FromSqlRaw("EXEC sp_GetAllClusters @IsActive",
                        new SqlParameter("@IsActive", isActive))
                    .AsNoTracking()
                    .ToListAsync();

                return Ok(clusters);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving clusters", error = ex.Message });
            }
        }

        /// <summary>
        /// Get a specific cluster by ID
        /// </summary>
        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetClusterById(int id)
        {
            try
            {
                var cluster = await _dataContext.Set<ClusterBO>()
                    .FromSqlRaw("EXEC sp_GetClusterById @ClusterID",
                        new SqlParameter("@ClusterID", id))
                    .AsNoTracking()
                    .FirstOrDefaultAsync();

                if (cluster == null)
                    return NotFound(new { message = "Cluster not found" });

                return Ok(cluster);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving cluster", error = ex.Message });
            }
        }

        /// <summary>
        /// Get cluster statistics (students and teachers count)
        /// </summary>
        [Authorize]
        [HttpGet("Stats")]
        public async Task<IActionResult> GetClusterStats([FromQuery] bool isActive = true)
        {
            try
            {
                var clusters = await _dataContext.Set<ClusterStatsBO>()
                              .FromSqlRaw("EXEC sp_GetAllClustersStats @IsActive",
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

        /// <summary>
        /// Get students in a specific cluster
        /// </summary>
        [Authorize]
        [HttpGet("{clusterId}/Students")]
        public async Task<IActionResult> GetClusterStudents(int clusterId)
        {
            try
            {
                var students = await _dataContext.Set<StudentBO>()
                    .FromSqlRaw("EXEC sp_GetStudentsByCluster @ClusterID",
                        new SqlParameter("@ClusterID", clusterId))
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
        [HttpGet("{clusterId}/Teachers")]
        public async Task<IActionResult> GetClusterTeachers(int clusterId)
        {
            try
            {
                var teachers = await _dataContext.Set<TeacherBO>()
                    .FromSqlRaw("EXEC sp_GetTeachersByCluster @ClusterID",
                        new SqlParameter("@ClusterID", clusterId))
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

        #region Create Operation

        /// <summary>
        /// Create a new cluster
        /// </summary>
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateCluster([FromBody] CreateClusterBO createClusterBO)
        {
            try
            {
                var outputParameter = new SqlParameter("@Output", SqlDbType.NVarChar, 50)
                {
                    Direction = ParameterDirection.Output
                };

                var clusterIdParameter = new SqlParameter("@ClusterID", SqlDbType.Int)
                {
                    Direction = ParameterDirection.Output
                };

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "EXEC sp_InsertCluster @Name, @Address, @City, @State, @Notes," +
                    "@ClusterID OUTPUT, @Output OUTPUT",
                    new SqlParameter("@Name", createClusterBO.Name),
                    new SqlParameter("@Address", (object)createClusterBO.Address ?? DBNull.Value),
                    new SqlParameter("@City", (object)createClusterBO.City ?? DBNull.Value),
                    new SqlParameter("@State", (object)createClusterBO.State ?? DBNull.Value),
                    new SqlParameter("@Notes", (object)createClusterBO.Notes ?? DBNull.Value),
                    clusterIdParameter,
                    outputParameter);

                var result = outputParameter.Value?.ToString();
                var clusterId = clusterIdParameter.Value != DBNull.Value ? (int)clusterIdParameter.Value : 0;

                if (result == "Success" && clusterId > 0)
                {
                    return CreatedAtAction(nameof(GetClusterById), new { id = clusterId },
                        new { message = "Cluster created successfully", clusterId = clusterId });
                }

                return BadRequest(new { message = "Failed to create cluster" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating cluster", error = ex.Message });
            }
        }

        #endregion

        #region Update Operation

        /// <summary>
        /// Update an existing cluster
        /// </summary>
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCluster(int id, [FromBody] UpdateClusterBO updateClusterBO)
        {
            try
            {
                var outputParameter = new SqlParameter("@Output", SqlDbType.NVarChar, 50)
                {
                    Direction = ParameterDirection.Output
                };

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "EXEC sp_UpdateCluster @ClusterID, @Name, @Address, @City, @State, @Notes," +
                    "@Output OUTPUT",
                    new SqlParameter("@ClusterID", id),
                    new SqlParameter("@Name", (object)updateClusterBO.Name ?? DBNull.Value),
                    new SqlParameter("@Address", (object)updateClusterBO.Address ?? DBNull.Value),
                    new SqlParameter("@City", (object)updateClusterBO.City ?? DBNull.Value),
                    new SqlParameter("@State", (object)updateClusterBO.State ?? DBNull.Value),
                    new SqlParameter("@Notes", (object)updateClusterBO.Notes ?? DBNull.Value),
                    outputParameter);

                var result = outputParameter.Value?.ToString();

                if (result == "Success")
                {
                    return Ok(new { message = "Cluster updated successfully" });
                }

                return BadRequest(new { message = "Failed to update cluster" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating cluster", error = ex.Message });
            }
        }

        #endregion

        #region Delete Operation

        /// <summary>
        /// Delete a cluster
        /// </summary>
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCluster(int id)
        {
            try
            {
                var outputParameter = new SqlParameter("@Output", SqlDbType.NVarChar, 50)
                {
                    Direction = ParameterDirection.Output
                };

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "EXEC sp_DeleteCluster @ClusterID, @Output OUTPUT",
                    new SqlParameter("@ClusterID", id),
                    outputParameter);

                var result = outputParameter.Value?.ToString();

                if (result == "Success")
                {
                    return Ok(new { message = "Cluster deleted successfully" });
                }

                return BadRequest(new { message = result ?? "Failed to delete cluster" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting cluster", error = ex.Message });
            }
        }

        #endregion
    }
}
