using StudenthubAPI.Data;
using StudenthubAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using StudenthubAPI.BO;
using Microsoft.AspNetCore.Authorization;

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
        [Authorize]
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

        [Authorize]
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

        [Authorize]
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

        [Authorize]
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

        [Authorize]
        [HttpGet("Donor/Stats")]
        public async Task<IActionResult> DonorStats()
        {
            try
            {
                var result = _dataContext.Set<DonorDashboardStatsBO>().FromSqlRaw("EXEC spDashboard_GetDonorStats")
                    .AsNoTracking()
                    .AsEnumerable()
                    .FirstOrDefault();

                if (result == null)
                {
                    result = new DonorDashboardStatsBO
                    {
                        TotalDonors = 0,
                        RegularDonors = 0,
                        NewDonorsThisYear = 0,
                        AdhocDonors = 0
                    };
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving donor stats", error = ex.Message });
            }
        }

        [Authorize]
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

        [Authorize]
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

        [Authorize]
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

        [Authorize]
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

        [Authorize]
        [HttpGet("Donor/YearComparison")]
        public async Task<IActionResult> DonorYearComparison()
        {
            try
            {
                var result = _dataContext.Set<DonorYearComparisonBO>().FromSqlRaw("EXEC spDashboard_GetDonorYearComparison")
                    .AsNoTracking()
                    .AsEnumerable()
                    .FirstOrDefault();

                if (result == null)
                {
                    result = new DonorYearComparisonBO
                    {
                        LastYearTotal = 0,
                        ThisYearTotal = 0,
                        PercentageChange = 0
                    };
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving donor year comparison", error = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("Donation/MonthlyTrends")]
        public async Task<IActionResult> DonationMonthlyTrends()
        {
            try
            {
                var result = await _dataContext.Set<MonthlyDonationTrendBO>().FromSqlRaw("EXEC spDashboard_GetMonthlyDonationTrends")
                    .AsNoTracking()
                    .ToListAsync();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving monthly donation trends", error = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("LearningCentreProgramCombinations")]
        public async Task<IActionResult> GetLearningCentreProgramCombinations([FromQuery] int academicYearId)
        {
            try
            {
                var result = await _dataContext.Set<LearningCentreProgramCombinationsBO>()
                .FromSqlRaw("EXEC sp_GetLearningCentreProgramCombinations @AcademicYearID",
                    new SqlParameter("@AcademicYearID", academicYearId))
                .AsNoTracking()
                .ToListAsync();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving learningcentre-program combinations", error = ex.Message });
            }
        }

        #region Dashboard Data Endpoints

        /// <summary>
        /// Get summary statistics for dashboard
        /// </summary>
        [Authorize]
        [HttpGet("SummaryStats")]
        public async Task<IActionResult> GetSummaryStats([FromQuery] DateTime startDate, [FromQuery] DateTime endDate, [FromQuery] int? programId = null, [FromQuery] int? clusterId = null)
        {
            try
            {
                var result = _dataContext.Set<SummaryStatsBO>()
                    .FromSqlRaw("EXEC spDashboard_GetSummaryStats @StartDate, @EndDate, @ProgramId, @ClusterId",
                        new SqlParameter("@StartDate", startDate.Date),
                        new SqlParameter("@EndDate", endDate.Date),
                        new SqlParameter("@ProgramId", (object)programId ?? DBNull.Value),
                        new SqlParameter("@ClusterId", (object)clusterId ?? DBNull.Value))
                    .AsNoTracking()
                    .AsEnumerable()
                    .FirstOrDefault();

                if (result == null)
                {
                    result = new SummaryStatsBO
                    {
                        ActiveStudents = 0,
                        TotalTeachers = 0,
                        MainTeachers = 0,
                        BackupTeachers = 0,
                        Volunteers = 0,
                        ProgramWiseStudents = new List<ProgramWiseStudentBO>()
                    };
                }

                if (!string.IsNullOrEmpty(result.ProgramWiseStudentsRaw))
                {
                    result.ProgramWiseStudents = result.ProgramWiseStudentsRaw
                        .Split(',', StringSplitOptions.RemoveEmptyEntries)
                        .Select(x =>
                        {
                            var parts = x.Split('|');
                            return new ProgramWiseStudentBO
                            {
                                Program = parts[1],
                                Count = int.Parse(parts[2])
                            };
                        })
                        .ToList();
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving summary statistics", error = ex.Message });
            }
        }

        /// <summary>
        /// Get attendance statistics and trends
        /// </summary>
        [Authorize]
        [HttpGet("AttendanceStats")]
        public async Task<IActionResult> GetAttendanceStats([FromQuery] DateTime startDate, [FromQuery] DateTime endDate, [FromQuery] int? programId = null, [FromQuery] int? clusterId = null)
        {
            try
            {
                using var conn = new SqlConnection(_dataContext.connectionString);
                await conn.OpenAsync();

                var cmd = new SqlCommand("spDashboard_GetAttendanceStats", conn)
                {
                    CommandType = System.Data.CommandType.StoredProcedure
                };
                cmd.Parameters.AddWithValue("@StartDate", startDate.Date);
                cmd.Parameters.AddWithValue("@EndDate", endDate.Date);
                cmd.Parameters.AddWithValue("@ProgramId", (object)programId ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@ClusterId", (object)clusterId ?? DBNull.Value);

                var reader = await cmd.ExecuteReaderAsync();

                // First result set: overall stats
                var attendancePercentage = 0;
                var totalPresent = 0;
                var totalExpected = 0;
                var trendData = new List<AttendanceTrendBO>();

                if (await reader.ReadAsync())
                {
                    attendancePercentage = reader.IsDBNull(0) ? 0 : reader.GetInt32(0);
                    totalPresent = reader.IsDBNull(1) ? 0 : reader.GetInt32(1);
                    totalExpected = reader.IsDBNull(2) ? 0 : reader.GetInt32(2);
                }

                // Second result set: trend data
                await reader.NextResultAsync();
                while (await reader.ReadAsync())
                {
                    trendData.Add(new AttendanceTrendBO
                    {
                        Date = reader.GetString(0),
                        Percentage = reader.IsDBNull(1) ? 0 : reader.GetInt32(1)
                    });
                }

                reader.Close();

                var result = new AttendanceStatsBO
                {
                    AttendancePercentage = attendancePercentage,
                    TotalPresent = totalPresent,
                    TotalExpected = totalExpected,
                    TrendData = trendData
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving attendance statistics", error = ex.Message });
            }
        }

        /// <summary>
        /// Get teachers who were unavailable
        /// </summary>
        [Authorize]
        [HttpGet("TeachersUnavailable")]
        public async Task<IActionResult> GetTeachersUnavailable([FromQuery] DateTime startDate, [FromQuery] DateTime endDate, [FromQuery] int? programId = null, [FromQuery] int? clusterId = null)
        {
            try
            {
                var result = await _dataContext.Set<TeacherUnavailableBO>()
                    .FromSqlRaw("EXEC spDashboard_GetTeachersUnavailable @StartDate, @EndDate, @ProgramId, @ClusterId",
                        new SqlParameter("@StartDate", startDate.Date),
                        new SqlParameter("@EndDate", endDate.Date),
                        new SqlParameter("@ProgramId", (object)programId ?? DBNull.Value),
                        new SqlParameter("@ClusterId", (object)clusterId ?? DBNull.Value))
                    .AsNoTracking()
                    .ToListAsync();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving unavailable teachers", error = ex.Message });
            }
        }

        /// <summary>
        /// Get clusters needing attention
        /// </summary>
        [Authorize]
        [HttpGet("ClustersNeedingAttention")]
        public async Task<IActionResult> GetClustersNeedingAttention([FromQuery] DateTime startDate, [FromQuery] DateTime endDate, [FromQuery] int? programId = null, [FromQuery] int? clusterId = null, [FromQuery] int poorAttendanceThreshold = 75)
        {
            try
            {
                var result = await _dataContext.Set<ClusterNeedingAttentionBO>()
                    .FromSqlRaw("EXEC spDashboard_GetClustersNeedingAttention @StartDate, @EndDate, @ProgramId, @ClusterId, @PoorAttendanceThreshold",
                        new SqlParameter("@StartDate", startDate.Date),
                        new SqlParameter("@EndDate", endDate.Date),
                        new SqlParameter("@ProgramId", (object)programId ?? DBNull.Value),
                        new SqlParameter("@ClusterId", (object)clusterId ?? DBNull.Value),
                        new SqlParameter("@PoorAttendanceThreshold", poorAttendanceThreshold))
                    .AsNoTracking()
                    .ToListAsync();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving clusters needing attention", error = ex.Message });
            }
        }

        /// <summary>
        /// Get most absent students
        /// </summary>
        [Authorize]
        [HttpGet("MostAbsentStudents")]
        public async Task<IActionResult> GetMostAbsentStudents([FromQuery] DateTime startDate, [FromQuery] DateTime endDate, [FromQuery] int? programId = null, [FromQuery] int? clusterId = null, [FromQuery] int limit = 5)
        {
            try
            {
                var result = await _dataContext.Set<AbsentStudentBO>()
                    .FromSqlRaw("EXEC spDashboard_GetMostAbsentStudents @StartDate, @EndDate, @ProgramId, @ClusterId, @Limit",
                        new SqlParameter("@StartDate", startDate.Date),
                        new SqlParameter("@EndDate", endDate.Date),
                        new SqlParameter("@ProgramId", (object)programId ?? DBNull.Value),
                        new SqlParameter("@ClusterId", (object)clusterId ?? DBNull.Value),
                        new SqlParameter("@Limit", limit))
                    .AsNoTracking()
                    .ToListAsync();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving most absent students", error = ex.Message });
            }
        }

        /// <summary>
        /// Get cluster performance (best and worst performers)
        /// </summary>
        [Authorize]
        [HttpGet("ClusterPerformance")]
        public async Task<IActionResult> GetClusterPerformance([FromQuery] DateTime startDate, [FromQuery] DateTime endDate, [FromQuery] int? programId = null, [FromQuery] int? clusterId = null, [FromQuery] int limit = 5)
        {
            try
            {
                var data = await _dataContext.Set<ClusterPerformanceBO>()
                    .FromSqlRaw(
                        "EXEC spDashboard_GetClusterPerformance @StartDate, @EndDate, @ProgramId, @ClusterId, @Limit",
                        new SqlParameter("@StartDate", startDate.Date),
                        new SqlParameter("@EndDate", endDate.Date),
                        new SqlParameter("@ProgramId", (object)programId ?? DBNull.Value),
                        new SqlParameter("@ClusterId", (object)clusterId ?? DBNull.Value),
                        new SqlParameter("@Limit", limit)
                    )
                    .AsNoTracking()
                    .ToListAsync();

                var result = new ClusterPerformanceResponseBO
                {
                    BestClusters = data
                        .Where(x => x.PerformanceType == "BEST")
                        .Select(x => new ClusterPerformanceItemBO
                        {
                            ClusterName = x.ClusterName,
                            AttendancePercentage = x.AttendancePercentage
                        })
                        .ToList(),

                    WorstClusters = data
                        .Where(x => x.PerformanceType == "WORST")
                        .Select(x => new ClusterPerformanceItemBO
                        {
                            ClusterName = x.ClusterName,
                            AttendancePercentage = x.AttendancePercentage
                        })
                        .ToList()
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Error retrieving cluster performance",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Get program-wise student count
        /// </summary>
        [Authorize]
        [HttpGet("ProgramWiseStudents")]
        public async Task<IActionResult> GetProgramWiseStudents([FromQuery] DateTime startDate, [FromQuery] DateTime endDate, [FromQuery] int? programId = null, [FromQuery] int? clusterId = null)
        {
            try
            {
                var result = await _dataContext.Set<ProgramWiseStudentBO>()
                    .FromSqlRaw("EXEC spDashboard_GetProgramWiseStudents @StartDate, @EndDate, @ProgramId, @ClusterId",
                        new SqlParameter("@StartDate", startDate.Date),
                        new SqlParameter("@EndDate", endDate.Date),
                        new SqlParameter("@ProgramId", (object)programId ?? DBNull.Value),
                        new SqlParameter("@ClusterId", (object)clusterId ?? DBNull.Value))
                    .AsNoTracking()
                    .ToListAsync();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving program-wise students", error = ex.Message });
            }
        }

        #endregion
        #endregion
    }
}
