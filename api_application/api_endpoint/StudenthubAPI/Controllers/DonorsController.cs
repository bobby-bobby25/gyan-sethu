using StudenthubAPI.Data;
using StudenthubAPI.Models;
using StudenthubAPI.BO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using Microsoft.AspNetCore.Authorization;

namespace StudenthubAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DonorsController : ControllerBase
    {
        private readonly DataContext _dataContext;

        public DonorsController(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        #region Get Operations

        /// <summary>
        /// Get all donors
        /// </summary>
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAllDonors([FromQuery] bool isActive = true)
        {
            try
            {
                var donorsRaw = await _dataContext.Database.ExecuteSqlRawAsync("EXEC sp_GetAllDonorsWithDonations");
                // Use ADO.NET to read JSON donations column and parse
                var donors = new List<dynamic>();
                using (var conn = _dataContext.Database.GetDbConnection())
                {
                    await conn.OpenAsync();
                    using (var cmd = conn.CreateCommand())
                    {
                        cmd.CommandText = "EXEC sp_GetAllDonorsWithDonations";
                        using (var reader = await cmd.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                var donor = new Dictionary<string, object>();
                                for (int i = 0; i < reader.FieldCount; i++)
                                {
                                    var name = reader.GetName(i);
                                    var value = reader.GetValue(i);
                                    if (name == "donations" && value != DBNull.Value)
                                    {
                                        donor["donations"] = System.Text.Json.JsonSerializer.Deserialize<List<object>>(value.ToString());
                                    }
                                    else
                                    {
                                        donor[name] = value;
                                    }
                                }
                                donors.Add(donor);
                            }
                        }
                    }
                }
                return Ok(donors);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving donors", error = ex.Message });
            }
        }

        /// <summary>
        /// Get a specific donor by ID
        /// </summary>
        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetDonorById(int id)
        {
            try
            {
                var donor = await _dataContext.Set<DonorBO>()
                    .FromSqlRaw("EXEC sp_GetDonorById @DonorID",
                        new SqlParameter("@DonorID", id))
                    .AsNoTracking()
                    .FirstOrDefaultAsync();

                if (donor == null)
                    return NotFound(new { message = "Donor not found" });

                return Ok(donor);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving donor", error = ex.Message });
            }
        }

        #endregion

        #region Create Operation

        /// <summary>
        /// Create a new donor
        /// </summary>
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateDonor([FromBody] CreateDonorBO createDonorBO)
        {
            try
            {
                var outputParameter = new SqlParameter("@Output", SqlDbType.NVarChar, 50)
                {
                    Direction = ParameterDirection.Output
                };

                var donorIdParameter = new SqlParameter("@DonorID", SqlDbType.Int)
                {
                    Direction = ParameterDirection.Output
                };

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "EXEC sp_InsertDonor @Name, @DateOfBirth, @IDProofTypeID, @IDNumber, @Company, @DonorType, " +
                    "@Email, @Phone, @Address, @City, @State, @DonorID OUTPUT, @Output OUTPUT",
                    new SqlParameter("@Name", createDonorBO.Name),
                    new SqlParameter("@DateOfBirth", (object)createDonorBO.DateOfBirth ?? DBNull.Value),
                    new SqlParameter("@IDProofTypeID", (object)createDonorBO.IDProofTypeID ?? DBNull.Value),
                    new SqlParameter("@IDNumber", (object)createDonorBO.IDNumber ?? DBNull.Value),
                    new SqlParameter("@Company", (object)createDonorBO.Company ?? DBNull.Value),
                    new SqlParameter("@DonorType", (object)createDonorBO.DonorType ?? DBNull.Value),
                    new SqlParameter("@Email", (object)createDonorBO.Email ?? DBNull.Value),
                    new SqlParameter("@Phone", (object)createDonorBO.Phone ?? DBNull.Value),
                    new SqlParameter("@Address", (object)createDonorBO.Address ?? DBNull.Value),
                    new SqlParameter("@City", (object)createDonorBO.City ?? DBNull.Value),
                    new SqlParameter("@State", (object)createDonorBO.State ?? DBNull.Value),
                    donorIdParameter,
                    outputParameter);

                var result = outputParameter.Value?.ToString();
                var donorId = donorIdParameter.Value != DBNull.Value ? (int)donorIdParameter.Value : 0;

                if (result == "Success" && donorId > 0)
                {
                    return CreatedAtAction(nameof(GetDonorById), new { id = donorId },
                        new { message = "Donor created successfully", donorId = donorId });
                }

                return BadRequest(new { message = "Failed to create donor" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating donor", error = ex.Message });
            }
        }

        #endregion

        #region Update Operation

        /// <summary>
        /// Update an existing donor
        /// </summary>
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDonor(int id, [FromBody] UpdateDonorBO updateDonorBO)
        {
            try
            {
                var outputParameter = new SqlParameter("@Output", SqlDbType.NVarChar, 50)
                {
                    Direction = ParameterDirection.Output
                };

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "EXEC sp_UpdateDonor @DonorID, @Name, @DateOfBirth, @IDProofTypeID, @IDNumber, @Company, @DonorType," +
                    "@Email, @Phone, @Address, @City, @State, @Output OUTPUT",
                    new SqlParameter("@DonorID", id),
                    new SqlParameter("@Name", (object)updateDonorBO.Name ?? DBNull.Value),
                    new SqlParameter("@DateOfBirth", (object)updateDonorBO.DateOfBirth ?? DBNull.Value),
                    new SqlParameter("@IDProofTypeID", (object)updateDonorBO.IDProofTypeID ?? DBNull.Value),
                    new SqlParameter("@IDNumber", (object)updateDonorBO.IDNumber ?? DBNull.Value),
                    new SqlParameter("@Company", (object)updateDonorBO.Company ?? DBNull.Value),
                    new SqlParameter("@DonorType", (object)updateDonorBO.DonorType ?? DBNull.Value),
                    new SqlParameter("@Email", (object)updateDonorBO.Email ?? DBNull.Value),
                    new SqlParameter("@Phone", (object)updateDonorBO.Phone ?? DBNull.Value),
                    new SqlParameter("@Address", (object)updateDonorBO.Address ?? DBNull.Value),
                    new SqlParameter("@City", (object)updateDonorBO.City ?? DBNull.Value),
                    new SqlParameter("@State", (object)updateDonorBO.State ?? DBNull.Value),
                    outputParameter);

                var result = outputParameter.Value?.ToString();

                if (result == "Success")
                {
                    return Ok(new { message = "Donor updated successfully" });
                }

                return BadRequest(new { message = "Failed to update donor" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating donor", error = ex.Message });
            }
        }

        #endregion

        #region Delete Operation

        /// <summary>
        /// Delete a donor by ID
        /// </summary>
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDonor(int id)
        {
            try
            {
                var outputParameter = new SqlParameter("@Output", SqlDbType.NVarChar, 50)
                {
                    Direction = ParameterDirection.Output
                };

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "EXEC sp_DeleteDonor @DonorID, @Output OUTPUT",
                    new SqlParameter("@DonorID", id),
                    outputParameter);

                var result = outputParameter.Value?.ToString();

                if (result == "Success")
                {
                    return Ok(new { message = "Donor deleted successfully" });
                }

                return BadRequest(new { message = "Failed to delete donor" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting donor", error = ex.Message });
            }
        }

        #endregion
    }
}
