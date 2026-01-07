using StudenthubAPI.Data;
using StudenthubAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace StudenthubAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MasterDataController : ControllerBase
    {
        private readonly DataContext _dataContext;

        public MasterDataController(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        [HttpGet("IdProofTypes")]
        public async Task<IActionResult> GetIdProofTypes([FromQuery] bool isActive = true)
        {
            try
            {
                var rows = await _dataContext.IDProofTypes
                    .FromSqlRaw("SELECT IDProofTypeID, Name FROM dbo.IDProofTypes WHERE 1=1")
                    .AsNoTracking()
                    .ToListAsync();

                var mapped = rows.Select(r => new
                {
                    id = r.IDProofTypeID,
                    name = r.Name
                });

                return Ok(mapped);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving id proof types", error = ex.Message });
            }
        }

        [HttpGet("CasteCategories")]
        public async Task<IActionResult> GetCasteCategories([FromQuery] bool isActive = true)
        {
            try
            {
                var rows = await _dataContext.CasteCategories
                    .FromSqlRaw("SELECT CasteCategoryID, Name, Code FROM dbo.CasteCategories WHERE 1=1")
                    .AsNoTracking()
                    .ToListAsync();

                var mapped = rows.Select(r => new
                {
                    id = r.CasteCategoryID,
                    name = r.Name,
                    code = r.Code
                });

                return Ok(mapped);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving caste categories", error = ex.Message });
            }
        }

        [HttpGet("AttendanceStatusTypes")]
        public async Task<IActionResult> GetAttendanceStatusTypes([FromQuery] bool isActive = true)
        {
            try
            {
                var rows = await _dataContext.AttendanceStatusTypes
                    .FromSqlRaw("SELECT AttendanceStatusTypeID, Name, Code FROM dbo.AttendanceStatusTypes WHERE 1=1")
                    .AsNoTracking()
                    .ToListAsync();

                var mapped = rows.Select(r => new
                {
                    id = r.AttendanceStatusTypeID,
                    name = r.Name,
                    code = r.Code
                });

                return Ok(mapped);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving attendance status types", error = ex.Message });
            }
        }

        [HttpGet("PaymentModes")]
        public async Task<IActionResult> GetPaymentModes([FromQuery] bool isActive = true)
        {
            try
            {
                var rows = await _dataContext.PaymentModes
                    .FromSqlRaw("SELECT PaymentModeID, Name FROM dbo.PaymentModes WHERE IsActive=1")
                    .AsNoTracking()
                    .ToListAsync();

                var mapped = rows.Select(r => new
                {
                    id = r.PaymentModeID,
                    name = r.Name
                });

                return Ok(mapped);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving payment mode types", error = ex.Message });
            }
        }
    }
}