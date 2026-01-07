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
    public class TeachersController : ControllerBase
    {
        private readonly DataContext _dataContext;

        public TeachersController(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        #region Get Operations

        /// <summary>
        /// Get all teachers
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllTeachers([FromQuery] bool isActive = true)
        {
            try
            {
                var teachers = await _dataContext.Set<TeacherBO>()
                    .FromSqlRaw("EXEC sp_GetAllTeachers @IsActive",
                        new SqlParameter("@IsActive", isActive))
                    .AsNoTracking()
                    .ToListAsync();

                return Ok(teachers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving teachers", error = ex.Message });
            }
        }

        /// <summary>
        /// Get a specific teacher by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTeacherById(int id)
        {
            try
            {
                var teacher = await _dataContext.Set<TeacherBO>()
                    .FromSqlRaw("EXEC sp_GetTeacherById @TeacherID",
                        new SqlParameter("@TeacherID", id))
                    .AsNoTracking()
                    .FirstOrDefaultAsync();

                if (teacher == null)
                    return NotFound(new { message = "Teacher not found" });

                return Ok(teacher);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving teacher", error = ex.Message });
            }
        }

        /// <summary>
        /// Get teacher record by linked user id
        /// </summary>
        [HttpGet("User/{userId}")]
        public async Task<IActionResult> GetTeacherByUser(int userId)
        {
            try
            {
                var teacher = await _dataContext.Set<TeacherBO>()
                    .FromSqlRaw(@"SELECT t.TeacherID, t.UserID, t.Name, t.Email, t.Phone, t.Address, t.City, t.State,
                                    t.IDNumber AS IDProofNumber, ip.Name AS IDProofType, t.IsActive, t.CreatedAt, t.UpdatedAt
                                   FROM Teachers t
                                   LEFT JOIN IDProofTypes ip ON t.IDProofTypeID = ip.IDProofTypeID
                                   WHERE t.UserID = @UserID",
                        new SqlParameter("@UserID", userId))
                    .AsNoTracking()
                    .FirstOrDefaultAsync();

                if (teacher == null)
                    return NotFound(new { message = "Teacher not found for user" });

                return Ok(teacher);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving teacher by user", error = ex.Message });
            }
        }

        /// <summary>
        /// Get teacher's active assignments for current academic year by user id
        /// </summary>
        [HttpGet("User/{userId}/Assignments")]
        public async Task<IActionResult> GetTeacherAssignmentsByUser(int userId)
        {
            try
            {
                // find teacher id
                var teacher = await _dataContext.Set<TeacherIdLookup>()
                    .FromSqlRaw("SELECT TeacherID, UserID FROM Teachers WHERE UserID = @UserID", new SqlParameter("@UserID", userId))
                    .AsNoTracking()
                    .FirstOrDefaultAsync();

                if (teacher == null)
                    return Ok(new object[0]);

                var teacherId = teacher.TeacherID;

                var assignments = new List<object>();

                var conn = (SqlConnection)_dataContext.Database.GetDbConnection();
                await conn.OpenAsync();
                try
                {
                    using (var cmd = conn.CreateCommand())
                    {
                        cmd.CommandText = @"SELECT ta.TeacherAssignmentID AS Id, ta.TeacherID AS TeacherId, ta.ClusterID AS ClusterId,
                                                    ta.ProgramID AS ProgramId, ta.AcademicYearID AS AcademicYearId, ta.Role AS Role,
                                                    ta.IsActive AS IsActive, ta.CreatedAt AS CreatedAt, ta.UpdatedAt AS UpdatedAt,
                                                    c.ClusterID AS Cluster_Id, c.Name AS Cluster_Name,
                                                    p.ProgramID AS Program_Id, p.Name AS Program_Name,
                                                    ay.AcademicYearID AS AcademicYear_Id, ay.Name AS AcademicYear_Name
                                           FROM TeacherAssignments ta
                                           LEFT JOIN Clusters c ON ta.ClusterID = c.ClusterID
                                           LEFT JOIN Programs p ON ta.ProgramID = p.ProgramID
                                           LEFT JOIN AcademicYears ay ON ta.AcademicYearID = ay.AcademicYearID
                                           WHERE ta.TeacherID = @TeacherID AND ta.IsActive = 1 AND ay.IsActive = 1
                                           ORDER BY ta.CreatedAt DESC";
                        cmd.Parameters.Add(new SqlParameter("@TeacherID", teacherId));

                        using (var reader = await cmd.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                var id = reader["Id"] == DBNull.Value ? 0 : Convert.ToInt32(reader["Id"]);
                                var clusterId = reader["ClusterId"] == DBNull.Value ? 0 : Convert.ToInt32(reader["ClusterId"]);
                                var programId = reader["ProgramId"] == DBNull.Value ? 0 : Convert.ToInt32(reader["ProgramId"]);
                                var academicYearId = reader["AcademicYearId"] == DBNull.Value ? 0 : Convert.ToInt32(reader["AcademicYearId"]);
                                var role = reader["Role"] == DBNull.Value ? null : reader["Role"].ToString();
                                var isActive = reader["IsActive"] == DBNull.Value ? false : Convert.ToBoolean(reader["IsActive"]);
                                var createdAt = reader["CreatedAt"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(reader["CreatedAt"]);
                                var updatedAt = reader["UpdatedAt"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(reader["UpdatedAt"]);

                                var clusterName = reader["Cluster_Name"] == DBNull.Value ? null : reader["Cluster_Name"].ToString();
                                var programName = reader["Program_Name"] == DBNull.Value ? null : reader["Program_Name"].ToString();
                                var academicYearName = reader["AcademicYear_Name"] == DBNull.Value ? null : reader["AcademicYear_Name"].ToString();

                                assignments.Add(new
                                {
                                    id = id.ToString(),
                                    teacher_id = teacherId.ToString(),
                                    cluster_id = clusterId.ToString(),
                                    program_id = programId.ToString(),
                                    academic_year_id = academicYearId.ToString(),
                                    role = role,
                                    is_active = isActive,
                                    created_at = createdAt,
                                    updated_at = updatedAt,
                                    clusters = new { id = clusterId.ToString(), name = clusterName },
                                    programs = new { id = programId.ToString(), name = programName },
                                    academic_years = new { id = academicYearId.ToString(), name = academicYearName }
                                });
                            }
                        }
                    }
                }
                finally
                {
                    await conn.CloseAsync();
                }

                return Ok(assignments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving teacher assignments", error = ex.Message });
            }
        }

        #endregion

        #region Delete Operation

        /// <summary>
        /// Delete a teacher (soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTeacher(int id)
        {
            try
            {
                var affected = await _dataContext.Database.ExecuteSqlRawAsync(
                    "UPDATE Teachers SET IsActive = 0 WHERE TeacherID = @TeacherID",
                    new SqlParameter("@TeacherID", id));

                if (affected > 0)
                {
                    return Ok(new { message = "Teacher deleted successfully" });
                }

                return NotFound(new { message = "Teacher not found" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting teacher", error = ex.Message });
            }
        }

        #endregion

        #region Create Operation

        /// <summary>
        /// Create a new teacher
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateTeacher([FromBody] CreateTeacherBO createTeacherBO)
        {
            try
            {
                var outputParameter = new SqlParameter("@Output", SqlDbType.NVarChar, 50)
                {
                    Direction = ParameterDirection.Output
                };

                var teacherIdParameter = new SqlParameter("@TeacherID", SqlDbType.Int)
                {
                    Direction = ParameterDirection.Output
                };

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "EXEC sp_InsertTeacher @UserID, @Name, @Email, @Phone, @Address, " +
                    "@City, @State, @IDProofTypeID, @IDNumber, @Output OUTPUT",
                    new SqlParameter("@UserID", (object)createTeacherBO.UserID ?? DBNull.Value),
                    new SqlParameter("@Name", createTeacherBO.Name),
                    new SqlParameter("@Email", (object)createTeacherBO.Email ?? DBNull.Value),
                    new SqlParameter("@Phone", (object)createTeacherBO.Phone ?? DBNull.Value),
                    new SqlParameter("@Address", (object)createTeacherBO.Address ?? DBNull.Value),
                    new SqlParameter("@City", (object)createTeacherBO.City ?? DBNull.Value),
                    new SqlParameter("@State", (object)createTeacherBO.State ?? DBNull.Value),
                    new SqlParameter("@IDProofTypeID", (object)createTeacherBO.IDProofTypeID ?? DBNull.Value),
                    new SqlParameter("@IDNumber", (object)createTeacherBO.IDNumber ?? DBNull.Value),
                    outputParameter);

                var result = outputParameter.Value?.ToString();

                if (result == "Success")
                {
                    return CreatedAtAction(nameof(GetTeacherById), new { id = teacherIdParameter.Value },
                        new { message = "Teacher created successfully", teacherId = teacherIdParameter.Value });
                }

                return BadRequest(new { message = "Failed to create teacher" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating teacher", error = ex.Message });
            }
        }

        #endregion

        #region Update Operation

        /// <summary>
        /// Update an existing teacher
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTeacher(int id, [FromBody] UpdateTeacherBO updateTeacherBO)
        {
            try
            {
                var outputParameter = new SqlParameter("@Output", SqlDbType.NVarChar, 50)
                {
                    Direction = ParameterDirection.Output
                };

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "EXEC sp_UpdateTeacher @TeacherID, @Name, @Email, @Phone, @Address, " +
                    "@City, @State, @IDProofTypeID, @IDNumber, @Output OUTPUT",
                    new SqlParameter("@TeacherID", id),
                    new SqlParameter("@Name", (object)updateTeacherBO.Name ?? DBNull.Value),
                    new SqlParameter("@Email", (object)updateTeacherBO.Email ?? DBNull.Value),
                    new SqlParameter("@Phone", (object)updateTeacherBO.Phone ?? DBNull.Value),
                    new SqlParameter("@Address", (object)updateTeacherBO.Address ?? DBNull.Value),
                    new SqlParameter("@City", (object)updateTeacherBO.City ?? DBNull.Value),
                    new SqlParameter("@State", (object)updateTeacherBO.State ?? DBNull.Value),
                    new SqlParameter("@IDProofTypeID", (object)updateTeacherBO.IDProofTypeID ?? DBNull.Value),
                    new SqlParameter("@IDNumber", (object)updateTeacherBO.IDNumber ?? DBNull.Value),
                    outputParameter);

                var result = outputParameter.Value?.ToString();

                if (result == "Success")
                {
                    return Ok(new { message = "Teacher updated successfully" });
                }

                return BadRequest(new { message = "Failed to update teacher" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating teacher", error = ex.Message });
            }
        }

        #endregion
    }
}
