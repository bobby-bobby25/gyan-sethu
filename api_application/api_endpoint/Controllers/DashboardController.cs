using StudenthubAPI.Data;
using StudenthubAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace StudenthubAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly DataContext _dataContext;

        public DashboardController(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        #region Get
        [HttpGet("Stats")]
        public async Task<IActionResult> Stats()
        {
            try
            {
                var sql = @"
SELECT 
    (SELECT COUNT(1) FROM dbo.Students WHERE IsActive = 1) AS TotalStudents,
    (SELECT COUNT(1) FROM dbo.Teachers WHERE IsActive = 1) AS TotalTeachers,
    (SELECT COUNT(1) FROM dbo.Donors WHERE IsActive = 1) AS TotalDonors,
    (SELECT COUNT(1) FROM dbo.AttendanceRecords WHERE AttendanceDate = CAST(GETDATE() AS DATE)) AS AttendanceToday";

                var stats = await _dataContext.DashboardStats.FromSqlRaw(sql).AsNoTracking().ToListAsync();
                return Ok(stats.FirstOrDefault() ?? new DashboardStats());
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving dashboard stats", error = ex.Message });
            }
        }

        [HttpGet("Attendance/Insights")]
        public async Task<IActionResult> AttendanceInsights([FromQuery] DateTime? date)
        {
            try
            {
                var d = date?.Date ?? DateTime.UtcNow.Date;
                var sql = $@"
SELECT c.ClusterID, c.Name AS ClusterName,
SUM(CASE WHEN ar.StatusID = 1 THEN 1 ELSE 0 END) AS PresentCount,
SUM(CASE WHEN ar.StatusID <> 1 THEN 1 ELSE 0 END) AS AbsentCount
FROM dbo.AttendanceRecords ar
INNER JOIN dbo.Students s ON ar.StudentID = s.StudentID
INNER JOIN dbo.Clusters c ON ar.ClusterID = c.ClusterID
WHERE ar.AttendanceDate = '{d:yyyy-MM-dd}'
GROUP BY c.ClusterID, c.Name";

                var insights = await _dataContext.AttendanceInsights.FromSqlRaw(sql).AsNoTracking().ToListAsync();
                return Ok(insights);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving attendance insights", error = ex.Message });
            }
        }

        [HttpGet("Attendance/Trends")]
        public async Task<IActionResult> AttendanceTrends([FromQuery] int days = 7)
        {
            try
            {
                var start = DateTime.UtcNow.Date.AddDays(-Math.Max(1, days));
                var sql = $@"
SELECT ar.AttendanceDate AS [Date],
SUM(CASE WHEN ar.StatusID = 1 THEN 1 ELSE 0 END) AS PresentCount,
SUM(CASE WHEN ar.StatusID <> 1 THEN 1 ELSE 0 END) AS AbsentCount
FROM dbo.AttendanceRecords ar
WHERE ar.AttendanceDate >= '{start:yyyy-MM-dd}'
GROUP BY ar.AttendanceDate
ORDER BY ar.AttendanceDate";

                var trends = await _dataContext.AttendanceTrends.FromSqlRaw(sql).AsNoTracking().ToListAsync();
                return Ok(trends);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving attendance trends", error = ex.Message });
            }
        }

        [HttpGet("Academic/Stats")]
        public async Task<IActionResult> AcademicStats([FromQuery] int? academicYearId = null)
        {
            try
            {
                using var conn = new SqlConnection(_dataContext.connectionString);
                await conn.OpenAsync();

                // Total records, average attendance/result
                var sql = @"SELECT COUNT(1) AS TotalRecords,
ISNULL(AVG(sar.AttendancePercentage),0) AS AverageAttendance,
ISNULL(AVG(sar.ResultPercentage),0) AS AverageResult
FROM dbo.StudentAcademicRecords sar
WHERE (@academicYearId IS NULL OR sar.AcademicYearID = @academicYearId)";

                using var cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@academicYearId", (object)academicYearId ?? DBNull.Value);

                using var rdr = await cmd.ExecuteReaderAsync();
                var result = new Dictionary<string, object>();
                if (await rdr.ReadAsync())
                {
                    result["totalRecords"] = rdr.GetInt32(0);
                    result["averageAttendance"] = rdr.IsDBNull(1) ? 0 : rdr.GetDecimal(1);
                    result["averageResult"] = rdr.IsDBNull(2) ? 0 : rdr.GetDecimal(2);
                }

                // studentsByCluster
                var clusters = new List<object>();
                rdr.Close();
                var sql2 = @"SELECT c.Name, COUNT(1) AS Cnt FROM dbo.StudentAcademicRecords sar
INNER JOIN dbo.Clusters c ON sar.ClusterID = c.ClusterID
WHERE (@academicYearId IS NULL OR sar.AcademicYearID = @academicYearId)
GROUP BY c.Name";
                using var cmd2 = new SqlCommand(sql2, conn);
                cmd2.Parameters.AddWithValue("@academicYearId", (object)academicYearId ?? DBNull.Value);
                using var rdr2 = await cmd2.ExecuteReaderAsync();
                while (await rdr2.ReadAsync())
                {
                    clusters.Add(new { name = rdr2.GetString(0), count = rdr2.GetInt32(1) });
                }
                rdr2.Close();

                // studentsByProgram
                var programs = new List<object>();
                var sql3 = @"SELECT p.Name, COUNT(1) AS Cnt FROM dbo.StudentAcademicRecords sar
INNER JOIN dbo.Programs p ON sar.ProgramID = p.ProgramID
WHERE (@academicYearId IS NULL OR sar.AcademicYearID = @academicYearId)
GROUP BY p.Name";
                using var cmd3 = new SqlCommand(sql3, conn);
                cmd3.Parameters.AddWithValue("@academicYearId", (object)academicYearId ?? DBNull.Value);
                using var rdr3 = await cmd3.ExecuteReaderAsync();
                while (await rdr3.ReadAsync())
                {
                    programs.Add(new { name = rdr3.GetString(0), count = rdr3.GetInt32(1) });
                }

                return Ok(new { totalRecords = result.GetValueOrDefault("totalRecords", 0), averageAttendance = result.GetValueOrDefault("averageAttendance", 0), averageResult = result.GetValueOrDefault("averageResult", 0), studentsByCluster = clusters, studentsByProgram = programs });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving academic stats", error = ex.Message });
            }
        }

        [HttpGet("Donor/Stats")]
        public async Task<IActionResult> DonorStats()
        {
            try
            {
                using var conn = new SqlConnection(_dataContext.connectionString);
                await conn.OpenAsync();

                var sql = @"SELECT COUNT(1) AS TotalDonors, ISNULL(SUM(dn.Amount),0) AS TotalAmount FROM dbo.Donors d
LEFT JOIN dbo.Donations dn ON d.DonorID = dn.DonorID";
                using var cmd = new SqlCommand(sql, conn);
                using var rdr = await cmd.ExecuteReaderAsync();
                var summary = new { totalDonors = 0, totalAmount = 0M };
                if (await rdr.ReadAsync())
                {
                    summary = new { totalDonors = rdr.GetInt32(0), totalAmount = rdr.GetDecimal(1) };
                }
                rdr.Close();

                var donorsByType = new List<object>();
                var sql2 = @"SELECT d.DonorType, COUNT(1) AS Cnt FROM dbo.Donors d GROUP BY d.DonorType";
                using var cmd2 = new SqlCommand(sql2, conn);
                using var rdr2 = await cmd2.ExecuteReaderAsync();
                while (await rdr2.ReadAsync()) donorsByType.Add(new { name = rdr2.GetString(0), value = rdr2.GetInt32(1), color = "#888" });
                rdr2.Close();

                var recent = new List<object>();
                var sql3 = @"SELECT TOP 5 dn.DonationID, d.Name AS DonorName, dn.Amount, dn.DonationDate FROM dbo.Donations dn INNER JOIN dbo.Donors d ON dn.DonorID = d.DonorID ORDER BY dn.DonationDate DESC";
                using var cmd3 = new SqlCommand(sql3, conn);
                using var rdr3 = await cmd3.ExecuteReaderAsync();
                while (await rdr3.ReadAsync()) recent.Add(new { id = rdr3.GetInt32(0), donor_name = rdr3.GetString(1), amount = rdr3.GetDecimal(2), date = rdr3.GetDateTime(3).ToString("o") });

                return Ok(new { totalDonors = summary.totalDonors, totalAmount = summary.totalAmount, donorsByType, recentDonations = recent });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving donor stats", error = ex.Message });
            }
        }

        [HttpGet("Attendance/Stats")]
        public async Task<IActionResult> AttendanceStats()
        {
            try
            {
                using var conn = new SqlConnection(_dataContext.connectionString);
                await conn.OpenAsync();

                var today = DateTime.UtcNow.Date;
                var sql = @"SELECT COUNT(1) AS TotalRecords, SUM(CASE WHEN ar.StatusID = 1 THEN 1 ELSE 0 END) AS PresentCount, SUM(CASE WHEN ar.StatusID <> 1 THEN 1 ELSE 0 END) AS AbsentCount FROM dbo.AttendanceRecords ar WHERE ar.AttendanceDate = @today";
                using var cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@today", today);
                using var rdr = await cmd.ExecuteReaderAsync();
                var total = 0; var present = 0; var absent = 0;
                if (await rdr.ReadAsync()) { total = rdr.GetInt32(0); present = rdr.IsDBNull(1) ? 0 : rdr.GetInt32(1); absent = rdr.IsDBNull(2) ? 0 : rdr.GetInt32(2); }
                rdr.Close();

                var byCluster = new List<object>();
                var sql2 = @"SELECT c.Name, SUM(CASE WHEN ar.StatusID = 1 THEN 1 ELSE 0 END) * 1.0 / NULLIF(COUNT(1),0) AS Attendance FROM dbo.AttendanceRecords ar INNER JOIN dbo.Clusters c ON ar.ClusterID = c.ClusterID WHERE ar.AttendanceDate = @today GROUP BY c.Name";
                using var cmd2 = new SqlCommand(sql2, conn);
                cmd2.Parameters.AddWithValue("@today", today);
                using var rdr2 = await cmd2.ExecuteReaderAsync();
                while (await rdr2.ReadAsync()) byCluster.Add(new { name = rdr2.GetString(0), attendance = rdr2.IsDBNull(1) ? 0 : Math.Round(Convert.ToDecimal(rdr2.GetDouble(1)) * 100, 1) });

                return Ok(new { totalRecords = total, presentCount = present, absentCount = absent, attendanceByCluster = byCluster });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving attendance stats", error = ex.Message });
            }
        }

        [HttpGet("RecentActivity")]
        public async Task<IActionResult> RecentActivity()
        {
            try
            {
                using var conn = new SqlConnection(_dataContext.connectionString);
                await conn.OpenAsync();

                var sql = @"SELECT TOP 20 AuditLogID, TableName, Action, ChangedAt FROM dbo.AuditLogs ORDER BY ChangedAt DESC";
                using var cmd = new SqlCommand(sql, conn);
                using var rdr = await cmd.ExecuteReaderAsync();
                var list = new List<object>();
                while (await rdr.ReadAsync()) list.Add(new { id = rdr.GetInt32(0), type = rdr.GetString(1), message = rdr.GetString(2), time = rdr.GetDateTime(3).ToString("o") });

                return Ok(list);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving recent activity", error = ex.Message });
            }
        }

        [HttpGet("Unified/Stats")]
        public async Task<IActionResult> UnifiedStats([FromQuery] int? academicYearId = null)
        {
            try
            {
                using var conn = new SqlConnection(_dataContext.connectionString);
                await conn.OpenAsync();

                var sql = @"SELECT COUNT(DISTINCT s.StudentID) AS Students, COUNT(DISTINCT t.TeacherID) AS Teachers, COUNT(DISTINCT d.DonorID) AS Donors, ISNULL(SUM(dn.Amount),0) AS TotalDonations FROM dbo.Students s LEFT JOIN dbo.StudentAcademicRecords sar ON s.StudentID = sar.StudentID LEFT JOIN dbo.Teachers t ON t.IsActive = 1 LEFT JOIN dbo.Donors d ON d.IsActive = 1 LEFT JOIN dbo.Donations dn ON d.DonorID = dn.DonorID WHERE (@academicYearId IS NULL OR sar.AcademicYearID = @academicYearId)";
                using var cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@academicYearId", (object)academicYearId ?? DBNull.Value);
                using var rdr = await cmd.ExecuteReaderAsync();
                var outObj = new { students = 0, teachers = 0, donors = 0, totalDonations = 0M };
                if (await rdr.ReadAsync()) outObj = new { students = rdr.GetInt32(0), teachers = rdr.GetInt32(1), donors = rdr.GetInt32(2), totalDonations = rdr.GetDecimal(3) };

                return Ok(outObj);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving unified stats", error = ex.Message });
            }
        }

        [HttpGet("Academic/Insights")]
        public async Task<IActionResult> AcademicInsights([FromQuery] int? academicYearId = null)
        {
            try
            {
                using var conn = new SqlConnection(_dataContext.connectionString);
                await conn.OpenAsync();

                var byCluster = new List<object>();
                var sql = @"SELECT c.Name, AVG(sar.AttendancePercentage) AS AvgAttendance FROM dbo.StudentAcademicRecords sar INNER JOIN dbo.Clusters c ON sar.ClusterID = c.ClusterID WHERE (@academicYearId IS NULL OR sar.AcademicYearID = @academicYearId) GROUP BY c.Name";
                using var cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@academicYearId", (object)academicYearId ?? DBNull.Value);
                using var rdr = await cmd.ExecuteReaderAsync();
                while (await rdr.ReadAsync()) byCluster.Add(new { name = rdr.GetString(0), avgAttendance = rdr.IsDBNull(1) ? 0 : rdr.GetDecimal(1) });

                return Ok(new { byCluster });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving academic insights", error = ex.Message });
            }
        }

        [HttpGet("Donor/YearComparison")]
        public async Task<IActionResult> DonorYearComparison()
        {
            try
            {
                using var conn = new SqlConnection(_dataContext.connectionString);
                await conn.OpenAsync();

                var sql = @"SELECT YEAR(dn.DonationDate) AS Yr, ISNULL(SUM(dn.Amount),0) AS Total FROM dbo.Donations dn GROUP BY YEAR(dn.DonationDate) ORDER BY Yr";
                using var cmd = new SqlCommand(sql, conn);
                using var rdr = await cmd.ExecuteReaderAsync();
                var list = new List<object>();
                while (await rdr.ReadAsync()) list.Add(new { year = rdr.GetInt32(0), total = rdr.GetDecimal(1) });

                return Ok(list);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving donor year comparison", error = ex.Message });
            }
        }

        [HttpGet("Donation/MonthlyTrends")]
        public async Task<IActionResult> DonationMonthlyTrends()
        {
            try
            {
                using var conn = new SqlConnection(_dataContext.connectionString);
                await conn.OpenAsync();

                var sql = @"SELECT YEAR(dn.DonationDate) AS Yr, MONTH(dn.DonationDate) AS Mth, ISNULL(SUM(dn.Amount),0) AS Total FROM dbo.Donations dn GROUP BY YEAR(dn.DonationDate), MONTH(dn.DonationDate) ORDER BY Yr, Mth";
                using var cmd = new SqlCommand(sql, conn);
                using var rdr = await cmd.ExecuteReaderAsync();
                var list = new List<object>();
                while (await rdr.ReadAsync()) list.Add(new { year = rdr.GetInt32(0), month = rdr.GetInt32(1), total = rdr.GetDecimal(2) });

                return Ok(list);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving monthly donation trends", error = ex.Message });
            }
        }

        [HttpGet("ClusterProgramCombinations")]
        public async Task<IActionResult> GetClusterProgramCombinations([FromQuery] int academicYearId)
        {
            try
            {
                var result = new List<object>();
                using var conn = new SqlConnection(_dataContext.connectionString);
                await conn.OpenAsync();
                using var cmd = new SqlCommand("EXEC sp_GetClusterProgramCombinations @AcademicYearID", conn);
                cmd.Parameters.AddWithValue("@AcademicYearID", academicYearId);
                using var rdr = await cmd.ExecuteReaderAsync();
                while (await rdr.ReadAsync())
                {
                    var row = new Dictionary<string, object>();
                    for (int i = 0; i < rdr.FieldCount; i++)
                    {
                        row[rdr.GetName(i)] = rdr.GetValue(i);
                    }
                    result.Add(row);
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving cluster-program combinations", error = ex.Message });
            }
        }
        #endregion
    }
}
