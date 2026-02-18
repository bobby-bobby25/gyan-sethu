using StudenthubAPI.Data;
using StudenthubAPI.Models;
using StudenthubAPI.BO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using Azure.Core;
using Microsoft.AspNetCore.Authorization;

namespace StudenthubAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttendanceController : ControllerBase
    {
        private readonly DataContext _dataContext;

        public AttendanceController(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        #region Get Operations

        /// <summary>
        /// Get attendance records with optional filters
        /// </summary>
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAttendanceRecords(
            [FromQuery] int? studentId = null,
            [FromQuery] int? learningCentreID = null,
            [FromQuery] int? programId = null,
            [FromQuery] int? academicYearId = null,
            [FromQuery] int? statusId = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            try
            {
                var records = await _dataContext.Set<AttendanceRecordBO>()
                    .FromSqlRaw("EXEC sp_GetAttendanceRecords @StudentID, @LearningCentreID, @ProgramID, @AcademicYearID, @StatusID, @FromDate, @ToDate",
                        new SqlParameter("@StudentID", (object)studentId ?? DBNull.Value),
                        new SqlParameter("@LearningCentreID", (object)learningCentreID ?? DBNull.Value),
                        new SqlParameter("@ProgramID", (object)programId ?? DBNull.Value),
                        new SqlParameter("@AcademicYearID", (object)academicYearId ?? DBNull.Value),
                        new SqlParameter("@StatusID", (object)statusId ?? DBNull.Value),
                        new SqlParameter("@FromDate", (object)fromDate ?? DBNull.Value),
                        new SqlParameter("@ToDate", (object)toDate ?? DBNull.Value))
                    .AsNoTracking()
                    .ToListAsync();

                return Ok(records);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving attendance records", error = ex.Message });
            }
        }

        /// <summary>
        /// Get students for attendance in a specific cluster/program/academic year
        /// </summary>
        [Authorize]
        [HttpGet("Students")]
        public async Task<IActionResult> GetStudentsForAttendance(
            [FromQuery] int learningCentreId,
            [FromQuery] int programId,
            [FromQuery] int academicYearId)
        {
            try
            {
                if (learningCentreId <= 0 || programId <= 0 || academicYearId <= 0)
                    return BadRequest(new { message = "Valid learningCentreId, programId, and academicYearId are required" });

                // This query fetches students enrolled in the given cluster/program/academic year
                var students = await  _dataContext.Set<AttendanceStudentsBO>()
                               .FromSqlRaw("EXEC sp_GetStudentsForAttendance @LearningCentreID, @ProgramID, @AcademicYearID",
                                  new SqlParameter("@LearningCentreID", learningCentreId),
                                  new SqlParameter("@ProgramID", programId),
                                  new SqlParameter("@AcademicYearID", academicYearId))
                               .AsNoTracking()
                               .ToListAsync();

                if (students == null)
                    return NotFound(new { message = "Students not found for user" });

                return Ok(students);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving students", error = ex.Message });
            }
        }

        //[Authorize]
        //[HttpGet]
        //public async Task<IActionResult> GetAllGrades([FromQuery] bool isActive = true)
        //{
        //    try
        //    {
        //        var classGrades = await _dataContext.Set<GradeBO>()
        //            .FromSqlRaw("EXEC sp_GetAllGrades @IsActive",
        //                new SqlParameter("@IsActive", isActive))
        //            .AsNoTracking()
        //            .ToListAsync();

        //        return Ok(classGrades);
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, new { message = "An error occurred while retrieving clusters", error = ex.Message });
        //    }
        //}

        #endregion

        #region Create/Update Operation

        /// <summary>
        /// Create or update an attendance record
        /// </summary>
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> UpsertAttendanceRecord([FromBody] UpsertAttendanceRecordBO upsertBO)
        {
            try
            {
                var recordIdParameter = new SqlParameter("@AttendanceRecordID", SqlDbType.Int)
                {
                    Direction = ParameterDirection.Output
                };

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "EXEC sp_UpsertAttendanceRecord @StudentID, @AcademicYearID, @LearningCentreID, @ProgramID, @ClusterID," +
                    "@AttendanceDate, @StatusID, @MarkedByTeacherID, @MarkedByUserID, @Latitude, @Longitude",
                    new SqlParameter("@StudentID", upsertBO.StudentID),
                    new SqlParameter("@AcademicYearID", upsertBO.AcademicYearID),
                    new SqlParameter("@LearningCentreID", upsertBO.LearningCentreID),
                    new SqlParameter("@ProgramID", upsertBO.ProgramID),
                    new SqlParameter("@ClusterID", upsertBO.ClusterID),
                    new SqlParameter("@AttendanceDate", upsertBO.AttendanceDate),
                    new SqlParameter("@StatusID", upsertBO.StatusID),
                    new SqlParameter("@MarkedByTeacherID", (object)upsertBO.MarkedByTeacherID ?? DBNull.Value),
                    new SqlParameter("@MarkedByUserID", (object)upsertBO.MarkedByUserID ?? DBNull.Value),
                    new SqlParameter("@Latitude", (object)upsertBO.Latitude ?? DBNull.Value),
                    new SqlParameter("@Longitude", (object)upsertBO.Longitude ?? DBNull.Value));

                return Ok(new { message = "Attendance record saved successfully", recordId = recordIdParameter.Value });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while saving attendance record", error = ex.Message });
            }
        }

        /// <summary>
        /// Bulk upsert attendance records
        /// </summary>
        [Authorize]
        [HttpPost("Bulk")]
        public async Task<IActionResult> BulkUpsertAttendanceRecords([FromBody] BulkUpsertAttendanceRequest request)
        {
            try
            {
                if (request.Records == null || !request.Records.Any())
                    return BadRequest(new { message = "Records are required" });

                var records = request.Records;

                int successCount = 0;
                int errorCount = 0;
                var errors = new List<string>();

                foreach (var record in records)
                {
                    try
                    {
                        await _dataContext.Database.ExecuteSqlRawAsync(
                            "EXEC sp_UpsertAttendanceRecord @StudentID, @AcademicYearID, @LearningCentreID, @ProgramID, @ClusterID," +
                            "@AttendanceDate, @StatusID, @MarkedByTeacherID, @MarkedByUserID, @Latitude, @Longitude",
                            new SqlParameter("@StudentID", record.StudentID),
                            new SqlParameter("@AcademicYearID", record.AcademicYearID),
                            new SqlParameter("@LearningCentreID", record.LearningCentreID),
                            new SqlParameter("@ProgramID", record.ProgramID),
                            new SqlParameter("@ClusterID", record.ClusterID),
                            new SqlParameter("@AttendanceDate", record.AttendanceDate),
                            new SqlParameter("@StatusID", record.StatusID),
                            new SqlParameter("@MarkedByTeacherID", (object)record.MarkedByTeacherID ?? DBNull.Value),
                            new SqlParameter("@MarkedByUserID", (object)record.MarkedByUserID ?? DBNull.Value),
                            new SqlParameter("@Latitude", (object)record.Latitude ?? DBNull.Value),
                            new SqlParameter("@Longitude", (object)record.Longitude ?? DBNull.Value));

                        successCount++;
                    }
                    catch (Exception ex)
                    {
                        errorCount++;
                        errors.Add($"Student {record.StudentID} on {record.AttendanceDate}: {ex.Message}");
                    }
                }

                return Ok(new
                {
                    message = $"Bulk attendance upsert completed. Success: {successCount}, Failed: {errorCount}",
                    successCount,
                    errorCount,
                    errors = errors.Count > 0 ? errors : null
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while bulk upserting attendance records", error = ex.Message });
            }
        }

        #endregion
    }
}
