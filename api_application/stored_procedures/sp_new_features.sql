-- =============================================
-- STORED PROCEDURES for New Features
-- Teacher Subjects, Learning Centres, Parents, School Type/Medium
-- =============================================

USE [gyansethu]
GO

-- =============================================
-- 2. LEARNING CENTRES MANAGEMENT
-- =============================================

-- Get All Learning Centres
IF EXISTS(SELECT 1 FROM SYS.PROCEDURES WHERE NAME='spGetLearningCentres')
    DROP PROCEDURE spGetLearningCentres
GO
CREATE PROCEDURE spGetLearningCentres
    @ClusterId INT = NULL,
    @IsActive BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        lc.LearningCentreID AS id,
        lc.ClusterID AS cluster_id,
        c.Name AS cluster_name,
        lc.Name AS name,
        lc.Address AS address,
        lc.City AS city,
        lc.State AS state,
        lc.Latitude AS latitude,
        lc.Longitude AS longitude,
        lc.GeoRadiusMeters AS geo_radius_meters,
        lc.IsActive AS is_active,
        lc.CreatedAt AS created_at
    FROM LearningCentres lc
    LEFT JOIN Clusters c ON lc.ClusterID = c.ClusterID
    WHERE (lc.ClusterID = @ClusterId OR @ClusterId IS NULL)
    AND (lc.IsActive = @IsActive OR @IsActive IS NULL)
    ORDER BY lc.Name;
END;
GO


CREATE OR ALTER PROCEDURE [dbo].[sp_GetAllLearningCentersStats]
    @IsActive BIT = 1
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        lc.[LearningCentreID]   AS [Id],
        lc.[Name]               AS [Name],
		lc.[ClusterID]          AS [ClusterId],
        c.[Name]				AS [ClusterName],
        lc.[Address]            AS [Address],
        lc.[City]               AS [City],
        lc.[State]              AS [State],
		lc.[Notes]				AS [Notes],
        lc.[Latitude]           AS [Latitude],
        lc.[Longitude]          AS [Longitude],
        lc.[GeoRadiusMeters]    AS [GeoRadiusMeters],
        lc.[CreatedAt]          AS [CreatedAt],
        lc.[UpdatedAt]          AS [UpdatedAt],
        lc.[IsActive]           AS [IsActive],

        ISNULL(sc.StudentCount, 0) AS StudentCount,
        ISNULL(tc.TeacherCount, 0) AS TeacherCount,
        ISNULL(p.ProgramsCsv, '')  AS Programs

    FROM [dbo].[LearningCentres] lc

    -- Student Count per Learning Centre
    LEFT JOIN (
        SELECT
            sa.LearningCentreID,
            COUNT(DISTINCT s.StudentID) AS StudentCount
        FROM [dbo].[Students] s
		LEFT JOIN [dbo].[StudentAcademicRecords] sa ON sa.StudentID = s.StudentID
        WHERE s.IsActive = 1 AND sa.IsActive = 1
        GROUP BY sa.LearningCentreID
    ) sc ON sc.LearningCentreID = lc.LearningCentreID

    -- Teacher Count per Learning Centre
    LEFT JOIN (
        SELECT
            ta.LearningCentreID,
            COUNT(DISTINCT ta.TeacherID) AS TeacherCount
        FROM [dbo].[TeacherAssignments] ta
        WHERE ta.IsActive = 1
        GROUP BY ta.LearningCentreID
    ) tc ON tc.LearningCentreID = lc.LearningCentreID

    -- Programs per Learning Centre
    LEFT JOIN (
        SELECT
            x.LearningCentreID,
            STRING_AGG(x.ProgramName, ',') AS ProgramsCsv
        FROM (
            SELECT DISTINCT
                ta.LearningCentreID,
                p.Name AS ProgramName
            FROM [dbo].[TeacherAssignments] ta
            INNER JOIN [dbo].[Programs] p 
                ON p.ProgramID = ta.ProgramID
            WHERE ta.IsActive = 1
        ) x
        GROUP BY x.LearningCentreID
    ) p ON p.LearningCentreID = lc.LearningCentreID

	LEFT JOIN Clusters c ON c.ClusterID = lc.ClusterID

    WHERE lc.[IsActive] = @IsActive
    ORDER BY lc.[Name];
END;
GO


-- Create Learning Centre
IF EXISTS(SELECT 1 FROM SYS.PROCEDURES WHERE NAME='spInsertLearningCentre')
    DROP PROCEDURE spInsertLearningCentre
GO
CREATE PROCEDURE spInsertLearningCentre
    @ClusterId INT,
    @Name NVARCHAR(255),
    @Address NVARCHAR(MAX) = NULL,
    @City NVARCHAR(255) = NULL,
    @State NVARCHAR(255) = NULL,
    @Latitude DECIMAL(10, 8) = NULL,
    @Longitude DECIMAL(11, 8) = NULL,
    @GeoRadiusMeters INT = NULL,
	@Notes NVARCHAR(MAX) = NULL,
	@IsActive BIT = 1,
	@LearningCenterId INT OUTPUT,
	@Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        INSERT INTO LearningCentres 
        (ClusterID, Name, Address, City, State, Latitude, Longitude, GeoRadiusMeters, Notes, IsActive, CreatedAt, UpdatedAt)
        VALUES 
        (@ClusterId, @Name, @Address, @City, @State, @Latitude, @Longitude, @GeoRadiusMeters, @Notes, @IsActive, GETDATE(), GETDATE());
        
        SET @LearningCenterId = SCOPE_IDENTITY();
		SET @Output = 'Success';

    END TRY
    BEGIN CATCH
        SET @Output = 'Error';
		SET @LearningCenterId = 0;
    END CATCH
END;
GO

-- Update Learning Centre
IF EXISTS(SELECT 1 FROM SYS.PROCEDURES WHERE NAME='spUpdateLearningCentre')
    DROP PROCEDURE spUpdateLearningCentre
GO
CREATE PROCEDURE spUpdateLearningCentre
    @LearningCentreId INT,
    @Name NVARCHAR(255),
    @Address NVARCHAR(MAX) = NULL,
    @City NVARCHAR(255) = NULL,
    @State NVARCHAR(255) = NULL,
    @Latitude DECIMAL(10, 8) = NULL,
    @Longitude DECIMAL(11, 8) = NULL,
    @GeoRadiusMeters INT = NULL,
	@Notes NVARCHAR(MAX) = NULL,
	@Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        UPDATE LearningCentres
        SET Name = @Name,
            Address = @Address,
            City = @City,
            State = @State,
            Latitude = @Latitude,
            Longitude = @Longitude,
            GeoRadiusMeters = @GeoRadiusMeters,
			Notes = @Notes,
            UpdatedAt = GETDATE()
        WHERE LearningCentreID = @LearningCentreId;
        
        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        SET @Output = 'Error';
    END CATCH
END;
GO


-- =============================================
-- 5. TEACHER SEARCH BY STUDENT CODE (Ex-Student)
-- =============================================

IF EXISTS(SELECT 1 FROM SYS.PROCEDURES WHERE NAME='spGetStudentByStudentCode')
    DROP PROCEDURE spGetStudentByStudentCode
GO
CREATE PROCEDURE spGetStudentByStudentCode
    @StudentCode NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        StudentID AS id,
        s.Name AS name,
        StudentCode AS student_code,
        Email AS email,
        Phone AS phone,
        DateOfBirth AS date_of_birth,
		Gender AS gender,
        Address AS address,
        City AS city,
        State AS state,
        s.IDProofTypeID AS id_proof_type_id,
		ISNULL(ipt.[Name],'') AS [id_proof_type],
        IDNumber AS id_proof_number,
		CasteID AS caste_id,
        cc.Name AS caste_category
    FROM Students AS s
	LEFT JOIN [dbo].[CasteCategories] cc ON s.[CasteID] = cc.[CasteCategoryID]
    LEFT JOIN [dbo].[IDProofTypes] ipt ON s.[IDProofTypeID] = ipt.[IDProofTypeID]
    WHERE StudentCode = @StudentCode;
END;
GO

-- =============================================
-- 6. MARK STUDENT AS INACTIVE
-- =============================================

IF EXISTS(SELECT 1 FROM SYS.PROCEDURES WHERE NAME='spUpdateStudentActiveStatus')
    DROP PROCEDURE spUpdateStudentActiveStatus
GO
CREATE PROCEDURE spUpdateStudentActiveStatus
    @StudentID INT,
    @IsActive BIT,
	@Output NVARCHAR(100) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        UPDATE Students
        SET IsActive = @IsActive,
            UpdatedAt = GETUTCDATE()
        WHERE StudentID = @StudentID;
        
        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
       SET @Output = 'Error: ' + ERROR_MESSAGE();
    END CATCH
END;
GO

PRINT 'Stored Procedures created successfully';
