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
        [HttpGet]
        public async Task<IActionResult> GetAttendanceRecords(
            [FromQuery] int? studentId = null,
            [FromQuery] int? clusterId = null,
            [FromQuery] int? programId = null,
            [FromQuery] int? academicYearId = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            try
            {
                var records = await _dataContext.Set<AttendanceRecordBO>()
                    .FromSqlRaw("EXEC sp_GetAttendanceRecords @StudentID, @ClusterID, @ProgramID, @AcademicYearID, @FromDate, @ToDate",
                        new SqlParameter("@StudentID", (object)studentId ?? DBNull.Value),
                        new SqlParameter("@ClusterID", (object)clusterId ?? DBNull.Value),
                        new SqlParameter("@ProgramID", (object)programId ?? DBNull.Value),
                        new SqlParameter("@AcademicYearID", (object)academicYearId ?? DBNull.Value),
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
        [HttpGet("Students")]
        public async Task<IActionResult> GetStudentsForAttendance(
            [FromQuery] int clusterId,
            [FromQuery] int programId,
            [FromQuery] int academicYearId)
        {
            try
            {
                if (clusterId <= 0 || programId <= 0 || academicYearId <= 0)
                    return BadRequest(new { message = "Valid clusterId, programId, and academicYearId are required" });

                // This query fetches students enrolled in the given cluster/program/academic year
                var students = await _dataContext.Database
                    .SqlQueryRaw<dynamic>(
                        "SELECT DISTINCT s.StudentID as id, s.Name as name, s.StudentCode as student_code " +
                        "FROM Students s " +
                        "INNER JOIN StudentAcademicRecords sar ON s.StudentID = sar.StudentID " +
                        "WHERE sar.ClusterID = {0} AND sar.ProgramID = {1} AND sar.AcademicYearID = {2} AND s.IsActive = 1 " +
                        "ORDER BY s.Name",
                        clusterId, programId, academicYearId)
                    .ToListAsync();

                return Ok(students);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving students", error = ex.Message });
            }
        }

        #endregion

        #region Create/Update Operation

        /// <summary>
        /// Create or update an attendance record
        /// </summary>
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
                    "EXEC sp_UpsertAttendanceRecord @StudentID, @AcademicYearID, @ClusterID, @ProgramID, " +
                    "@AttendanceDate, @StatusID, @MarkedByTeacherID, @MarkedByUserID, @Latitude, @Longitude",
                    new SqlParameter("@StudentID", upsertBO.StudentID),
                    new SqlParameter("@AcademicYearID", upsertBO.AcademicYearID),
                    new SqlParameter("@ClusterID", upsertBO.ClusterID),
                    new SqlParameter("@ProgramID", upsertBO.ProgramID),
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
        [HttpPost("Bulk")]
        public async Task<IActionResult> BulkUpsertAttendanceRecords([FromBody] List<UpsertAttendanceRecordBO> records)
        {
            try
            {
                if (records == null || records.Count == 0)
                    return BadRequest(new { message = "At least one attendance record is required" });

                int successCount = 0;
                int errorCount = 0;
                var errors = new List<string>();

                foreach (var record in records)
                {
                    try
                    {
                        await _dataContext.Database.ExecuteSqlRawAsync(
                            "EXEC sp_UpsertAttendanceRecord @StudentID, @AcademicYearID, @ClusterID, @ProgramID, " +
                            "@AttendanceDate, @StatusID, @MarkedByTeacherID, @MarkedByUserID, @Latitude, @Longitude",
                            new SqlParameter("@StudentID", record.StudentID),
                            new SqlParameter("@AcademicYearID", record.AcademicYearID),
                            new SqlParameter("@ClusterID", record.ClusterID),
                            new SqlParameter("@ProgramID", record.ProgramID),
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
