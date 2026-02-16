using StudenthubAPI.Data;
using StudenthubAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using StudenthubAPI.BO;
using Microsoft.AspNetCore.Authorization;

namespace StudenthubAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly DataContext _dataContext;

        public ReportsController(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        /// <summary>
        /// Get attendance report with date range and optional cluster/program filters
        /// </summary>
        [Authorize]
        [HttpGet("Attendance")]
        public async Task<IActionResult> GetAttendanceReport(
            [FromQuery] string startDate,
            [FromQuery] string endDate,
            [FromQuery] int? learningCentreId = null,
            [FromQuery] int? programId = null)
        {
            try
            {
                var records = await _dataContext.Set<AttendanceReportBO>()
                    .FromSqlRaw("EXEC sp_GetAttendanceReport @StartDate, @EndDate, @LearningCentreID, @ProgramID",
                        new SqlParameter("@StartDate", (object)startDate ?? DBNull.Value),
                        new SqlParameter("@EndDate", (object)endDate ?? DBNull.Value),
                        new SqlParameter("@LearningCentreID", (object)learningCentreId ?? DBNull.Value),
                        new SqlParameter("@ProgramID", (object)programId ?? DBNull.Value))
                    .AsNoTracking()
                    .ToListAsync();

                return Ok(records);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving attendance report", error = ex.Message });
            }
        }

        /// <summary>
        /// Get academic performance report by student
        /// </summary>
        [Authorize]
        [HttpGet("Academic")]
        public async Task<IActionResult> GetAcademicReport(
            [FromQuery] int? clusterId = null,
            [FromQuery] int? programId = null,
            [FromQuery] int? academicYearId = null)
        {
            try
            {
                string sql = @"
                    SELECT 
                        sar.StudentAcademicRecordID as id,
                        s.StudentID as student_id,
                        s.Name as student_name,
                        s.StudentCode as student_code,
                        c.Name as cluster_name,
                        p.Name as program_name,
                        ay.Name as academic_year_name,
                        sar.AttendancePercentage as attendance_percentage,
                        sar.ResultPercentage as result_percentage,
                        sar.ClassGrade as class_grade,
                        sar.SchoolName as school_name,
                        sar.YearlyFees as yearly_fees
                    FROM dbo.StudentAcademicRecords sar
                    INNER JOIN dbo.Students s ON sar.StudentID = s.StudentID
                    INNER JOIN dbo.Clusters c ON sar.ClusterID = c.ClusterID
                    INNER JOIN dbo.Programs p ON sar.ProgramID = p.ProgramID
                    INNER JOIN dbo.AcademicYears ay ON sar.AcademicYearID = ay.AcademicYearID
                    WHERE sar.IsActive = 1";

                var parameters = new List<SqlParameter>();

                if (clusterId.HasValue && clusterId.Value > 0)
                {
                    sql += " AND sar.ClusterID = @ClusterID";
                    parameters.Add(new SqlParameter("@ClusterID", clusterId.Value));
                }

                if (programId.HasValue && programId.Value > 0)
                {
                    sql += " AND sar.ProgramID = @ProgramID";
                    parameters.Add(new SqlParameter("@ProgramID", programId.Value));
                }

                if (academicYearId.HasValue && academicYearId.Value > 0)
                {
                    sql += " AND sar.AcademicYearID = @AcademicYearID";
                    parameters.Add(new SqlParameter("@AcademicYearID", academicYearId.Value));
                }

                sql += " ORDER BY s.Name";

                var records = await _dataContext.Database
                    .SqlQueryRaw<dynamic>(sql, parameters.ToArray())
                    .ToListAsync();

                return Ok(new { records = records });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving academic report", error = ex.Message });
            }
        }

        /// <summary>
        /// Get donor donations report
        /// </summary>
        [Authorize]
        [HttpGet("Donations")]
        public async Task<IActionResult> GetDonationsReport(
            [FromQuery] string startDate = null,
            [FromQuery] string endDate = null,
            [FromQuery] int? donorId = null)
        {
            try
            {
                string sql = @"
                    SELECT 
                        d.DonationID as id,
                        d.DonorID as donor_id,
                        donor.Name as donor_name,
                        d.Amount as amount,
                        d.DonationDate as donation_date,
                        pm.Name as payment_mode,
                        d.ReferenceNumber as reference_number,
                        d.Currency as currency,
                        d.Notes as notes,
                        d.Remarks as remarks
                    FROM dbo.Donations d
                    INNER JOIN dbo.Donors donor ON d.DonorID = donor.DonorID
                    LEFT JOIN dbo.PaymentModes pm ON d.PaymentModeID = pm.PaymentModeID
                    WHERE d.IsActive = 1";

                var parameters = new List<SqlParameter>();

                if (!string.IsNullOrEmpty(startDate) && DateTime.TryParse(startDate, out var start))
                {
                    sql += " AND d.DonationDate >= @StartDate";
                    parameters.Add(new SqlParameter("@StartDate", start.Date));
                }

                if (!string.IsNullOrEmpty(endDate) && DateTime.TryParse(endDate, out var end))
                {
                    sql += " AND d.DonationDate <= @EndDate";
                    parameters.Add(new SqlParameter("@EndDate", end.Date));
                }

                if (donorId.HasValue && donorId.Value > 0)
                {
                    sql += " AND d.DonorID = @DonorID";
                    parameters.Add(new SqlParameter("@DonorID", donorId.Value));
                }

                sql += " ORDER BY d.DonationDate DESC";

                var records = await _dataContext.Database
                    .SqlQueryRaw<dynamic>(sql, parameters.ToArray())
                    .ToListAsync();

                return Ok(new { records = records });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving donations report", error = ex.Message });
            }
        }
    }
}
