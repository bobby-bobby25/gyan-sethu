-- =============================================
-- DASHBOARD STORED PROCEDURES
-- SQL Server Dashboard Data Retrieval Procedures
-- =============================================

USE [gyansethu]
GO

-- =============================================
-- 1. GET SUMMARY STATS
-- Returns: Active students, teachers, program-wise breakdown
-- =============================================
IF EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'spDashboard_GetSummaryStats')
    DROP PROCEDURE spDashboard_GetSummaryStats;
GO

CREATE PROCEDURE spDashboard_GetSummaryStats
    @StartDate DATE,
    @EndDate DATE,
    @ProgramId INT = NULL,
    @ClusterId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Program-wise student counts
    ;WITH ProgramStudentCounts AS (
        SELECT
            p.ProgramID,
            p.Name AS ProgramName,
            COUNT(DISTINCT sar.StudentID) AS StudentCount
        FROM StudentAcademicRecords sar
        INNER JOIN Students s ON sar.StudentID = s.StudentID
        INNER JOIN Programs p ON sar.ProgramID = p.ProgramID
        WHERE s.IsActive = 1
          AND sar.IsActive = 1
          AND (@ProgramId IS NULL OR sar.ProgramID = @ProgramId)
          AND (@ClusterId IS NULL OR sar.ClusterID = @ClusterId)
        GROUP BY p.ProgramID, p.Name
    )

    SELECT
        -- Total active students
        (SELECT COUNT(DISTINCT sar.StudentID)
         FROM StudentAcademicRecords sar
         INNER JOIN Students s ON sar.StudentID = s.StudentID
         WHERE s.IsActive = 1
           AND sar.IsActive = 1
           AND (@ProgramId IS NULL OR sar.ProgramID = @ProgramId)
           AND (@ClusterId IS NULL OR sar.ClusterID = @ClusterId)
        ) AS ActiveStudents,

        -- Program wise students (ProgramID|ProgramName|StudentCount)
        (
            SELECT STRING_AGG(
                CONCAT(ProgramID, '|', ProgramName, '|', StudentCount),
                ','
            )
            FROM ProgramStudentCounts
        ) AS ProgramWiseStudentsRaw,

        -- Teachers
        (SELECT COUNT(DISTINCT TeacherID)
         FROM TeacherAssignments
         WHERE IsActive = 1
        ) AS TotalTeachers,

        (SELECT COUNT(DISTINCT TeacherID)
         FROM TeacherAssignments
         WHERE IsActive = 1 AND Role = 'main'
        ) AS MainTeachers,

        (SELECT COUNT(DISTINCT TeacherID)
         FROM TeacherAssignments
         WHERE IsActive = 1 AND Role = 'backup'
        ) AS BackupTeachers,

        0 AS Volunteers;
END;
GO


-- =============================================
-- 2. GET ATTENDANCE STATS
-- Returns: Overall attendance percentage and trend data
-- =============================================
IF EXISTS(SELECT 1 FROM SYS.PROCEDURES WHERE NAME='spDashboard_GetAttendanceStats')
DROP PROCEDURE spDashboard_GetAttendanceStats
GO

CREATE PROCEDURE spDashboard_GetAttendanceStats
    @StartDate DATE,
    @EndDate DATE,
    @ProgramId INT = NULL,
    @ClusterId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @PresentStatusId INT;
    SELECT @PresentStatusId = AttendanceStatusTypeID 
    FROM AttendanceStatusTypes 
    WHERE Code = 'P' AND IsActive = 1;

    -- Get overall attendance stats
    SELECT 
        CAST(ROUND(CAST(SUM(CASE WHEN ast.AttendanceStatusTypeID = @PresentStatusId THEN 1 ELSE 0 END) AS FLOAT) / 
                   NULLIF(COUNT(*), 0) * 100, 0) AS INT) AS AttendancePercentage,
        SUM(CASE WHEN ast.AttendanceStatusTypeID = @PresentStatusId THEN 1 ELSE 0 END) AS TotalPresent,
        COUNT(*) AS TotalExpected
    FROM AttendanceRecords ar
    INNER JOIN AttendanceStatusTypes ast ON ar.StatusID = ast.AttendanceStatusTypeID
    WHERE ar.AttendanceDate >= @StartDate 
        AND ar.AttendanceDate <= @EndDate
        AND (@ProgramId IS NULL OR ar.ProgramID = @ProgramId)
        AND (@ClusterId IS NULL OR ar.ClusterID = @ClusterId);

    -- Get trend data
    SELECT 
        FORMAT(ar.AttendanceDate, 'MMM d') AS [Date],
        CAST(ROUND(CAST(SUM(CASE WHEN ast.AttendanceStatusTypeID = @PresentStatusId THEN 1 ELSE 0 END) AS FLOAT) / 
                   NULLIF(COUNT(*), 0) * 100, 0) AS INT) AS Percentage
    FROM AttendanceRecords ar
    INNER JOIN AttendanceStatusTypes ast ON ar.StatusID = ast.AttendanceStatusTypeID
    WHERE ar.AttendanceDate >= @StartDate 
        AND ar.AttendanceDate <= @EndDate
        AND (@ProgramId IS NULL OR ar.ProgramID = @ProgramId)
        AND (@ClusterId IS NULL OR ar.ClusterID = @ClusterId)
    GROUP BY ar.AttendanceDate
    ORDER BY ar.AttendanceDate;
END;
GO

-- =============================================
-- 3. GET TEACHERS UNAVAILABLE
-- Returns: Main teachers who had backup fill in
-- =============================================
IF EXISTS(SELECT 1 FROM SYS.PROCEDURES WHERE NAME='spDashboard_GetTeachersUnavailable')
DROP PROCEDURE spDashboard_GetTeachersUnavailable
GO

CREATE PROCEDURE spDashboard_GetTeachersUnavailable
    @StartDate DATE,
    @EndDate DATE,
    @ProgramId INT = NULL,
    @ClusterId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    WITH MainBackupTeachers AS (
        SELECT 
            ta_main.TeacherID AS MainTeacherId,
            t_main.Name AS MainTeacherName,
            ta_main.ProgramID,
            ta_main.ClusterID,
            p.Name AS ProgramName,
            c.Name AS ClusterName,
            ta_backup.TeacherID AS BackupTeacherId,
            t_backup.Name AS BackupTeacherName
        FROM TeacherAssignments ta_main
        INNER JOIN TeacherAssignments ta_backup ON ta_main.ProgramID = ta_backup.ProgramID 
            AND ta_main.ClusterID = ta_backup.ClusterID
        INNER JOIN Teachers t_main ON ta_main.TeacherID = t_main.TeacherID
        INNER JOIN Teachers t_backup ON ta_backup.TeacherID = t_backup.TeacherID
        INNER JOIN Programs p ON ta_main.ProgramID = p.ProgramID
        INNER JOIN Clusters c ON ta_main.ClusterID = c.ClusterID
        WHERE ta_main.Role = 'main' 
            AND ta_backup.Role = 'backup'
            AND ta_main.IsActive = 1 
            AND ta_backup.IsActive = 1
            AND (@ProgramId IS NULL OR ta_main.ProgramID = @ProgramId)
            AND (@ClusterId IS NULL OR ta_main.ClusterID = @ClusterId)
    ),
    UnavailableDays AS (
        SELECT 
            mbt.MainTeacherId,
            mbt.MainTeacherName,
            mbt.ProgramName,
            mbt.ClusterName,
            mbt.BackupTeacherName,
            COUNT(DISTINCT ar.AttendanceDate) AS MissedDays
        FROM MainBackupTeachers mbt
        INNER JOIN AttendanceRecords ar ON mbt.ProgramID = ar.ProgramID 
            AND mbt.ClusterID = ar.ClusterID
        WHERE ar.MarkedByTeacherId = mbt.BackupTeacherId
            AND ar.AttendanceDate >= @StartDate 
            AND ar.AttendanceDate <= @EndDate
        GROUP BY mbt.MainTeacherId, mbt.MainTeacherName, mbt.ProgramName, 
                 mbt.ClusterName, mbt.BackupTeacherName
    )
    SELECT * FROM UnavailableDays
    ORDER BY MissedDays DESC;
END;
GO

-- =============================================
-- 4. GET CLUSTERS NEEDING ATTENTION
-- Returns: Clusters with missed updates or poor attendance
-- =============================================
IF EXISTS(SELECT 1 FROM SYS.PROCEDURES WHERE NAME='spDashboard_GetClustersNeedingAttention')
DROP PROCEDURE spDashboard_GetClustersNeedingAttention
GO

CREATE PROCEDURE spDashboard_GetClustersNeedingAttention
    @StartDate DATE,
    @EndDate DATE,
    @ProgramId INT = NULL,
    @ClusterId INT = NULL,
    @PoorAttendanceThreshold INT = 75
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @PresentStatusId INT;
    SELECT @PresentStatusId = AttendanceStatusTypeID 
    FROM AttendanceStatusTypes 
    WHERE Code = 'P' AND IsActive = 1;

    DECLARE @TotalDays INT = DATEDIFF(DAY, @StartDate, @EndDate) + 1;

    WITH ClusterAttendance AS (
        SELECT 
            ta.TeacherID,
            t.Name AS TeacherName,
            ta.ProgramID,
            ta.ClusterID,
            p.Name AS ProgramName,
            c.Name AS ClusterName,
            COUNT(DISTINCT ar.AttendanceDate) AS DatesWithAttendance,
            CAST(ROUND(CAST(SUM(CASE WHEN ar.StatusID = @PresentStatusId THEN 1 ELSE 0 END) AS FLOAT) /
                       NULLIF(COUNT(ar.AttendanceRecordID), 0) * 100, 0) AS INT) AS AttendancePercentage
        FROM TeacherAssignments ta
        INNER JOIN Teachers t ON ta.TeacherID = t.TeacherID
        INNER JOIN Programs p ON ta.ProgramID = p.ProgramID
        INNER JOIN Clusters c ON ta.ClusterID = c.ClusterID
        LEFT JOIN AttendanceRecords ar ON ta.ProgramID = ar.ProgramID 
            AND ta.ClusterID = ar.ClusterID
            AND ar.AttendanceDate >= @StartDate 
            AND ar.AttendanceDate <= @EndDate
        WHERE ta.Role = 'main'
            AND ta.IsActive = 1
            AND (@ProgramId IS NULL OR ta.ProgramID = @ProgramId)
            AND (@ClusterId IS NULL OR ta.ClusterID = @ClusterId)
        GROUP BY ta.TeacherID, t.Name, ta.ProgramID, ta.ClusterID, p.Name, c.Name
    )
    SELECT 
        TeacherName,
        ProgramName,
        ClusterName,
        (@TotalDays - ISNULL(DatesWithAttendance, 0)) AS MissedUpdates,
        ISNULL(AttendancePercentage, 0) AS AttendancePercentage
    FROM ClusterAttendance
    WHERE (@TotalDays - ISNULL(DatesWithAttendance, 0)) > 0 
        OR ISNULL(AttendancePercentage, 0) < @PoorAttendanceThreshold
    ORDER BY MissedUpdates DESC, AttendancePercentage ASC;
END;
GO

-- =============================================
-- 5. GET MOST ABSENT STUDENTS
-- Returns: Top absent students in the date range
-- =============================================
IF EXISTS(SELECT 1 FROM SYS.PROCEDURES WHERE NAME='spDashboard_GetMostAbsentStudents')
DROP PROCEDURE spDashboard_GetMostAbsentStudents
GO

CREATE PROCEDURE spDashboard_GetMostAbsentStudents
    @StartDate DATE,
    @EndDate DATE,
    @ProgramId INT = NULL,
    @ClusterId INT = NULL,
    @Limit INT = 5
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @PresentStatusId INT;
    DECLARE @AbsentStatusId INT;
    
    SELECT @PresentStatusId = AttendanceStatusTypeID 
    FROM AttendanceStatusTypes 
    WHERE Code = 'P' AND IsActive = 1;
    
    SELECT @AbsentStatusId = AttendanceStatusTypeID 
    FROM AttendanceStatusTypes 
    WHERE Code = 'A' AND IsActive = 1;

    SELECT TOP (@Limit)
        ar.StudentID AS Id,
        s.Name,
        p.Name AS ProgramName,
        c.Name AS ClusterName,
        SUM(CASE WHEN ar.StatusID = @PresentStatusId THEN 1 ELSE 0 END) AS PresentCount,
        SUM(CASE WHEN ar.StatusID = @AbsentStatusId THEN 1 ELSE 0 END) AS AbsentCount
    FROM AttendanceRecords ar
    INNER JOIN Students s ON ar.StudentID = s.StudentID
    INNER JOIN Programs p ON ar.ProgramID = p.ProgramID
    INNER JOIN Clusters c ON ar.ClusterID = c.ClusterID
    WHERE ar.AttendanceDate >= @StartDate 
        AND ar.AttendanceDate <= @EndDate
        AND (@ProgramId IS NULL OR ar.ProgramID = @ProgramId)
        AND (@ClusterId IS NULL OR ar.ClusterID = @ClusterId)
    GROUP BY ar.StudentID, s.Name, p.Name, c.Name
    ORDER BY AbsentCount DESC;
END;
GO

-- =============================================
-- 6. GET CLUSTER PERFORMANCE
-- Returns: Best and worst performing clusters
-- =============================================
IF EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'spDashboard_GetClusterPerformance')
DROP PROCEDURE spDashboard_GetClusterPerformance
GO

CREATE PROCEDURE spDashboard_GetClusterPerformance
    @StartDate DATE,
    @EndDate DATE,
    @ProgramId INT = NULL,
    @ClusterId INT = NULL,
    @Limit INT = 5
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @PresentStatusId INT;

    SELECT @PresentStatusId = AttendanceStatusTypeID
    FROM AttendanceStatusTypes
    WHERE Code = 'P' AND IsActive = 1;

    WITH ClusterStats AS (
        SELECT
            c.ClusterID,
            c.Name AS ClusterName,
            COUNT(ar.AttendanceRecordID) AS TotalCount,
            SUM(CASE WHEN ar.StatusID = @PresentStatusId THEN 1 ELSE 0 END) AS PresentCount
        FROM Clusters c
        INNER JOIN AttendanceRecords ar ON ar.ClusterID = c.ClusterID
            AND ar.AttendanceDate BETWEEN @StartDate AND @EndDate
            AND (@ProgramId IS NULL OR ar.ProgramID = @ProgramId)
            AND (@ClusterId IS NULL OR ar.ClusterID = @ClusterId)
        GROUP BY c.ClusterID, c.Name
        HAVING COUNT(ar.AttendanceRecordID) > 0
    ),
    Calculated AS (
        SELECT
            ClusterName,
            CAST(ROUND(
                (CAST(PresentCount AS FLOAT) / NULLIF(TotalCount, 0)) * 100, 0
            ) AS INT) AS AttendancePercentage
        FROM ClusterStats
    )
    SELECT TOP (@Limit)
        'BEST' AS PerformanceType,
        ClusterName,
        AttendancePercentage
    FROM Calculated
    UNION ALL
    SELECT TOP (@Limit)
        'WORST' AS PerformanceType,
        ClusterName,
        AttendancePercentage
    FROM Calculated
    ORDER BY AttendancePercentage ASC;
END
GO


-- =============================================
-- 7. GET PROGRAM WISE STUDENTS
-- Returns: Count of students by program
-- =============================================
IF EXISTS(SELECT 1 FROM SYS.PROCEDURES WHERE NAME='spDashboard_GetProgramWiseStudents')
DROP PROCEDURE spDashboard_GetProgramWiseStudents
GO

CREATE PROCEDURE spDashboard_GetProgramWiseStudents
    @StartDate DATE,
    @EndDate DATE,
    @ProgramId INT = NULL,
    @ClusterId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        p.Name AS Program,
        COUNT(DISTINCT sar.StudentID) AS [Count]
    FROM StudentAcademicRecords sar
    INNER JOIN Students s ON sar.StudentID = s.StudentID
    INNER JOIN Programs p ON sar.ProgramID = p.ProgramID
    WHERE s.IsActive = 1 
        AND sar.IsActive = 1
        AND (@ProgramId IS NULL OR sar.ProgramID = @ProgramId)
        AND (@ClusterId IS NULL OR sar.ClusterID = @ClusterId)
    GROUP BY p.ProgramID, p.Name
    ORDER BY [Count] DESC;
END;
GO


-- =============================================
-- DONOR RELATED STORED PROCEDURES
-- =============================================

-- =============================================
-- 8. GET DONOR DASHBOARD STATS
-- Returns: Total donors, regular, new this year, adhoc
-- =============================================
IF EXISTS(SELECT 1 FROM SYS.PROCEDURES WHERE NAME='spDashboard_GetDonorStats')
DROP PROCEDURE spDashboard_GetDonorStats
GO

CREATE PROCEDURE spDashboard_GetDonorStats
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CurrentYear INT = YEAR(GETDATE());
    DECLARE @CurrentYearStart DATE = DATEFROMPARTS(@CurrentYear, 1, 1);

    SELECT 
        COUNT(DISTINCT d.DonorID) AS TotalDonors,
        COUNT(DISTINCT CASE WHEN d.DonorType = 'regular' THEN d.DonorID END) AS RegularDonors,
        COUNT(DISTINCT CASE WHEN d.CreatedAt >= @CurrentYearStart THEN d.DonorID END) AS NewDonorsThisYear,
        COUNT(DISTINCT CASE WHEN d.DonorType = 'adhoc' THEN d.DonorID END) AS AdhocDonors
    FROM Donors d
    WHERE d.IsActive = 1;
END;
GO

-- =============================================
-- 9. GET DONOR YEAR COMPARISON
-- Returns: Last year vs this year donation totals
-- =============================================
IF EXISTS(SELECT 1 FROM SYS.PROCEDURES WHERE NAME='spDashboard_GetDonorYearComparison')
DROP PROCEDURE spDashboard_GetDonorYearComparison
GO

CREATE PROCEDURE spDashboard_GetDonorYearComparison
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CurrentYear INT = YEAR(GETDATE());
    DECLARE @LastYear INT = @CurrentYear - 1;

    DECLARE @LastYearTotal DECIMAL(12, 2) = (
        SELECT ISNULL(SUM(dn.Amount), 0)
        FROM Donations dn
        WHERE YEAR(dn.DonationDate) = @LastYear
    );

    DECLARE @ThisYearTotal DECIMAL(12, 2) = (
        SELECT ISNULL(SUM(dn.Amount), 0)
        FROM Donations dn
        WHERE YEAR(dn.DonationDate) = @CurrentYear
    );

    DECLARE @PercentageChange DECIMAL(10, 2) = (
        CASE 
            WHEN @LastYearTotal = 0 THEN 
                CASE WHEN @ThisYearTotal > 0 THEN 100 ELSE 0 END
            ELSE 
                ((@ThisYearTotal - @LastYearTotal) / @LastYearTotal) * 100
        END
    );

    SELECT 
        @LastYearTotal AS LastYearTotal,
        @ThisYearTotal AS ThisYearTotal,
        @PercentageChange AS PercentageChange;
END;
GO

-- =============================================
-- 10. GET MONTHLY DONATION TRENDS
-- Returns: Month comparison for current and previous year
-- =============================================
IF EXISTS(SELECT 1 FROM SYS.PROCEDURES WHERE NAME='spDashboard_GetMonthlyDonationTrends')
DROP PROCEDURE spDashboard_GetMonthlyDonationTrends
GO

CREATE PROCEDURE spDashboard_GetMonthlyDonationTrends
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CurrentYear INT = YEAR(GETDATE());
    DECLARE @PreviousYear INT = @CurrentYear - 1;

    WITH MonthlyData AS (
        SELECT 
            MONTH(dn.DonationDate) AS MonthNum,
            YEAR(dn.DonationDate) AS YearNum,
            ISNULL(SUM(dn.Amount), 0) AS Total
        FROM Donations dn
        WHERE YEAR(dn.DonationDate) IN (@PreviousYear, @CurrentYear)
        GROUP BY YEAR(dn.DonationDate), MONTH(dn.DonationDate)
    )
    SELECT 
        FORMAT(DATEFROMPARTS(@CurrentYear, m.n, 1), 'MMM') AS [Month],
        ISNULL(MAX(CASE WHEN md.YearNum = @CurrentYear THEN md.Total END), 0) AS CurrentYear,
        ISNULL(MAX(CASE WHEN md.YearNum = @PreviousYear THEN md.Total END), 0) AS PreviousYear
    FROM (
        SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6
        UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12
    ) m
    LEFT JOIN MonthlyData md ON m.n = md.MonthNum
    GROUP BY m.n
    ORDER BY m.n;
END;
GO
