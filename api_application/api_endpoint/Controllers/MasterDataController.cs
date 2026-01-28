using StudenthubAPI.Data;
using StudenthubAPI.Models;
using StudenthubAPI.BO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using Microsoft.AspNetCore.Authorization;

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

        #region Get
        [Authorize]
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

        [Authorize]
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

        [Authorize]
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

        [Authorize]
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

        [Authorize]
        [HttpGet("Cities")]
        public async Task<IActionResult> GetCities()
        {
            try
            {
                var rows = await _dataContext.Cities
                    .FromSqlRaw("SELECT Id, Name, State, IsActive, CreatedAt FROM dbo.Cities WHERE IsActive=1")
                    .AsNoTracking()
                    .ToListAsync();

                var mapped = rows.Select(r => new
                {
                    id = r.Id,
                    name = r.Name,
                    state = r.State
                });

                return Ok(mapped);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving cities", error = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("States")]
        public async Task<IActionResult> GetStates()
        {
            try
            {
                var states = await _dataContext.Cities.FromSqlRaw(
                        @"SELECT DISTINCT State 
                  FROM dbo.Cities 
                  WHERE IsActive = 1 AND State IS NOT NULL"
                    )
                    .AsNoTracking()
                    .Select(x => x.State)
                    .ToListAsync();

                return Ok(states);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Error retrieving states",
                    error = ex.Message
                });
            }
        }

        [Authorize]
        [HttpGet("Ambitions")]
        public async Task<IActionResult> GetAmbitions()
        {
            try
            {
                var rows = await _dataContext.Ambitions
                    .FromSqlRaw("SELECT Id, Name, IsActive, CreatedAt FROM dbo.Ambitions WHERE IsActive=1")
                    .AsNoTracking()
                    .ToListAsync();

                var mapped = rows.Select(r => new
                {
                    id = r.Id,
                    name = r.Name
                });

                return Ok(mapped);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving ambitions", error = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("Hobbies")]
        public async Task<IActionResult> GetHobbies()
        {
            try
            {
                var rows = await _dataContext.Hobbies
                    .FromSqlRaw("SELECT Id, Name, IsActive, CreatedAt FROM dbo.Hobbies WHERE IsActive=1")
                    .AsNoTracking()
                    .ToListAsync();

                var mapped = rows.Select(r => new
                {
                    id = r.Id,
                    name = r.Name
                });

                return Ok(mapped);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving hobbies", error = ex.Message });
            }
        }
        #endregion

        #region Post
        [Authorize]
        [HttpPost("IdProofTypes")]
        public async Task<IActionResult> CreateIdProofType([FromBody] IdProofTypeInput input)
        {
            try
            {
                if (input == null || string.IsNullOrEmpty(input.name))
                    return BadRequest(new { message = "Name is required" });

                var idParameter = new SqlParameter("@Id", System.Data.SqlDbType.Int)
                {
                    Direction = System.Data.ParameterDirection.Output
                };

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "INSERT INTO dbo.IDProofTypes (Name) VALUES (@Name); SET @Id = SCOPE_IDENTITY();",
                    new SqlParameter("@Name", input.name),
                    idParameter);

                var newId = (int)idParameter.Value;
                return CreatedAtAction(nameof(GetIdProofTypes), new { }, new { id = newId, name = input.name });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating ID proof type", error = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("CasteCategories")]
        public async Task<IActionResult> CreateCasteCategory([FromBody] CasteCategoryInput input)
        {
            try
            {
                if (input == null || string.IsNullOrEmpty(input.name))
                    return BadRequest(new { message = "Name is required" });

                var idParameter = new SqlParameter("@Id", System.Data.SqlDbType.Int)
                {
                    Direction = System.Data.ParameterDirection.Output
                };

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "INSERT INTO dbo.CasteCategories (Name, Code) VALUES (@Name, @Code); SET @Id = SCOPE_IDENTITY();",
                    new SqlParameter("@Name", input.name),
                    new SqlParameter("@Code", input.code ?? ""),
                    idParameter);

                var newId = (int)idParameter.Value;
                return CreatedAtAction(nameof(GetCasteCategories), new { }, new { id = newId, name = input.name, code = input.code });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating caste category", error = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("AttendanceStatusTypes")]
        public async Task<IActionResult> CreateAttendanceStatusType([FromBody] AttendanceStatusTypeInput input)
        {
            try
            {
                if (input == null || string.IsNullOrEmpty(input.name))
                    return BadRequest(new { message = "Name is required" });

                var idParameter = new SqlParameter("@Id", System.Data.SqlDbType.Int)
                {
                    Direction = System.Data.ParameterDirection.Output
                };

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "INSERT INTO dbo.AttendanceStatusTypes (Name, Code) VALUES (@Name, @Code); SET @Id = SCOPE_IDENTITY();",
                    new SqlParameter("@Name", input.name),
                    new SqlParameter("@Code", input.code ?? ""),
                    idParameter);

                var newId = (int)idParameter.Value;
                return CreatedAtAction(nameof(GetAttendanceStatusTypes), new { }, new { id = newId, name = input.name, code = input.code });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating attendance status type", error = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("PaymentModes")]
        public async Task<IActionResult> CreatePaymentMode([FromBody] PaymentModeInput input)
        {
            try
            {
                if (input == null || string.IsNullOrEmpty(input.name))
                    return BadRequest(new { message = "Name is required" });

                var idParameter = new SqlParameter("@Id", System.Data.SqlDbType.Int)
                {
                    Direction = System.Data.ParameterDirection.Output
                };

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "INSERT INTO dbo.PaymentModes (Name) VALUES (@Name); SET @Id = SCOPE_IDENTITY();",
                    new SqlParameter("@Name", input.name),
                    idParameter);

                var newId = (int)idParameter.Value;
                return CreatedAtAction(nameof(GetPaymentModes), new { }, new { id = newId, name = input.name });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating payment mode", error = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("Cities")]
        public async Task<IActionResult> CreateCity([FromBody] CityInput input)
        {
            try
            {
                if (input == null || string.IsNullOrEmpty(input.name) || string.IsNullOrEmpty(input.state))
                    return BadRequest(new { message = "Name and State are required" });

                var newId = Guid.NewGuid();

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "INSERT INTO dbo.Cities (Id, Name, State, IsActive, CreatedAt) VALUES (@Id, @Name, @State, 1, SYSDATETIME())",
                    new SqlParameter("@Id", newId),
                    new SqlParameter("@Name", input.name),
                    new SqlParameter("@State", input.state));

                return CreatedAtAction(nameof(GetCities), new { }, new { id = newId, name = input.name, state = input.state });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating city", error = ex.Message });
            }
        }

        //[HttpPost("States")]
        //public async Task<IActionResult> CreateState([FromBody] StateInput input)
        //{
        //    try
        //    {
        //        if (input == null || string.IsNullOrEmpty(input.name))
        //            return BadRequest(new { message = "Name is required" });

        //        var newId = Guid.NewGuid();

        //        await _dataContext.Database.ExecuteSqlRawAsync(
        //            "INSERT INTO dbo.States (Id, Name, Code, IsActive, CreatedAt) VALUES (@Id, @Name, @Code, 1, SYSDATETIME())",
        //            new SqlParameter("@Id", newId),
        //            new SqlParameter("@Name", input.name),
        //            new SqlParameter("@Code", input.code ?? ""));

        //        return CreatedAtAction(nameof(GetStates), new { }, new { id = newId, name = input.name, code = input.code });
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, new { message = "Error creating state", error = ex.Message });
        //    }
        //}

        [Authorize]
        [HttpPost("Ambitions")]
        public async Task<IActionResult> CreateAmbition([FromBody] AmbitionInput input)
        {
            try
            {
                if (input == null || string.IsNullOrEmpty(input.name))
                    return BadRequest(new { message = "Name is required" });

                var newId = Guid.NewGuid();

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "INSERT INTO dbo.Ambitions (Id, Name, IsActive, CreatedAt) VALUES (@Id, @Name, 1, SYSDATETIME())",
                    new SqlParameter("@Id", newId),
                    new SqlParameter("@Name", input.name));

                return CreatedAtAction(nameof(GetAmbitions), new { }, new { id = newId, name = input.name });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating ambition", error = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("Hobbies")]
        public async Task<IActionResult> CreateHobby([FromBody] HobbyInput input)
        {
            try
            {
                if (input == null || string.IsNullOrEmpty(input.name))
                    return BadRequest(new { message = "Name is required" });

                var newId = Guid.NewGuid();

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "INSERT INTO dbo.Hobbies (Id, Name, IsActive, CreatedAt) VALUES (@Id, @Name, 1, SYSDATETIME())",
                    new SqlParameter("@Id", newId),
                    new SqlParameter("@Name", input.name));

                return CreatedAtAction(nameof(GetHobbies), new { }, new { id = newId, name = input.name });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating hobby", error = ex.Message });
            }
        }
        #endregion

        #region Delete
        [Authorize]
        [HttpDelete("IdProofTypes/{id}")]
        public async Task<IActionResult> DeleteIdProofType(int id)
        {
            try
            {
                await _dataContext.Database.ExecuteSqlRawAsync(
                    "DELETE FROM dbo.IDProofTypes WHERE IDProofTypeID = @Id",
                    new SqlParameter("@Id", id));
                return Ok(new { message = "ID proof type deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting ID proof type", error = ex.Message });
            }
        }

        [Authorize]
        [HttpDelete("CasteCategories/{id}")]
        public async Task<IActionResult> DeleteCasteCategory(int id)
        {
            try
            {
                await _dataContext.Database.ExecuteSqlRawAsync(
                    "DELETE FROM dbo.CasteCategories WHERE CasteCategoryID = @Id",
                    new SqlParameter("@Id", id));
                return Ok(new { message = "Caste category deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting caste category", error = ex.Message });
            }
        }

        [Authorize]
        [HttpDelete("AttendanceStatusTypes/{id}")]
        public async Task<IActionResult> DeleteAttendanceStatusType(int id)
        {
            try
            {
                await _dataContext.Database.ExecuteSqlRawAsync(
                    "DELETE FROM dbo.AttendanceStatusTypes WHERE AttendanceStatusTypeID = @Id",
                    new SqlParameter("@Id", id));
                return Ok(new { message = "Attendance status type deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting attendance status type", error = ex.Message });
            }
        }

        [Authorize]
        [HttpDelete("PaymentModes/{id}")]
        public async Task<IActionResult> DeletePaymentMode(int id)
        {
            try
            {
                await _dataContext.Database.ExecuteSqlRawAsync(
                    "DELETE FROM dbo.PaymentModes WHERE PaymentModeID = @Id",
                    new SqlParameter("@Id", id));
                return Ok(new { message = "Payment mode deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting payment mode", error = ex.Message });
            }
        }

        [Authorize]
        [HttpDelete("Cities/{id}")]
        public async Task<IActionResult> DeleteCity(Guid id)
        {
            try
            {
                await _dataContext.Database.ExecuteSqlRawAsync(
                    "DELETE FROM dbo.Cities WHERE Id = @Id",
                    new SqlParameter("@Id", id));
                return Ok(new { message = "City deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting city", error = ex.Message });
            }
        }

        //[HttpDelete("States/{id}")]
        //public async Task<IActionResult> DeleteState(Guid id)
        //{
        //    try
        //    {
        //        await _dataContext.Database.ExecuteSqlRawAsync(
        //            "DELETE FROM dbo.States WHERE Id = @Id",
        //            new SqlParameter("@Id", id));
        //        return Ok(new { message = "State deleted successfully" });
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, new { message = "Error deleting state", error = ex.Message });
        //    }
        //}

        [Authorize]
        [HttpDelete("Ambitions/{id}")]
        public async Task<IActionResult> DeleteAmbition(Guid id)
        {
            try
            {
                await _dataContext.Database.ExecuteSqlRawAsync(
                    "DELETE FROM dbo.Ambitions WHERE Id = @Id",
                    new SqlParameter("@Id", id));
                return Ok(new { message = "Ambition deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting ambition", error = ex.Message });
            }
        }

        [Authorize]
        [HttpDelete("Hobbies/{id}")]
        public async Task<IActionResult> DeleteHobby(Guid id)
        {
            try
            {
                await _dataContext.Database.ExecuteSqlRawAsync(
                    "DELETE FROM dbo.Hobbies WHERE Id = @Id",
                    new SqlParameter("@Id", id));
                return Ok(new { message = "Hobby deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting hobby", error = ex.Message });
            }
        }
        #endregion


    }
}