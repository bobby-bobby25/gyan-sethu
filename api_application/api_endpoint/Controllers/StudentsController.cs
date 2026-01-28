using StudenthubAPI.Data;
using StudenthubAPI.Models;
using StudenthubAPI.BO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Authorization;

namespace StudenthubAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudentsController : ControllerBase
    {
        private readonly DataContext _dataContext;

        public StudentsController(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        #region Get Operations

        /// <summary>
        /// Get all students with optional filters
        /// </summary>

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAllStudents(
            string? search = null,
            [FromQuery] int? clusterId = null,
            [FromQuery] int? programId = null,
            [FromQuery] bool isActive = true)
        {
            try
            {
                var students = await _dataContext.Set<StudentBO>()
                    .FromSqlRaw("EXEC sp_GetAllStudents @SearchTerm, @ClusterID, @ProgramID, @IsActive",
                        new SqlParameter("@SearchTerm", (object)search ?? DBNull.Value),
                        new SqlParameter("@ClusterID", (object)clusterId ?? DBNull.Value),
                        new SqlParameter("@ProgramID", (object)programId ?? DBNull.Value),
                        new SqlParameter("@IsActive", isActive))
                    .AsNoTracking()
                    .ToListAsync();

                return Ok(students);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving students", error = ex.Message });
            }
        }

        /// <summary>
        /// Get a specific student by ID
        /// </summary>
        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetStudentById(int id)
        {
            try
            {
                var student = await _dataContext.Set<StudentBO>()
                    .FromSqlRaw("EXEC sp_GetStudentById @StudentID",
                        new SqlParameter("@StudentID", id))
                    .AsNoTracking()
                    .FirstOrDefaultAsync();

                if (student == null)
                    return NotFound(new { message = "Student not found" });

                return Ok(student);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving student", error = ex.Message });
            }
        }

        /// <summary>
        /// Get family members for a specific student
        /// </summary>
        [Authorize]
        [HttpGet("{studentId}/FamilyMembers")]
        public async Task<IActionResult> GetStudentFamilyMembers(int studentId)
        {
            try
            {
                var familyMembers = await _dataContext.Database.SqlQueryRaw<dynamic>(
                    "SELECT FamilyMemberID as id, StudentID as student_id, Name as name, " +
                    "Relationship as relationship, Phone as phone, IDProofTypeID as id_proof_type_id, " +
                    "IDNumber as id_number, DateOfBirth as date_of_birth, Occupation as occupation, " +
                    "AnnualIncome as annual_income, Address as address, City as city, State as state, " +
                    "BankName as bank_name, BankAccountNumber as bank_account_number, " +
                    "IsActive as is_active FROM dbo.FamilyMembers WHERE StudentID = @StudentID AND IsActive = 1",
                    new SqlParameter("@StudentID", studentId))
                .ToListAsync();

                return Ok(familyMembers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving family members", error = ex.Message });
            }
        }

        private string NormalizeHobbies(object hobbies)
        {
            if (hobbies is string[] arr)
                return string.Join(", ", arr);

            if (hobbies is string str)
                return str;

            return null;
        }

        #endregion

        #region Create Operation

        /// <summary>
        /// Create a new student
        /// </summary>
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateStudent([FromBody] CreateStudentBO createStudentBO)
        {
            try
            {
                var outputParameter = new SqlParameter("@Output", SqlDbType.NVarChar, 50)
                {
                    Direction = ParameterDirection.Output
                };

                var studentIdParameter = new SqlParameter("@StudentID", SqlDbType.Int)
                {
                    Direction = ParameterDirection.Output
                };

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "EXEC sp_InsertStudent @Name, @DateOfBirth, @Gender, @Email, @Phone, @Ambition, @Hobbies, @Notes, @IDProofTypeID, @IDNumber, " +
                    "@Address, @City, @State, @CasteID, @StudentID OUTPUT, @Output OUTPUT",
                    new SqlParameter("@Name", createStudentBO.Name),
                    new SqlParameter("@DateOfBirth", (object)createStudentBO.DateOfBirth ?? DBNull.Value),
                    new SqlParameter("@Gender", (object)createStudentBO.Gender ?? DBNull.Value),
                    new SqlParameter("@Email", (object)createStudentBO.Email ?? DBNull.Value),
                    new SqlParameter("@Phone", (object)createStudentBO.Phone ?? DBNull.Value),
                    new SqlParameter("@Ambition", (object)createStudentBO.Ambition ?? DBNull.Value),
                    new SqlParameter("@Hobbies", (object)NormalizeHobbies(createStudentBO.Hobbies) ?? DBNull.Value),
                    new SqlParameter("@Notes", (object)createStudentBO.Notes ?? DBNull.Value),
                    new SqlParameter("@IDProofTypeID", (object)createStudentBO.IDProofTypeID ?? DBNull.Value),
                    new SqlParameter("@IDNumber", (object)createStudentBO.IDNumber ?? DBNull.Value),
                    new SqlParameter("@Address", (object)createStudentBO.Address ?? DBNull.Value),
                    new SqlParameter("@City", (object)createStudentBO.City ?? DBNull.Value),
                    new SqlParameter("@State", (object)createStudentBO.State ?? DBNull.Value),
                    new SqlParameter("@CasteID", (object)createStudentBO.CasteID ?? DBNull.Value),
                    studentIdParameter,
                    outputParameter);

                var result = outputParameter.Value?.ToString();
                var studentId = studentIdParameter.Value != DBNull.Value ? (int)studentIdParameter.Value : 0;

                if (result == "Success" && studentId > 0)
                {
                    return CreatedAtAction(nameof(GetStudentById), new { id = studentId }, 
                        new { message = "Student created successfully", studentId = studentId });
                }

                return BadRequest(new { message = "Failed to create student" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating student", error = ex.Message });
            }
        }
        #endregion

        #region Put Operation
        [Authorize]
        [HttpPut("{id}/Photo")]
        public async Task<IActionResult> UpdateStudentPhoto(int id, [FromBody] UpdatePhotoRequest request)
        {
            await _dataContext.Database.ExecuteSqlRawAsync(
                "UPDATE Students SET PhotoDocumentId = @DocumentID WHERE StudentID = @StudentID",
                new SqlParameter("@DocumentID", request.DocumentId),
                new SqlParameter("@StudentID", id)
            );

            return Ok(new { message = "Student photo updated" });
        }

        #endregion

        #region Update Operation

        /// <summary>
        /// Update an existing student
        /// </summary>
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStudent(int id, [FromBody] UpdateStudentBO updateStudentBO)
        {
            try
            {
                var outputParameter = new SqlParameter("@Output", SqlDbType.NVarChar, 50)
                {
                    Direction = ParameterDirection.Output
                };

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "EXEC sp_UpdateStudent @StudentID,@Name, @DateOfBirth, @Gender, @Email, @Phone, @Ambition, @Hobbies, @Notes, @IDProofTypeID, @IDNumber, " +
                    "@Address, @City, @State, @CasteID, @Output OUTPUT",
                    new SqlParameter("@StudentID", id),
                    new SqlParameter("@Name", (object)updateStudentBO.Name ?? DBNull.Value),
                    new SqlParameter("@DateOfBirth", (object)updateStudentBO.DateOfBirth ?? DBNull.Value),
                    new SqlParameter("@Gender", (object)updateStudentBO.Gender ?? DBNull.Value),
                    new SqlParameter("@Email", (object)updateStudentBO.Email ?? DBNull.Value),
                    new SqlParameter("@Phone", (object)updateStudentBO.Phone ?? DBNull.Value),
                    new SqlParameter("@Ambition", (object)updateStudentBO.Ambition ?? DBNull.Value),
                    new SqlParameter("@Hobbies", (object)NormalizeHobbies(updateStudentBO.Hobbies) ?? DBNull.Value),
                    new SqlParameter("@Notes", (object)updateStudentBO.Notes ?? DBNull.Value),
                    new SqlParameter("@IDProofTypeID", (object)updateStudentBO.IDProofTypeID ?? DBNull.Value),
                    new SqlParameter("@IDNumber", (object)updateStudentBO.IDNumber ?? DBNull.Value),
                    new SqlParameter("@Address", (object)updateStudentBO.Address ?? DBNull.Value),
                    new SqlParameter("@City", (object)updateStudentBO.City ?? DBNull.Value),
                    new SqlParameter("@State", (object)updateStudentBO.State ?? DBNull.Value),
                    new SqlParameter("@CasteID", (object)updateStudentBO.CasteID ?? DBNull.Value),
                    outputParameter);

                var result = outputParameter.Value?.ToString();

                if (result == "Success")
                {
                    return Ok(new { message = "Student updated successfully" });
                }

                return BadRequest(new { message = "Failed to update student" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating student", error = ex.Message });
            }
        }

        #endregion

        #region Delete Operation

        /// <summary>
        /// Delete a student (soft delete)
        /// </summary>
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStudent(int id)
        {
            try
            {
                var outputParameter = new SqlParameter("@Output", SqlDbType.NVarChar, 50)
                {
                    Direction = ParameterDirection.Output
                };

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "EXEC sp_DeleteStudent @StudentID, @Output OUTPUT",
                    new SqlParameter("@StudentID", id),
                    outputParameter);

                var result = outputParameter.Value?.ToString();

                if (result == "Success")
                {
                    return Ok(new { message = "Student deleted successfully" });
                }

                return BadRequest(new { message = "Failed to delete student" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting student", error = ex.Message });
            }
        }

        #endregion

        #region Academic Records
        [Authorize]
        [HttpGet("{studentId}/AcademicRecords")]
        public async Task<IActionResult> GetAcademicRecords(int studentId)
        {
            try
            {
                var records = await _dataContext.StudentAcademicRecords.FromSqlRaw("EXEC sp_GetStudentAcademicRecords @StudentID",
                        new SqlParameter("@StudentID", studentId))
                    .AsNoTracking()
                    .ToListAsync();

                return Ok(records);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "An error occurred while fetching academic records",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Create a new academic record for a student
        /// </summary>
        [Authorize]
        [HttpPost("AcademicRecords")]
        public async Task<IActionResult> CreateAcademicRecord([FromBody] CreateAcademicRecordBO model)
        {
            try
            {
                var outputParameter = new SqlParameter("@Output", SqlDbType.NVarChar, 50)
                {
                    Direction = ParameterDirection.Output
                };

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "EXEC sp_InsertStudentAcademicRecord @StudentID, @AcademicYearID, @ClusterID, @ProgramID, @SchoolName, @ClassGrade, @AttendancePercentage, @ResultPercentage, @YearlyFees, @Remarks, @IsActive, @Output OUTPUT",
                    new SqlParameter("@StudentID", model.StudentID),
                    new SqlParameter("@AcademicYearID", model.AcademicYearID),
                    new SqlParameter("@ClusterID", model.ClusterID),
                    new SqlParameter("@ProgramID", model.ProgramID),
                    new SqlParameter("@SchoolName", (object)model.SchoolName ?? DBNull.Value),
                    new SqlParameter("@ClassGrade", (object)model.ClassGrade ?? DBNull.Value),
                    new SqlParameter("@AttendancePercentage", (object)model.AttendancePercentage ?? DBNull.Value),
                    new SqlParameter("@ResultPercentage", (object)model.ResultPercentage ?? DBNull.Value),
                    new SqlParameter("@YearlyFees", (object)model.YearlyFees ?? DBNull.Value),
                    new SqlParameter("@Remarks", (object)model.Remarks ?? DBNull.Value),
                    new SqlParameter("@IsActive", model.IsActive),
                    outputParameter);

                var result = outputParameter.Value?.ToString();
                if (result == "Success")
                {
                    return Ok(new { message = "Academic record created successfully" });
                }
                return BadRequest(new { message = result ?? "Failed to create academic record" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating academic record", error = ex.Message });
            }
        }

        /// <summary>
        /// Update an existing academic record for a student
        /// </summary>
        [Authorize]
        [HttpPut("AcademicRecords/{id}")]
        public async Task<IActionResult> UpdateAcademicRecord(int id, [FromBody] UpdateAcademicRecordBO model)
        {
            try
            {
                var outputParameter = new SqlParameter("@Output", SqlDbType.NVarChar, 50)
                {
                    Direction = ParameterDirection.Output
                };

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "EXEC sp_UpdateStudentAcademicRecord @StudentAcademicRecordID, @StudentID, @AcademicYearID, @ClusterID, @ProgramID, @SchoolName, @ClassGrade, @AttendancePercentage, @ResultPercentage, @YearlyFees, @Remarks, @IsActive, @Output OUTPUT",
                    new SqlParameter("@StudentAcademicRecordID", id),
                    new SqlParameter("@StudentID", model.StudentID),
                    new SqlParameter("@AcademicYearID", model.AcademicYearID),
                    new SqlParameter("@ClusterID", model.ClusterID),
                    new SqlParameter("@ProgramID", model.ProgramID),
                    new SqlParameter("@SchoolName", (object)model.SchoolName ?? DBNull.Value),
                    new SqlParameter("@ClassGrade", (object)model.ClassGrade ?? DBNull.Value),
                    new SqlParameter("@AttendancePercentage", (object)model.AttendancePercentage ?? DBNull.Value),
                    new SqlParameter("@ResultPercentage", (object)model.ResultPercentage ?? DBNull.Value),
                    new SqlParameter("@YearlyFees", (object)model.YearlyFees ?? DBNull.Value),
                    new SqlParameter("@Remarks", (object)model.Remarks ?? DBNull.Value),
                    new SqlParameter("@IsActive", model.IsActive),
                    outputParameter);

                var result = outputParameter.Value?.ToString();
                if (result == "Success")
                {
                    return Ok(new { message = "Academic record updated successfully" });
                }
                return BadRequest(new { message = result ?? "Failed to update academic record" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating academic record", error = ex.Message });
            }
        }

        [Authorize]
        [HttpDelete("AcademicRecords/{id}")]
        public async Task<IActionResult> DeleteStudentAcademicRecord(int id)
        {
            try
            {
                var outputParameter = new SqlParameter("@Output", SqlDbType.NVarChar, 50)
                {
                    Direction = ParameterDirection.Output
                };

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "EXEC sp_DeleteStudentAcademicRecords @StudentAcademicRecordID, @Output OUTPUT",
                    new SqlParameter("@StudentAcademicRecordID", id),
                    outputParameter);

                var result = outputParameter.Value?.ToString();

                if (result == "Success")
                {
                    return Ok(new { message = "Record deleted successfully" });
                }

                return BadRequest(new { message = "Failed to delete student" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting student", error = ex.Message });
            }
        }

        #endregion

    }
}
