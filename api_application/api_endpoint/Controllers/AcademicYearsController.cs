using StudenthubAPI.Data;
using StudenthubAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;

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
    }
}
