using StudenthubAPI.Data;
using StudenthubAPI.Models;
using StudenthubAPI.BO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Text.Json.Serialization;
using StudenthubAPI.BO;
using Microsoft.AspNetCore.Authorization;

namespace StudenthubAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FamilyMembersController : ControllerBase
    {
        private readonly DataContext _dataContext;

        public FamilyMembersController(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        #region Get Operations

        /// <summary>
        /// Get all family members for a specific student
        /// </summary>
        [Authorize]
        [HttpGet("{studentId}")]
        public async Task<IActionResult> GetFamilyMembers(int? studentId = null)
        {
            try
            {
                if (studentId.HasValue && studentId.Value <= 0)
                    return BadRequest(new { message = "Valid studentId is required" });

                var families = _dataContext.Set<FamilyMemberBO>()
                                    .FromSqlRaw("EXEC sp_GetFamilyMembers @StudentID",
                                        new SqlParameter("@StudentID", studentId))
                                     .AsNoTracking()
                                     .AsEnumerable()
                                    .ToList();

                if (families == null)
                    return NotFound(new { message = "Family not found" });

                return Ok(families);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving family members", error = ex.Message });
            }
        }

        /// <summary>
        /// Get a specific family member by ID
        /// </summary>
        [Authorize]
        [HttpGet("{id}/FamilyMember")]
        public async Task<IActionResult> GetFamilyMember(int id)
        {
            try
            {
                var familyMember = _dataContext.Set<FamilyMemberBO>()
                                    .FromSqlRaw("EXEC sp_GetFamilyMemberById @FamilyMemberID",
                                        new SqlParameter("@FamilyMemberID", id))
                                     .AsNoTracking()
                                     .AsEnumerable()
                                    .ToList();

                if (familyMember == null)
                    return NotFound(new { message = "Family member not found" });

                return Ok(familyMember);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving family member", error = ex.Message });
            }
        }

        #endregion

        #region Create Operation

        /// <summary>
        /// Create a new family member for a student
        /// </summary>
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateFamilyMember([FromBody] CreateFamilyMemberBO model)
        {
            try
            {
                if (model.StudentID <= 0)
                    return BadRequest(new { message = "Valid StudentID is required" });

                if (string.IsNullOrWhiteSpace(model.Name))
                    return BadRequest(new { message = "Name is required" });

                var outputParameter = new SqlParameter("@Output", SqlDbType.NVarChar, 50)
                {
                    Direction = ParameterDirection.Output
                };

                var idParameter = new SqlParameter("@FamilyMemberID", SqlDbType.Int)
                {
                    Direction = ParameterDirection.Output
                };

                await _dataContext.Database.ExecuteSqlRawAsync(
                    @"EXEC sp_InsertFamilyMember 
                        @StudentID, 
                        @Name, 
                        @Relationship, 
                        @Phone, 
                        @IDProofTypeID, 
                        @IDNumber,
                        @DateOfBirth,
                        @Occupation,
                        @AnnualIncome,
                        @Address,
                        @City,
                        @State,
                        @BankName,
                        @BankAccountNumber,
                        @Gender,
                        @Notes,
                        @Output OUTPUT,
                        @FamilyMemberID OUTPUT",
                    new SqlParameter("@StudentID", model.StudentID),
                    new SqlParameter("@Name", model.Name),
                    new SqlParameter("@Relationship", (object)model.Relationship ?? DBNull.Value),
                    new SqlParameter("@Phone", (object)model.Phone ?? DBNull.Value),
                    new SqlParameter("@IDProofTypeID", (object)model.IDProofTypeID ?? DBNull.Value),
                    new SqlParameter("@IDNumber", (object)model.IDNumber ?? DBNull.Value),
                    new SqlParameter("@DateOfBirth", (object)model.DateOfBirth ?? DBNull.Value),
                    new SqlParameter("@Occupation", (object)model.Occupation ?? DBNull.Value),
                    new SqlParameter("@AnnualIncome", (object)model.AnnualIncome ?? DBNull.Value),
                    new SqlParameter("@Address", (object)model.Address ?? DBNull.Value),
                    new SqlParameter("@City", (object)model.City ?? DBNull.Value),
                    new SqlParameter("@State", (object)model.State ?? DBNull.Value),
                    new SqlParameter("@BankName", (object)model.BankName ?? DBNull.Value),
                    new SqlParameter("@BankAccountNumber", (object)model.BankAccountNumber ?? DBNull.Value),
                    new SqlParameter("@Gender", (object)model.Gender ?? DBNull.Value),
                    new SqlParameter("@Notes", (object)model.Notes ?? DBNull.Value),
                    outputParameter,
                    idParameter);

                var result = outputParameter.Value?.ToString();
                if (result == "Success")
                {
                    return Ok(new { message = "Family member created successfully", familyMemberId = idParameter.Value });
                }

                return BadRequest(new { message = result ?? "Failed to create family member" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating family member", error = ex.Message });
            }
        }

        #endregion

        #region Update Operation

        /// <summary>
        /// Update an existing family member
        /// </summary>
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFamilyMember(int id, [FromBody] UpdateFamilyMemberBO model)
        {
            try
            {
                var outputParameter = new SqlParameter("@Output", SqlDbType.NVarChar, 50)
                {
                    Direction = ParameterDirection.Output
                };

                await _dataContext.Database.ExecuteSqlRawAsync(
                    @"EXEC sp_UpdateFamilyMember 
                        @FamilyMemberID,
                        @StudentID, 
                        @Name, 
                        @Relationship, 
                        @Phone, 
                        @IDProofTypeID, 
                        @IDNumber,
                        @DateOfBirth,
                        @Occupation,
                        @AnnualIncome,
                        @Address,
                        @City,
                        @State,
                        @BankName,
                        @BankAccountNumber,
                        @Gender,
                        @Notes,
                        @Output OUTPUT",
                    new SqlParameter("@FamilyMemberID", id),
                    new SqlParameter("@StudentID", (object)model.StudentID ?? DBNull.Value),
                    new SqlParameter("@Name", (object)model.Name ?? DBNull.Value),
                    new SqlParameter("@Relationship", (object)model.Relationship ?? DBNull.Value),
                    new SqlParameter("@Phone", (object)model.Phone ?? DBNull.Value),
                    new SqlParameter("@IDProofTypeID", (object)model.IDProofTypeID ?? DBNull.Value),
                    new SqlParameter("@IDNumber", (object)model.IDNumber ?? DBNull.Value),
                    new SqlParameter("@DateOfBirth", (object)model.DateOfBirth ?? DBNull.Value),
                    new SqlParameter("@Occupation", (object)model.Occupation ?? DBNull.Value),
                    new SqlParameter("@AnnualIncome", (object)model.AnnualIncome ?? DBNull.Value),
                    new SqlParameter("@Address", (object)model.Address ?? DBNull.Value),
                    new SqlParameter("@City", (object)model.City ?? DBNull.Value),
                    new SqlParameter("@State", (object)model.State ?? DBNull.Value),
                    new SqlParameter("@BankName", (object)model.BankName ?? DBNull.Value),
                    new SqlParameter("@BankAccountNumber", (object)model.BankAccountNumber ?? DBNull.Value),
                    new SqlParameter("@Gender", (object)model.Gender ?? DBNull.Value),
                    new SqlParameter("@Notes", (object)model.Notes ?? DBNull.Value),
                    outputParameter);

                var result = outputParameter.Value?.ToString();
                if (result == "Success")
                {
                    return Ok(new { message = "Family member updated successfully" });
                }

                return BadRequest(new { message = result ?? "Failed to update family member" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating family member", error = ex.Message });
            }
        }

        [Authorize]
        [HttpPut("{id}/Photo")]
        public async Task<IActionResult> UpdateFamilyMemberPhoto(int id, [FromBody] UpdatePhotoRequest request)
        {
            await _dataContext.Database.ExecuteSqlRawAsync(
                "UPDATE FamilyMembers SET PhotoDocumentId = @DocumentID WHERE FamilyMemberID = @FamilyMemberID",
                new SqlParameter("@DocumentID", request.DocumentId),
                new SqlParameter("@FamilyMemberID", id)
            );

            return Ok(new { message = "Family member photo updated" });
        }
        #endregion

        #region Delete Operation

        /// <summary>
        /// Delete a family member
        /// </summary>
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFamilyMember(int id)
        {
            try
            {
                var outputParameter = new SqlParameter("@Output", SqlDbType.NVarChar, 50)
                {
                    Direction = ParameterDirection.Output
                };

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "EXEC sp_DeleteFamilyMember @FamilyMemberID, @Output OUTPUT",
                    new SqlParameter("@FamilyMemberID", id),
                    outputParameter);

                var result = outputParameter.Value?.ToString();

                if (result == "Success")
                {
                    return Ok(new { message = "Family member deleted successfully" });
                }

                return BadRequest(new { message = result ?? "Failed to delete family member" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting family member", error = ex.Message });
            }
        }

        #endregion
    }
}
