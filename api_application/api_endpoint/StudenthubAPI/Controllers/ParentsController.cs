using StudenthubAPI.Data;
using StudenthubAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace StudenthubAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ParentsController : ControllerBase
    {
        private readonly DataContext _dataContext;

        public ParentsController(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        #region Get Operations

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAllParents([FromQuery] bool isActive = true)
        {
            try
            {
                var parents = await _dataContext.Set<Parent>()
                    .FromSqlRaw("EXEC spGetParents @IsActive",
                        new SqlParameter("@IsActive", isActive))
                    .AsNoTracking()
                    .ToListAsync();

                return Ok(parents);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving parents", error = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("ByStudent/{studentId}")]
        public async Task<IActionResult> GetParentsByStudent(int studentId)
        {
            try
            {
                var parents = await _dataContext.Set<StudentParent>()
                    .FromSqlRaw("EXEC spGetParentsByStudentId @StudentId",
                        new SqlParameter("@StudentId", studentId))
                    .AsNoTracking()
                    .ToListAsync();

                return Ok(parents);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving parents", error = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("Siblings/{studentId}")]
        public async Task<IActionResult> GetSiblings(int studentId)
        {
            try
            {
                var siblings = await _dataContext.Set<StudentSibling>()
                    .FromSqlRaw("EXEC spGetSiblingsByStudentId @StudentId",
                        new SqlParameter("@StudentId", studentId))
                    .AsNoTracking()
                    .ToListAsync();

                return Ok(siblings);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving siblings", error = ex.Message });
            }
        }

        #endregion

        #region Create Operations

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateParent([FromBody] dynamic request)
        {
            try
            {
                if (request == null)
                    return BadRequest(new { message = "Request body is required" });

                // Generate parent code
                var timestamp = DateTimeOffset.Now.ToUnixTimeSeconds();
                var parentCode = $"P{timestamp}";

                var result = await _dataContext.Database.ExecuteSqlRawAsync(
                    "EXEC spCreateParent @ParentCode, @Name, @Relationship, @Email, @Phone, @Occupation, @Address, @City, @State, @AnnualIncome, @BankName, @BankAccountNumber, @IDProofTypeID, @IDNumber, @Notes",
                    new SqlParameter("@ParentCode", parentCode),
                    new SqlParameter("@Name", request.name),
                    new SqlParameter("@Relationship", request.relationship),
                    new SqlParameter("@Email", (object)request.email ?? DBNull.Value),
                    new SqlParameter("@Phone", (object)request.phone ?? DBNull.Value),
                    new SqlParameter("@Occupation", (object)request.occupation ?? DBNull.Value),
                    new SqlParameter("@Address", (object)request.address ?? DBNull.Value),
                    new SqlParameter("@City", (object)request.city ?? DBNull.Value),
                    new SqlParameter("@State", (object)request.state ?? DBNull.Value),
                    new SqlParameter("@AnnualIncome", (object)request.annual_income ?? DBNull.Value),
                    new SqlParameter("@BankName", (object)request.bank_name ?? DBNull.Value),
                    new SqlParameter("@BankAccountNumber", (object)request.bank_account_number ?? DBNull.Value),
                    new SqlParameter("@IDProofTypeID", (object)request.id_proof_type_id ?? DBNull.Value),
                    new SqlParameter("@IDNumber", (object)request.id_number ?? DBNull.Value),
                    new SqlParameter("@Notes", (object)request.notes ?? DBNull.Value));

                return Ok(new { message = "Parent created successfully", id = result, parentCode = parentCode });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating parent", error = ex.Message });
            }
        }

        #endregion

        #region Linking Operations

        [Authorize]
        [HttpPost("Link")]
        public async Task<IActionResult> LinkParentToStudent([FromBody] dynamic request)
        {
            try
            {
                if (request == null || request.student_id == null || request.parent_id == null)
                    return BadRequest(new { message = "student_id and parent_id are required" });

                var isPrimary = request.is_primary ?? true;

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "EXEC spLinkParentToStudent @StudentId, @ParentId, @IsPrimary",
                    new SqlParameter("@StudentId", request.student_id),
                    new SqlParameter("@ParentId", request.parent_id),
                    new SqlParameter("@IsPrimary", isPrimary));

                return Ok(new { message = "Parent linked to student successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error linking parent to student", error = ex.Message });
            }
        }

        #endregion
    }
}
