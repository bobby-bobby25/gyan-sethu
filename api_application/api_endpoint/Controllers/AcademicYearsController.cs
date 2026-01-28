using StudenthubAPI.Data;
using StudenthubAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authorization;

namespace StudenthubAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AcademicYearsController : ControllerBase
    {
        private readonly DataContext _dataContext;

        public AcademicYearsController(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] bool isActive = true)
        {
            try
            {
                var years = await _dataContext.AcademicYears
                    .FromSqlRaw("EXEC sp_GetAllAcademicYears @IsActive", new SqlParameter("@IsActive", isActive))
                    .AsNoTracking()
                    .ToListAsync();

                return Ok(years);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving academic years", error = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("Current")]
        public async Task<IActionResult> GetCurrent()
        {
            try
            {
                var list = await _dataContext.AcademicYears
                    .FromSqlRaw("EXEC sp_GetCurrentAcademicYear")
                    .AsNoTracking()
                    .ToListAsync();

                var year = list.FirstOrDefault();

                if (year == null)
                    return NotFound();

                return Ok(year);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving current academic year", error = ex.Message });
            }
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAcademicYearBO model)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(model.Name))
                    return BadRequest(new { message = "Name is required" });

                if (model.StartDate == default || model.EndDate == default)
                    return BadRequest(new { message = "Valid start and end dates are required" });

                var outputParameter = new SqlParameter("@Output", SqlDbType.NVarChar, 50)
                {
                    Direction = ParameterDirection.Output
                };

                var idParameter = new SqlParameter("@AcademicYearID", SqlDbType.Int)
                {
                    Direction = ParameterDirection.Output
                };

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "EXEC sp_InsertAcademicYear @Name, @StartDate, @EndDate, @IsCurrent, @Output OUTPUT, @AcademicYearID OUTPUT",
                    new SqlParameter("@Name", model.Name),
                    new SqlParameter("@StartDate", model.StartDate),
                    new SqlParameter("@EndDate", model.EndDate),
                    new SqlParameter("@IsCurrent", model.IsCurrent ?? false),
                    outputParameter,
                    idParameter);

                var result = outputParameter.Value?.ToString();
                if (result == "Success")
                {
                    return Ok(new { message = "Academic year created successfully", academicYearId = idParameter.Value });
                }

                return BadRequest(new { message = result ?? "Failed to create academic year" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating academic year", error = ex.Message });
            }
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateAcademicYearBO model)
        {
            try
            {
                var outputParameter = new SqlParameter("@Output", SqlDbType.NVarChar, 50)
                {
                    Direction = ParameterDirection.Output
                };

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "EXEC sp_UpdateAcademicYear @AcademicYearID, @Name, @StartDate, @EndDate, @IsActive, @Output OUTPUT",
                    new SqlParameter("@AcademicYearID", id),
                    new SqlParameter("@Name", (object)model.Name ?? DBNull.Value),
                    new SqlParameter("@StartDate", (object)model.StartDate ?? DBNull.Value),
                    new SqlParameter("@EndDate", (object)model.EndDate ?? DBNull.Value),
                    new SqlParameter("@IsActive", (object)model.IsActive ?? DBNull.Value),
                    outputParameter);

                var result = outputParameter.Value?.ToString();
                if (result == "Success")
                {
                    return Ok(new { message = "Academic year updated successfully" });
                }

                return BadRequest(new { message = result ?? "Failed to update academic year" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating academic year", error = ex.Message });
            }
        }

        [Authorize]
        [HttpPut("{id}/SetCurrent")]
        public async Task<IActionResult> SetCurrent(int id)
        {
            try
            {
                var outputParameter = new SqlParameter("@Output", SqlDbType.NVarChar, 50)
                {
                    Direction = ParameterDirection.Output
                };

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "EXEC sp_SetCurrentAcademicYear @AcademicYearID, @Output OUTPUT",
                    new SqlParameter("@AcademicYearID", id),
                    outputParameter);

                var result = outputParameter.Value?.ToString();
                if (result == "Success")
                {
                    return Ok(new { message = "Current academic year updated successfully" });
                }

                return BadRequest(new { message = result ?? "Failed to set current academic year" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error setting current academic year", error = ex.Message });
            }
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var outputParameter = new SqlParameter("@Output", SqlDbType.NVarChar, 50)
                {
                    Direction = ParameterDirection.Output
                };

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "EXEC sp_DeleteAcademicYear @AcademicYearID, @Output OUTPUT",
                    new SqlParameter("@AcademicYearID", id),
                    outputParameter);

                var result = outputParameter.Value?.ToString();

                if (result == "Success")
                {
                    return Ok(new { message = "Academic year deleted successfully" });
                }

                return BadRequest(new { message = result ?? "Failed to delete academic year" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting academic year", error = ex.Message });
            }
        }
    }

    #region Models

    public class CreateAcademicYearBO
    {
        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("start_date")]
        public DateTime StartDate { get; set; }

        [JsonPropertyName("end_date")]
        public DateTime EndDate { get; set; }

        [JsonPropertyName("is_current")]
        public bool? IsCurrent { get; set; }
    }

    public class UpdateAcademicYearBO
    {
        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("start_date")]
        public DateTime? StartDate { get; set; }

        [JsonPropertyName("end_date")]
        public DateTime? EndDate { get; set; }

        [JsonPropertyName("is_active")]
        public bool? IsActive { get; set; }
    }

    #endregion
}
