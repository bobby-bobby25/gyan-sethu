using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using StudenthubAPI.Data;
using StudenthubAPI.Models;
using StudenthubAPI.BO;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Data;

namespace StudenthubAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TeacherAssignmentsController : ControllerBase
    {
        private readonly DataContext _context;
        public TeacherAssignmentsController(DataContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] TeacherAssignmentBO assignment)
        {
            var output = new SqlParameter("@Output", SqlDbType.NVarChar, 50) { Direction = ParameterDirection.Output };
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_CreateTeacherAssignment @TeacherID, @AcademicYearID, @ClusterID, @ProgramID, @Role, @IsActive, @Output OUTPUT",
                new SqlParameter("@TeacherID", assignment.teacher_id),
                new SqlParameter("@AcademicYearID", assignment.academic_year_id),
                new SqlParameter("@ClusterID", assignment.cluster_id),
                new SqlParameter("@ProgramID", assignment.program_id),
                new SqlParameter("@Role", assignment.role ?? "backup"),
                new SqlParameter("@IsActive", assignment.IsActive),
                output
            );
            var result = output.Value?.ToString();
            if (result == "Success")
                return Ok(new { message = "Teacher assignment created successfully" });
            return BadRequest(new { message = "Failed to create teacher assignment" });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] TeacherAssignmentBO assignment)
        {
            var output = new SqlParameter("@Output", SqlDbType.NVarChar, 50) { Direction = ParameterDirection.Output };
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_UpdateTeacherAssignment @TeacherAssignmentID, @TeacherID, @AcademicYearID, @ClusterID, @ProgramID, @Role, @IsActive, @Output OUTPUT",
                new SqlParameter("@TeacherAssignmentID", id),
                new SqlParameter("@TeacherID", assignment.teacher_id),
                new SqlParameter("@AcademicYearID", assignment.academic_year_id),
                new SqlParameter("@ClusterID", assignment.cluster_id),
                new SqlParameter("@ProgramID", assignment.program_id),
                new SqlParameter("@Role", assignment.role ?? "backup"),
                new SqlParameter("@IsActive", assignment.IsActive),
                output
            );
            var result = output.Value?.ToString();
            if (result == "Success")
                return Ok(new { message = "Teacher assignment updated successfully" });
            return BadRequest(new { message = "Failed to update teacher assignment" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var output = new SqlParameter("@Output", SqlDbType.NVarChar, 50) { Direction = ParameterDirection.Output };
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_DeleteTeacherAssignment @TeacherAssignmentID, @Output OUTPUT",
                new SqlParameter("@TeacherAssignmentID", id),
                output
            );
            var result = output.Value?.ToString();
            if (result == "Success")
                return Ok(new { message = "Teacher assignment deleted successfully" });
            return BadRequest(new { message = "Failed to delete teacher assignment" });
        }
    }
}
