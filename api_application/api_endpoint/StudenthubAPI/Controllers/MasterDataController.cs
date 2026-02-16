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

        [Authorize]
        [HttpGet("Subjects")]
        public async Task<IActionResult> GetSubjects([FromQuery] bool isActive = true)
        {
            try
            {
                var rows = await _dataContext.Subjects
                    .FromSqlRaw("SELECT SubjectID, Name, Code FROM dbo.Subjects WHERE 1=1 AND IsActive=1")
                    .AsNoTracking()
                    .ToListAsync();

                var mapped = rows.Select(r => new
                {
                    id = r.SubjectID,
                    name = r.Name,
                    code = r.Code
                });

                return Ok(mapped);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving subjects", error = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("SchoolTypes")]
        public async Task<IActionResult> GetSchoolTypes([FromQuery] bool isActive = true)
        {
            try
            {
                var rows = await _dataContext.SchoolTypes
                    .FromSqlRaw("SELECT SchoolTypeID, Name, Code FROM dbo.SchoolTypes WHERE 1=1")
                    .AsNoTracking()
                    .ToListAsync();

                var mapped = rows.Select(r => new
                {
                    id = r.SchoolTypeID,
                    name = r.Name,
                    code = r.Code
                });

                return Ok(mapped);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving school types", error = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("Mediums")]
        public async Task<IActionResult> GetMediums([FromQuery] bool isActive = true)
        {
            try
            {
                var rows = await _dataContext.Mediums
                    .FromSqlRaw("SELECT MediumID, Name, Code FROM dbo.Mediums WHERE 1=1")
                    .AsNoTracking()
                    .ToListAsync();

                var mapped = rows.Select(r => new
                {
                    id = r.MediumID,
                    name = r.Name,
                    code = r.Code
                });

                return Ok(mapped);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving mediums", error = ex.Message });
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

        [Authorize]
        [HttpPost("Subjects")]
        public async Task<IActionResult> CreateSubject([FromBody] TeacherSubjectInput input)
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
                    "INSERT INTO dbo.Subjects (Name, Code, Description) VALUES (@Name, @Code, @Description); SET @Id = SCOPE_IDENTITY();",
                    new SqlParameter("@Name", input.name),
                    new SqlParameter("@Code", input.code ?? ""),
                    new SqlParameter("@Description", input.description ?? (object)DBNull.Value),
                    idParameter);

                var newId = (int)idParameter.Value;
                return CreatedAtAction(nameof(GetSubjects), new { }, new { id = newId, name = input.name, code = input.code });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating subject", error = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("SchoolTypes")]
        public async Task<IActionResult> CreateSchoolType([FromBody] SchoolTypeInput input)
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
                    "INSERT INTO dbo.SchoolTypes (Name, Code) VALUES (@Name, @Code); SET @Id = SCOPE_IDENTITY();",
                    new SqlParameter("@Name", input.name),
                    new SqlParameter("@Code", input.code ?? ""),
                    idParameter);

                var newId = (int)idParameter.Value;
                return CreatedAtAction(nameof(GetSchoolTypes), new { }, new { id = newId, name = input.name, code = input.code });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating school type", error = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("Mediums")]
        public async Task<IActionResult> CreateMedium([FromBody] StudentMediumInput input)
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
                    "INSERT INTO dbo.Mediums (Name, Code) VALUES (@Name, @Code); SET @Id = SCOPE_IDENTITY();",
                    new SqlParameter("@Name", input.name),
                    new SqlParameter("@Code", input.code ?? ""),
                    idParameter);

                var newId = (int)idParameter.Value;
                return CreatedAtAction(nameof(GetMediums), new { }, new { id = newId, name = input.name, code = input.code });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating medium", error = ex.Message });
            }
        }
        #endregion

        #region Put
        [Authorize]
        [HttpPut("IdProofTypes/{id}")]
        public async Task<IActionResult> UpdateIdProofType(int id, [FromBody] IdProofTypeInput input)
        {
            try
            {
                if (input == null || string.IsNullOrEmpty(input.name))
                    return BadRequest(new { message = "Name is required" });

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "UPDATE dbo.IDProofTypes SET Name = @Name WHERE IDProofTypeID = @Id",
                    new SqlParameter("@Id", id),
                    new SqlParameter("@Name", input.name));

                return Ok(new { message = "ID proof type updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating ID proof type", error = ex.Message });
            }
        }

        [Authorize]
        [HttpPut("CasteCategories/{id}")]
        public async Task<IActionResult> UpdateCasteCategory(int id, [FromBody] CasteCategoryInput input)
        {
            try
            {
                if (input == null || string.IsNullOrEmpty(input.name))
                    return BadRequest(new { message = "Name is required" });

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "UPDATE dbo.CasteCategories SET Name = @Name, Code = @Code WHERE CasteCategoryID = @Id",
                    new SqlParameter("@Id", id),
                    new SqlParameter("@Name", input.name),
                    new SqlParameter("@Code", input.code ?? ""));

                return Ok(new { message = "Caste category updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating caste category", error = ex.Message });
            }
        }

        [Authorize]
        [HttpPut("AttendanceStatusTypes/{id}")]
        public async Task<IActionResult> UpdateAttendanceStatusType(int id, [FromBody] AttendanceStatusTypeInput input)
        {
            try
            {
                if (input == null || string.IsNullOrEmpty(input.name))
                    return BadRequest(new { message = "Name is required" });

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "UPDATE dbo.AttendanceStatusTypes SET Name = @Name, Code = @Code WHERE AttendanceStatusTypeID = @Id",
                    new SqlParameter("@Id", id),
                    new SqlParameter("@Name", input.name),
                    new SqlParameter("@Code", input.code ?? ""));

                return Ok(new { message = "Attendance status type updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating attendance status type", error = ex.Message });
            }
        }

        [Authorize]
        [HttpPut("PaymentModes/{id}")]
        public async Task<IActionResult> UpdatePaymentMode(int id, [FromBody] PaymentModeInput input)
        {
            try
            {
                if (input == null || string.IsNullOrEmpty(input.name))
                    return BadRequest(new { message = "Name is required" });

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "UPDATE dbo.PaymentModes SET Name = @Name WHERE PaymentModeID = @Id",
                    new SqlParameter("@Id", id),
                    new SqlParameter("@Name", input.name));

                return Ok(new { message = "Payment mode updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating payment mode", error = ex.Message });
            }
        }

        [Authorize]
        [HttpPut("Cities/{id}")]
        public async Task<IActionResult> UpdateCity(Guid id, [FromBody] CityInput input)
        {
            try
            {
                if (input == null || string.IsNullOrEmpty(input.name) || string.IsNullOrEmpty(input.state))
                    return BadRequest(new { message = "Name and State are required" });

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "UPDATE dbo.Cities SET Name = @Name, State = @State WHERE Id = @Id",
                    new SqlParameter("@Id", id),
                    new SqlParameter("@Name", input.name),
                    new SqlParameter("@State", input.state));

                return Ok(new { message = "City updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating city", error = ex.Message });
            }
        }

        [Authorize]
        [HttpPut("Ambitions/{id}")]
        public async Task<IActionResult> UpdateAmbition(Guid id, [FromBody] AmbitionInput input)
        {
            try
            {
                if (input == null || string.IsNullOrEmpty(input.name))
                    return BadRequest(new { message = "Name is required" });

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "UPDATE dbo.Ambitions SET Name = @Name WHERE Id = @Id",
                    new SqlParameter("@Id", id),
                    new SqlParameter("@Name", input.name));

                return Ok(new { message = "Ambition updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating ambition", error = ex.Message });
            }
        }

        [Authorize]
        [HttpPut("Hobbies/{id}")]
        public async Task<IActionResult> UpdateHobby(Guid id, [FromBody] HobbyInput input)
        {
            try
            {
                if (input == null || string.IsNullOrEmpty(input.name))
                    return BadRequest(new { message = "Name is required" });

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "UPDATE dbo.Hobbies SET Name = @Name WHERE Id = @Id",
                    new SqlParameter("@Id", id),
                    new SqlParameter("@Name", input.name));

                return Ok(new { message = "Hobby updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating hobby", error = ex.Message });
            }
        }

        [Authorize]
        [HttpPut("Subjects/{id}")]
        public async Task<IActionResult> UpdateSubject(int id, [FromBody] TeacherSubjectInput input)
        {
            try
            {
                if (input == null || string.IsNullOrEmpty(input.name))
                    return BadRequest(new { message = "Name is required" });

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "UPDATE dbo.Subjects SET Name = @Name, Code = @Code, Description = @Description WHERE SubjectID = @Id",
                    new SqlParameter("@Id", id),
                    new SqlParameter("@Name", input.name),
                    new SqlParameter("@Code", input.code ?? ""),
                    new SqlParameter("@Description", input.description ?? (object)DBNull.Value));

                return Ok(new { message = "Subject updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating subject", error = ex.Message });
            }
        }

        [Authorize]
        [HttpPut("SchoolTypes/{id}")]
        public async Task<IActionResult> UpdateSchoolType(int id, [FromBody] SchoolTypeInput input)
        {
            try
            {
                if (input == null || string.IsNullOrEmpty(input.name))
                    return BadRequest(new { message = "Name is required" });

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "UPDATE dbo.SchoolTypes SET Name = @Name, Code = @Code WHERE SchoolTypeID = @Id",
                    new SqlParameter("@Id", id),
                    new SqlParameter("@Name", input.name),
                    new SqlParameter("@Code", input.code ?? ""));

                return Ok(new { message = "School type updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating school type", error = ex.Message });
            }
        }

        [Authorize]
        [HttpPut("Mediums/{id}")]
        public async Task<IActionResult> UpdateMedium(int id, [FromBody] StudentMediumInput input)
        {
            try
            {
                if (input == null || string.IsNullOrEmpty(input.name))
                    return BadRequest(new { message = "Name is required" });

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "UPDATE dbo.Mediums SET Name = @Name, Code = @Code WHERE MediumID = @Id",
                    new SqlParameter("@Id", id),
                    new SqlParameter("@Name", input.name),
                    new SqlParameter("@Code", input.code ?? ""));

                return Ok(new { message = "Medium updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating medium", error = ex.Message });
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

        [Authorize]
        [HttpDelete("SchoolTypes/{id}")]
        public async Task<IActionResult> DeleteSchoolType(int id)
        {
            try
            {
                await _dataContext.Database.ExecuteSqlRawAsync(
                    "DELETE FROM dbo.SchoolTypes WHERE SchoolTypeID = @Id",
                    new SqlParameter("@Id", id));
                return Ok(new { message = "School type deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting school type", error = ex.Message });
            }
        }

        [Authorize]
        [HttpDelete("Mediums/{id}")]
        public async Task<IActionResult> DeleteMedium(int id)
        {
            try
            {
                await _dataContext.Database.ExecuteSqlRawAsync(
                    "DELETE FROM dbo.Mediums WHERE MediumID = @Id",
                    new SqlParameter("@Id", id));
                return Ok(new { message = "Medium deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting medium", error = ex.Message });
            }
        }

        [Authorize]
        [HttpDelete("Subjects/{id}")]
        public async Task<IActionResult> DeleteSubject(int id)
        {
            try
            {
                await _dataContext.Database.ExecuteSqlRawAsync(
                    "DELETE FROM dbo.Subjects WHERE SubjectID = @Id",
                    new SqlParameter("@Id", id));
                return Ok(new { message = "Subject deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting subject", error = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("SearchStudents")]
        public async Task<IActionResult> SearchStudents([FromQuery] string code)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(code))
                {
                    return Ok(new List<object>());
                }

                var results = await _dataContext.Database
                    .SqlQueryRaw<dynamic>(
                        "EXEC spSearchStudentsByCode @StudentCode",
                        new SqlParameter("@StudentCode", code))
                    .AsNoTracking()
                    .ToListAsync();

                var mapped = results.Select(r => new
                {
                    id = (int)r.StudentID,
                    name = (string)r.Name,
                    student_code = (string)r.StudentCode,
                    gender = (string)r.Gender,
                    date_of_birth = (DateTime?)r.DOB,
                    email = (string)r.Email,
                    phone = (string)r.Phone
                }).ToList();

                return Ok(mapped);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error searching students", error = ex.Message });
            }
        }
        #endregion


    }
}