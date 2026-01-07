using StudenthubAPI.Data;
using StudenthubAPI.Models;
using StudenthubAPI.BO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace StudenthubAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProgramsController : ControllerBase
    {
        private readonly DataContext _dataContext;

        public ProgramsController(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        #region Get Operations

        /// <summary>
        /// Get all programs
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllPrograms([FromQuery] bool isActive = true)
        {
            try
            {
                var programs = await _dataContext.Set<ProgramBO>()
                    .FromSqlRaw("EXEC sp_GetAllPrograms @IsActive",
                        new SqlParameter("@IsActive", isActive))
                    .AsNoTracking()
                    .ToListAsync();

                return Ok(programs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving programs", error = ex.Message });
            }
        }

        /// <summary>
        /// Get a specific program by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProgramById(int id)
        {
            try
            {
                var program = await _dataContext.Set<ProgramBO>()
                    .FromSqlRaw("EXEC sp_GetProgramById @ProgramID",
                        new SqlParameter("@ProgramID", id))
                    .AsNoTracking()
                    .FirstOrDefaultAsync();

                if (program == null)
                    return NotFound(new { message = "Program not found" });

                return Ok(program);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving program", error = ex.Message });
            }
        }

        /// <summary>
        /// Get program statistics (clusters and students count)
        /// </summary>
        [HttpGet("Stats")]
        public async Task<IActionResult> GetProgramStats()
        {
            try
            {
                var programs = await GetAllPrograms();
                return programs;
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving program statistics", error = ex.Message });
            }
        }

        /// <summary>
        /// Get clusters assigned to a program
        /// </summary>
        [HttpGet("{id}/Clusters")]
        public async Task<IActionResult> GetClustersForProgram(int id)
        {
            try
            {
                var clusters = await _dataContext.Set<ClusterBO>().FromSqlRaw("EXEC sp_GetClustersForProgram @ProgramID", 
                    new SqlParameter("@ProgramID", id))
                    .AsNoTracking()
                    .ToListAsync();
                return Ok(clusters);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving clusters for program", error = ex.Message });
            }
        }

        /// <summary>
        /// Get students assigned to a program
        /// </summary>
        [HttpGet("{id}/Students")]
        public async Task<IActionResult> GetStudentsForProgram(int id)
        {
            try
            {
                var students = await _dataContext.Set<StudentBO>()
                    .FromSqlRaw("EXEC sp_GetStudentsForProgram @ProgramID", 
                    new SqlParameter("@ProgramID", id))
                    .AsNoTracking()
                    .ToListAsync();
                return Ok(students);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving students for program", error = ex.Message });
            }
        }

        #endregion

        #region Create Operation

        /// <summary>
        /// Create a new program
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateProgram([FromBody] CreateProgramBO createProgramBO)
        {
            try
            {
                var outputParameter = new SqlParameter("@Output", SqlDbType.NVarChar, 50)
                {
                    Direction = ParameterDirection.Output
                };

                var programIdParameter = new SqlParameter("@ProgramID", SqlDbType.Int)
                {
                    Direction = ParameterDirection.Output
                };

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "EXEC sp_InsertProgram @Name, @Description, @Output OUTPUT",
                    new SqlParameter("@Name", createProgramBO.Name),
                    new SqlParameter("@Description", (object)createProgramBO.Description ?? DBNull.Value),
                    outputParameter);

                var result = outputParameter.Value?.ToString();

                if (result == "Success")
                {
                    return CreatedAtAction(nameof(GetProgramById), new { id = programIdParameter.Value },
                        new { message = "Program created successfully", programId = programIdParameter.Value });
                }

                return BadRequest(new { message = "Failed to create program" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating program", error = ex.Message });
            }
        }

        #endregion

        #region Update Operation

        /// <summary>
        /// Update an existing program
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProgram(int id, [FromBody] UpdateProgramBO updateProgramBO)
        {
            try
            {
                var outputParameter = new SqlParameter("@Output", SqlDbType.NVarChar, 50)
                {
                    Direction = ParameterDirection.Output
                };

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "EXEC sp_UpdateProgram @ProgramID, @Name, @Description, @Output OUTPUT",
                    new SqlParameter("@ProgramID", id),
                    new SqlParameter("@Name", (object)updateProgramBO.Name ?? DBNull.Value),
                    new SqlParameter("@Description", (object)updateProgramBO.Description ?? DBNull.Value),
                    outputParameter);

                var result = outputParameter.Value?.ToString();

                if (result == "Success")
                {
                    return Ok(new { message = "Program updated successfully" });
                }

                return BadRequest(new { message = "Failed to update program" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating program", error = ex.Message });
            }
        }

        #endregion
    }
}
