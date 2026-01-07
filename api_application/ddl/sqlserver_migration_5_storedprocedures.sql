-- =============================================
-- PART 5: STORED PROCEDURES FOR API ENDPOINTS
-- SQL Server Migration for StudentHub Application
-- =============================================

USE [P2_PROD_IGB_Replica]
GO

-- =============================================
-- USERS MANAGEMENT STORED PROCEDURES
-- =============================================

-- Get all users with roles
CREATE OR ALTER PROCEDURE [dbo].[sp_GetAllUsers]
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        u.[UserID] AS [UserID],
        u.[Email] AS [Email],
        u.[FullName] AS [FullName],
        u.[Phone] AS [Phone],
        u.[CreatedAt] AS [CreatedAt],
        u.[UpdatedAt] AS [UpdatedAt],
        r.[RoleName] AS [Role],
        u.[IsActive] AS [IsActive]
    FROM [dbo].[Users] u
    LEFT JOIN [dbo].[UserRoles] ur ON u.[UserID] = ur.[UserID]
    LEFT JOIN [dbo].[Roles] r ON ur.[RoleID] = r.[RoleID]
    ORDER BY u.[FullName];
END;
GO

-- Get user by ID
CREATE OR ALTER PROCEDURE [dbo].[sp_GetUserById]
    @UserID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        u.[UserID] AS [UserID],
        u.[Email] AS [Email],
        u.[FullName] AS [FullName],
        u.[Phone] AS [Phone],
        u.[CreatedAt] AS [CreatedAt],
        u.[UpdatedAt] AS [UpdatedAt],
        r.[RoleName] AS [Role],
        u.[IsActive] AS [IsActive]
    FROM [dbo].[Users] u
    LEFT JOIN [dbo].[UserRoles] ur ON u.[UserID] = ur.[UserID]
    LEFT JOIN [dbo].[Roles] r ON ur.[RoleID] = r.[RoleID]
    WHERE u.[UserID] = @UserID;
END;
GO

-- Update user profile
CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateUserProfile]
    @UserID INT,
    @FullName NVARCHAR(255) = NULL,
    @Phone NVARCHAR(50) = NULL,
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        UPDATE [dbo].[Users]
        SET 
            [FullName] = ISNULL(@FullName, [FullName]),
            [Phone] = ISNULL(@Phone, [Phone]),
            [UpdatedAt] = GETUTCDATE()
        WHERE [UserID] = @UserID;
        
        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        SET @Output = 'Error';
        THROW;
    END CATCH
END;
GO

-- Update user role
CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateUserRole]
    @UserID INT,
    @RoleName NVARCHAR(50),
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Get RoleID from RoleName
        DECLARE @RoleID INT;
        SELECT @RoleID = [RoleID] FROM [dbo].[Roles] WHERE [RoleName] = @RoleName;
        
        IF @RoleID IS NULL
        BEGIN
            SET @Output = 'InvalidRole';
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Remove existing roles
        DELETE FROM [dbo].[UserRoles] WHERE [UserID] = @UserID;
        
        -- Add new role
        INSERT INTO [dbo].[UserRoles] ([UserID], [RoleID])
        VALUES (@UserID, @RoleID);
        
        SET @Output = 'Success';
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        SET @Output = 'Error';
        THROW;
    END CATCH
END;
GO

-- =============================================
-- STUDENTS MANAGEMENT STORED PROCEDURES
-- =============================================

-- Get all students
CREATE OR ALTER PROCEDURE [dbo].[sp_GetAllStudents]
    @SearchTerm NVARCHAR(255) = NULL,
    @ClusterID INT = NULL,
    @ProgramID INT = NULL,
    @IsActive BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        s.[StudentID] AS [Id],
        s.[Name] AS [Name],
        s.[StudentCode] AS [StudentCode],
        s.[DateOfBirth] AS [DateOfBirth],
        s.[Address] AS [Address],
        s.[City] AS [City],
        s.[State] AS [State],
        s.[IDNumber] AS [IDProofNumber],
        s.[CreatedAt] AS [CreatedAt],
        s.[UpdatedAt] AS [UpdatedAt],
        s.[IsActive] AS [IsActive],
        cc.[Name] AS [CasteCategory],
        ipt.[Name] AS [IDProofType],
        ISNULL(sar.[ClassGrade],'') AS [ClassGrade],
        ISNULL(sar.[SchoolName],'') AS [SchoolName],
        ISNULL(sar.[AttendancePercentage],0) AS [AttendancePercentage],
        ISNULL(sar.[ResultPercentage],0) AS [ResultPercentage]
    FROM [dbo].[Students] s
    LEFT JOIN [dbo].[CasteCategories] cc ON s.[CasteID] = cc.[CasteCategoryID]
    LEFT JOIN [dbo].[IDProofTypes] ipt ON s.[IDProofTypeID] = ipt.[IDProofTypeID]
    LEFT JOIN [dbo].[StudentAcademicRecords] sar ON s.[StudentID] = sar.[StudentID]
    WHERE s.[IsActive] = @IsActive
        AND (@SearchTerm IS NULL OR s.[Name] LIKE '%' + @SearchTerm + '%' OR s.[StudentCode] LIKE '%' + @SearchTerm + '%')
        AND (@ClusterID IS NULL OR sar.[ClusterID] = @ClusterID)
        AND (@ProgramID IS NULL OR sar.[ProgramID] = @ProgramID)
    ORDER BY s.[Name];
END;
GO

-- Get student by ID
CREATE OR ALTER PROCEDURE [dbo].[sp_GetStudentById]
    @StudentID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        s.[StudentID] AS [StudentID],
        s.[Name] AS [Name],
        s.[StudentCode] AS [StudentCode],
        s.[DateOfBirth] AS [DateOfBirth],
        s.[Address] AS [Address],
        s.[City] AS [City],
        s.[State] AS [State],
        s.[IDNumber] AS [IDProofNumber],
        s.[CreatedAt] AS [CreatedAt],
        s.[UpdatedAt] AS [UpdatedAt],
        s.[IsActive] AS [IsActive],
        cc.[Name] AS [CasteCategory],
        ipt.[Name] AS [IDProofType]
    FROM [dbo].[Students] s
    LEFT JOIN [dbo].[CasteCategories] cc ON s.[CasteID] = cc.[CasteCategoryID]
    LEFT JOIN [dbo].[IDProofTypes] ipt ON s.[IDProofTypeID] = ipt.[IDProofTypeID]
    WHERE s.[StudentID] = @StudentID;
END;
GO

-- Create student
CREATE OR ALTER PROCEDURE [dbo].[sp_InsertStudent]
    @Name NVARCHAR(255),
    @DateOfBirth DATE = NULL,
    @IDProofTypeID INT = NULL,
    @IDNumber NVARCHAR(100) = NULL,
    @Address NVARCHAR(MAX) = NULL,
    @City NVARCHAR(100) = NULL,
    @State NVARCHAR(100) = NULL,
    @CasteID INT = NULL,
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        INSERT INTO [dbo].[Students] (
            [Name], [DateOfBirth], [IDProofTypeID], [IDNumber],
            [Address], [City], [State], [CasteID]
        )
        VALUES (
            @Name, @DateOfBirth, @IDProofTypeID, @IDNumber,
            @Address, @City, @State, @CasteID
        );
        
        SET @Output = 'Success';
        SELECT SCOPE_IDENTITY() AS [StudentID];
    END TRY
    BEGIN CATCH
        SET @Output = 'Error';
        THROW;
    END CATCH
END;
GO

-- Update student
CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateStudent]
    @StudentID INT,
    @Name NVARCHAR(255) = NULL,
    @DateOfBirth DATE = NULL,
    @IDProofTypeID INT = NULL,
    @IDNumber NVARCHAR(100) = NULL,
    @Address NVARCHAR(MAX) = NULL,
    @City NVARCHAR(100) = NULL,
    @State NVARCHAR(100) = NULL,
    @CasteID INT = NULL,
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        UPDATE [dbo].[Students]
        SET 
            [Name] = ISNULL(@Name, [Name]),
            [DateOfBirth] = ISNULL(@DateOfBirth, [DateOfBirth]),
            [IDProofTypeID] = ISNULL(@IDProofTypeID, [IDProofTypeID]),
            [IDNumber] = ISNULL(@IDNumber, [IDNumber]),
            [Address] = ISNULL(@Address, [Address]),
            [City] = ISNULL(@City, [City]),
            [State] = ISNULL(@State, [State]),
            [CasteID] = ISNULL(@CasteID, [CasteID]),
            [UpdatedAt] = GETUTCDATE()
        WHERE [StudentID] = @StudentID;
        
        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        SET @Output = 'Error';
        THROW;
    END CATCH
END;
GO

-- Delete student (soft delete)
CREATE OR ALTER PROCEDURE [dbo].[sp_DeleteStudent]
    @StudentID INT,
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        UPDATE [dbo].[Students]
        SET [IsActive] = 0, [UpdatedAt] = GETUTCDATE()
        WHERE [StudentID] = @StudentID;
        
        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        SET @Output = 'Error';
        THROW;
    END CATCH
END;
GO

--Update Student Academic Record
CREATE OR ALTER PROCEDURE sp_InsertStudentAcademicRecord
(
    @StudentID INT,
    @AcademicYearID INT,
    @ClusterID INT,
    @ProgramID INT,
    @SchoolName NVARCHAR(255) = NULL,
    @ClassGrade NVARCHAR(50) = NULL,
    @AttendancePercentage DECIMAL(5,2) = NULL,
    @ResultPercentage DECIMAL(5,2) = NULL,
    @YearlyFees DECIMAL(10,2) = NULL,
    @Remarks NVARCHAR(MAX) = NULL,
	@IsActive BIT,
    @Output NVARCHAR(50) OUTPUT
)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        INSERT INTO StudentAcademicRecords
        (
            StudentID, AcademicYearID, ClusterID, ProgramID,
            SchoolName, ClassGrade, AttendancePercentage,
            ResultPercentage, YearlyFees, Remarks, IsActive
        )
        VALUES
        (
            @StudentID, @AcademicYearID, @ClusterID, @ProgramID,
            @SchoolName, @ClassGrade, @AttendancePercentage,
            @ResultPercentage, @YearlyFees, @Remarks, @IsActive
        );

        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        SET @Output = ERROR_MESSAGE();
    END CATCH
END
GO


CREATE OR ALTER PROCEDURE sp_UpdateStudentAcademicRecord
    @StudentAcademicRecordID INT,
    @StudentID INT,
    @AcademicYearID INT,
    @ClusterID INT,
    @ProgramID INT,
    @SchoolName NVARCHAR(255) = NULL,
    @ClassGrade NVARCHAR(50) = NULL,
    @AttendancePercentage DECIMAL(5,2) = NULL,
    @ResultPercentage DECIMAL(5,2) = NULL,
    @YearlyFees DECIMAL(10,2) = NULL,
    @Remarks NVARCHAR(MAX) = NULL,
    @IsActive BIT = 1,
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        UPDATE StudentAcademicRecords
        SET
            StudentID = @StudentID,
            AcademicYearID = @AcademicYearID,
            ClusterID = @ClusterID,
            ProgramID = @ProgramID,
            SchoolName = @SchoolName,
            ClassGrade = @ClassGrade,
            AttendancePercentage = @AttendancePercentage,
            ResultPercentage = @ResultPercentage,
            YearlyFees = @YearlyFees,
            Remarks = @Remarks,
            IsActive = @IsActive,
            UpdatedAt = GETUTCDATE()
        WHERE StudentAcademicRecordID = @StudentAcademicRecordID;

        IF @@ROWCOUNT = 0
        BEGIN
            SET @Output = 'NotFound';
        END
        ELSE
        BEGIN
            SET @Output = 'Success';
        END
    END TRY
    BEGIN CATCH
        SET @Output = ERROR_MESSAGE();
    END CATCH
END
GO

-- Delete student (soft delete)
CREATE OR ALTER PROCEDURE [dbo].[sp_DeleteStudentAcademicRecords]
    @StudentAcademicRecordID INT,
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        UPDATE [dbo].[StudentAcademicRecords]
        SET [IsActive] = 0, [UpdatedAt] = GETUTCDATE()
        WHERE StudentAcademicRecordID = @StudentAcademicRecordID;
        
        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        SET @Output = 'Error';
        THROW;
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE sp_GetStudentAcademicRecords
(
    @StudentID INT
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        sar.StudentAcademicRecordID AS Id,
        sar.StudentID               AS StudentId,
        sar.AcademicYearID          AS AcademicYearId,
        sar.ClusterID               AS ClusterId,
        sar.ProgramID               AS ProgramId,
        sar.SchoolName,
        sar.ClassGrade,
        sar.AttendancePercentage,
        sar.ResultPercentage,
        sar.YearlyFees,
        sar.Remarks,
        sar.IsActive,
        c.Name						AS ClusterName,
        p.Name						AS ProgramName,
        ay.Name						AS AcademicYearName,
        ay.IsCurrent                AS AcademicYearIsCurrent

    FROM StudentAcademicRecords sar
    INNER JOIN Clusters c
        ON sar.ClusterID = c.ClusterID
    INNER JOIN Programs p
        ON sar.ProgramID = p.ProgramID
    INNER JOIN AcademicYears ay
        ON sar.AcademicYearID = ay.AcademicYearID
    WHERE sar.StudentID = @StudentID
      AND sar.IsActive = 1
    ORDER BY ay.AcademicYearID DESC;
END
GO



-- =============================================
-- TEACHERS MANAGEMENT STORED PROCEDURES
-- =============================================

-- Get all teachers
CREATE OR ALTER PROCEDURE [dbo].[sp_GetAllTeachers]
    @IsActive BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        t.[TeacherID] AS [TeacherID],
        t.[Name] AS [Name],
        t.[Email] AS [Email],
        t.[Phone] AS [Phone],
        t.[Address] AS [Address],
        t.[City] AS [City],
        t.[State] AS [State],
        t.[IDNumber] AS [IDProofNumber],
        t.[CreatedAt] AS [CreatedAt],
        t.[UpdatedAt] AS [UpdatedAt],
        t.[IsActive] AS [IsActive],
        ipt.[Name] AS [IDProofType],
        u.[UserID] AS [UserID]
    FROM [dbo].[Teachers] t
    LEFT JOIN [dbo].[IDProofTypes] ipt ON t.[IDProofTypeID] = ipt.[IDProofTypeID]
    LEFT JOIN [dbo].[Users] u ON t.[UserID] = u.[UserID]
    WHERE t.[IsActive] = @IsActive
    ORDER BY t.[Name];
END;
GO

-- Get teacher by ID
CREATE OR ALTER PROCEDURE [dbo].[sp_GetTeacherById]
    @TeacherID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        t.[TeacherID] AS [TeacherID],
        t.[Name] AS [Name],
        t.[Email] AS [Email],
        t.[Phone] AS [Phone],
        t.[Address] AS [Address],
        t.[City] AS [City],
        t.[State] AS [State],
        t.[IDNumber] AS [IDProofNumber],
        t.[CreatedAt] AS [CreatedAt],
        t.[UpdatedAt] AS [UpdatedAt],
        t.[IsActive] AS [IsActive],
        ipt.[Name] AS [IDProofType],
        u.[UserID] AS [UserID]
    FROM [dbo].[Teachers] t
    LEFT JOIN [dbo].[IDProofTypes] ipt ON t.[IDProofTypeID] = ipt.[IDProofTypeID]
    LEFT JOIN [dbo].[Users] u ON t.[UserID] = u.[UserID]
    WHERE t.[TeacherID] = @TeacherID;
END;
GO

-- Create teacher
CREATE OR ALTER PROCEDURE [dbo].[sp_InsertTeacher]
    @UserID INT = NULL,
    @Name NVARCHAR(255),
    @Email NVARCHAR(255) = NULL,
    @Phone NVARCHAR(50) = NULL,
    @Address NVARCHAR(MAX) = NULL,
    @City NVARCHAR(100) = NULL,
    @State NVARCHAR(100) = NULL,
    @IDProofTypeID INT = NULL,
    @IDNumber NVARCHAR(100) = NULL,
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        INSERT INTO [dbo].[Teachers] (
            [UserID], [Name], [Email], [Phone], [Address], 
            [City], [State], [IDProofTypeID], [IDNumber]
        )
        VALUES (
            @UserID, @Name, @Email, @Phone, @Address,
            @City, @State, @IDProofTypeID, @IDNumber
        );
        
        SET @Output = 'Success';
        SELECT SCOPE_IDENTITY() AS [TeacherID];
    END TRY
    BEGIN CATCH
        SET @Output = 'Error';
        THROW;
    END CATCH
END;
GO

-- Update teacher
CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateTeacher]
    @TeacherID INT,
    @Name NVARCHAR(255) = NULL,
    @Email NVARCHAR(255) = NULL,
    @Phone NVARCHAR(50) = NULL,
    @Address NVARCHAR(MAX) = NULL,
    @City NVARCHAR(100) = NULL,
    @State NVARCHAR(100) = NULL,
    @IDProofTypeID INT = NULL,
    @IDNumber NVARCHAR(100) = NULL,
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        UPDATE [dbo].[Teachers]
        SET 
            [Name] = ISNULL(@Name, [Name]),
            [Email] = ISNULL(@Email, [Email]),
            [Phone] = ISNULL(@Phone, [Phone]),
            [Address] = ISNULL(@Address, [Address]),
            [City] = ISNULL(@City, [City]),
            [State] = ISNULL(@State, [State]),
            [IDProofTypeID] = ISNULL(@IDProofTypeID, [IDProofTypeID]),
            [IDNumber] = ISNULL(@IDNumber, [IDNumber]),
            [UpdatedAt] = GETUTCDATE()
        WHERE [TeacherID] = @TeacherID;
        
        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        SET @Output = 'Error';
        THROW;
    END CATCH
END;
GO

-- =============================================
-- CLUSTERS MANAGEMENT STORED PROCEDURES
-- =============================================

-- Get all clusters
CREATE OR ALTER PROCEDURE [dbo].[sp_GetAllClusters]
    @IsActive BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        c.[ClusterID] AS [Id],
        c.[Name] AS [Name],
        c.[Address] AS [Address],
        c.[City] AS [City],
        c.[State] AS [State],
        c.[Latitude] AS [Latitude],
        c.[Longitude] AS [Longitude],
        c.[GeoRadiusMeters] AS [GeoRadiusMeters],
        c.[CreatedAt] AS [CreatedAt],
        c.[UpdatedAt] AS [UpdatedAt],
        c.[IsActive] AS [IsActive]
    FROM [dbo].[Clusters] c
    WHERE c.[IsActive] = @IsActive
    ORDER BY c.[Name];
END;
GO

-- Get cluster by ID
CREATE OR ALTER PROCEDURE [dbo].[sp_GetClusterById]
    @ClusterID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        c.[ClusterID] AS [ClusterID],
        c.[Name] AS [Name],
        c.[Address] AS [Address],
        c.[City] AS [City],
        c.[State] AS [State],
        c.[Latitude] AS [Latitude],
        c.[Longitude] AS [Longitude],
        c.[GeoRadiusMeters] AS [GeoRadiusMeters],
        c.[CreatedAt] AS [CreatedAt],
        c.[UpdatedAt] AS [UpdatedAt],
        c.[IsActive] AS [IsActive]
    FROM [dbo].[Clusters] c
    WHERE c.[ClusterID] = @ClusterID;
END;
GO

-- Create cluster
CREATE OR ALTER PROCEDURE [dbo].[sp_InsertCluster]
    @Name NVARCHAR(255),
    @Address NVARCHAR(MAX) = NULL,
    @City NVARCHAR(100) = NULL,
    @State NVARCHAR(100) = NULL,
    @Latitude DECIMAL(10, 8) = NULL,
    @Longitude DECIMAL(11, 8) = NULL,
    @GeoRadiusMeters INT = 200,
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        INSERT INTO [dbo].[Clusters] (
            [Name], [Address], [City], [State], 
            [Latitude], [Longitude], [GeoRadiusMeters]
        )
        VALUES (
            @Name, @Address, @City, @State,
            @Latitude, @Longitude, @GeoRadiusMeters
        );
        
        SET @Output = 'Success';
        SELECT SCOPE_IDENTITY() AS [ClusterID];
    END TRY
    BEGIN CATCH
        SET @Output = 'Error';
        THROW;
    END CATCH
END;
GO

-- Update cluster
CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateCluster]
    @ClusterID INT,
    @Name NVARCHAR(255) = NULL,
    @Address NVARCHAR(MAX) = NULL,
    @City NVARCHAR(100) = NULL,
    @State NVARCHAR(100) = NULL,
    @Latitude DECIMAL(10, 8) = NULL,
    @Longitude DECIMAL(11, 8) = NULL,
    @GeoRadiusMeters INT = NULL,
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        UPDATE [dbo].[Clusters]
        SET 
            [Name] = ISNULL(@Name, [Name]),
            [Address] = ISNULL(@Address, [Address]),
            [City] = ISNULL(@City, [City]),
            [State] = ISNULL(@State, [State]),
            [Latitude] = ISNULL(@Latitude, [Latitude]),
            [Longitude] = ISNULL(@Longitude, [Longitude]),
            [GeoRadiusMeters] = ISNULL(@GeoRadiusMeters, [GeoRadiusMeters]),
            [UpdatedAt] = GETUTCDATE()
        WHERE [ClusterID] = @ClusterID;
        
        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        SET @Output = 'Error';
        THROW;
    END CATCH
END;
GO

-- =============================================
-- PROGRAMS MANAGEMENT STORED PROCEDURES
-- =============================================

-- Get all programs
CREATE OR ALTER PROCEDURE [dbo].[sp_GetAllPrograms]
    @IsActive BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        p.[ProgramID] AS [Id],
        p.[Name] AS [Name],
        p.[Description] AS [Description],
        p.[CreatedAt] AS [CreatedAt],
        p.[UpdatedAt] AS [UpdatedAt],
        p.[IsActive] AS [IsActive]
    FROM [dbo].[Programs] p
    WHERE p.[IsActive] = @IsActive
    ORDER BY p.[Name];
END;
GO

-- Get program by ID
CREATE OR ALTER PROCEDURE [dbo].[sp_GetProgramById]
    @ProgramID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        p.[ProgramID] AS [ProgramID],
        p.[Name] AS [Name],
        p.[Description] AS [Description],
        p.[CreatedAt] AS [CreatedAt],
        p.[UpdatedAt] AS [UpdatedAt],
        p.[IsActive] AS [IsActive]
    FROM [dbo].[Programs] p
    WHERE p.[ProgramID] = @ProgramID;
END;
GO

-- Create program
CREATE OR ALTER PROCEDURE [dbo].[sp_InsertProgram]
    @Name NVARCHAR(255),
    @Description NVARCHAR(MAX) = NULL,
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        INSERT INTO [dbo].[Programs] ([Name], [Description])
        VALUES (@Name, @Description);
        
        SET @Output = 'Success';
        SELECT SCOPE_IDENTITY() AS [ProgramID];
    END TRY
    BEGIN CATCH
        SET @Output = 'Error';
        THROW;
    END CATCH
END;
GO

-- Update program
CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateProgram]
    @ProgramID INT,
    @Name NVARCHAR(255) = NULL,
    @Description NVARCHAR(MAX) = NULL,
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        UPDATE [dbo].[Programs]
        SET 
            [Name] = ISNULL(@Name, [Name]),
            [Description] = ISNULL(@Description, [Description]),
            [UpdatedAt] = GETUTCDATE()
        WHERE [ProgramID] = @ProgramID;
        
        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        SET @Output = 'Error';
        THROW;
    END CATCH
END;
GO

-- =============================================
-- DONORS MANAGEMENT STORED PROCEDURES
-- =============================================

-- Get all donors
CREATE OR ALTER PROCEDURE [dbo].[sp_GetAllDonors]
    @IsActive BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        d.[DonorID] AS [DonorID],
        d.[DonorCode] AS [DonorCode],
        d.[Name] AS [Name],
        d.[DateOfBirth] AS [DateOfBirth],
        d.[Email] AS [Email],
        d.[Phone] AS [Phone],
        d.[Address] AS [Address],
        d.[City] AS [City],
        d.[State] AS [State],
        d.[IDNumber] AS [IDProofNumber],
        d.[CreatedAt] AS [CreatedAt],
        d.[UpdatedAt] AS [UpdatedAt],
        d.[IsActive] AS [IsActive],
        ipt.[Name] AS [IDProofType]
    FROM [dbo].[Donors] d
    LEFT JOIN [dbo].[IDProofTypes] ipt ON d.[IDProofTypeID] = ipt.[IDProofTypeID]
    WHERE d.[IsActive] = @IsActive
    ORDER BY d.[Name];
END;
GO

-- Get donor by ID
CREATE OR ALTER PROCEDURE [dbo].[sp_GetDonorById]
    @DonorID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        d.[DonorID] AS [DonorID],
        d.[DonorCode] AS [DonorCode],
        d.[Name] AS [Name],
        d.[DateOfBirth] AS [DateOfBirth],
        d.[Email] AS [Email],
        d.[Phone] AS [Phone],
        d.[Address] AS [Address],
        d.[City] AS [City],
        d.[State] AS [State],
        d.[IDNumber] AS [IDProofNumber],
        d.[CreatedAt] AS [CreatedAt],
        d.[UpdatedAt] AS [UpdatedAt],
        d.[IsActive] AS [IsActive],
        ipt.[Name] AS [IDProofType]
    FROM [dbo].[Donors] d
    LEFT JOIN [dbo].[IDProofTypes] ipt ON d.[IDProofTypeID] = ipt.[IDProofTypeID]
    WHERE d.[DonorID] = @DonorID;
END;
GO

  
-- Create donor  
CREATE OR ALTER PROCEDURE [dbo].[sp_InsertDonor]  
    @Name NVARCHAR(255),  
    @DateOfBirth DATE = NULL,  
    @IDProofTypeID INT = NULL,  
    @IDNumber NVARCHAR(100) = NULL, 
	@Company NVARCHAR(MAX) = NULL,
	@DonorType NVARCHAR(100) = NULL,   
    @Email NVARCHAR(255) = NULL,  
    @Phone NVARCHAR(50) = NULL,  
    @Address NVARCHAR(MAX) = NULL,  
    @City NVARCHAR(100) = NULL,  
    @State NVARCHAR(100) = NULL,  
    @Output NVARCHAR(50) OUTPUT  
AS  
BEGIN  
    SET NOCOUNT ON;  
      
    BEGIN TRY  
        INSERT INTO [dbo].[Donors] (  
            [Name], [DateOfBirth], [IDProofTypeID], [IDNumber],[Company],[DonorType],
            [Email], [Phone], [Address], [City], [State]  
        )  
        VALUES (  
            @Name, @DateOfBirth, @IDProofTypeID, @IDNumber, @Company, @DonorType,
            @Email, @Phone, @Address, @City, @State  
        );  
          
        SET @Output = 'Success';  
        SELECT SCOPE_IDENTITY() AS [DonorID];  
    END TRY  
    BEGIN CATCH  
        SET @Output = 'Error';  
        THROW;  
    END CATCH  
END;  
GO

-- Update donor
CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateDonor]
    @DonorID INT,
    @Name NVARCHAR(255) = NULL,
    @DateOfBirth DATE = NULL,
    @IDProofTypeID INT = NULL,
    @IDNumber NVARCHAR(100) = NULL,
	@Company NVARCHAR(100) = NULL,
	@DonorType NVARCHAR(100) = NULL,   
    @Email NVARCHAR(255) = NULL,
    @Phone NVARCHAR(50) = NULL,
    @Address NVARCHAR(MAX) = NULL,
    @City NVARCHAR(100) = NULL,
    @State NVARCHAR(100) = NULL,
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        UPDATE [dbo].[Donors]
        SET 
            [Name] = ISNULL(@Name, [Name]),
            [DateOfBirth] = ISNULL(@DateOfBirth, [DateOfBirth]),
            [IDProofTypeID] = ISNULL(@IDProofTypeID, [IDProofTypeID]),
            [IDNumber] = ISNULL(@IDNumber, [IDNumber]),
			[Company]=ISNULL(@Company, [Company]),
			[DonorType]=ISNULL(@DonorType, [DonorType]),
            [Email] = ISNULL(@Email, [Email]),
            [Phone] = ISNULL(@Phone, [Phone]),
            [Address] = ISNULL(@Address, [Address]),
            [City] = ISNULL(@City, [City]),
            [State] = ISNULL(@State, [State]),
            [UpdatedAt] = GETUTCDATE()
        WHERE [DonorID] = @DonorID;
        
        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        SET @Output = 'Error';
        THROW;
    END CATCH
END;
GO

--Delete Donor
CREATE OR ALTER PROCEDURE sp_DeleteDonor
    @DonorID INT,
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        DELETE FROM Donors WHERE DonorID = @DonorID;

        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        SET @Output = 'Error';
    END CATCH
END
GO
-- =============================================
-- ACADEMIC YEARS MANAGEMENT STORED PROCEDURES
-- =============================================

-- Get all academic years
CREATE OR ALTER PROCEDURE [dbo].[sp_GetAllAcademicYears]
    @IsActive BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ay.[AcademicYearID] AS [Id],
        ay.[Name] AS [Name],
        ay.[StartDate] AS [StartDate],
        ay.[EndDate] AS [EndDate],
        ay.[IsCurrent] AS [IsCurrent],
        ay.[CreatedAt] AS [CreatedAt],
        ay.[UpdatedAt] AS [UpdatedAt],
        ay.[IsActive] AS [IsActive]
    FROM [dbo].[AcademicYears] ay
    WHERE ay.[IsActive] = @IsActive
    ORDER BY ay.[StartDate] DESC;
END;
GO

-- Get current academic year
CREATE OR ALTER PROCEDURE [dbo].[sp_GetCurrentAcademicYear]
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ay.[AcademicYearID] AS [Id],
        ay.[Name] AS [Name],
        ay.[StartDate] AS [StartDate],
        ay.[EndDate] AS [EndDate],
        ay.[IsCurrent] AS [IsCurrent],
        ay.[CreatedAt] AS [CreatedAt],
        ay.[UpdatedAt] AS [UpdatedAt],
        ay.[IsActive] AS [IsActive]
    FROM [dbo].[AcademicYears] ay
    WHERE ay.[IsCurrent] = 1;
END;
GO

-- =============================================
-- DONATIONS MANAGEMENT STORED PROCEDURES
-- =============================================

-- Get all donations
CREATE OR ALTER PROCEDURE [dbo].[sp_GetAllDonations]
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        d.[DonationId] AS [Id],
        d.[DonorId] AS [DonorId],
        d.[Amount] AS [Amount],
        d.[DonationDate] AS [DonationDate],
        d.[PaymentModeID] AS [PaymentModeID],
        d.[ReferenceNumber] AS [ReferenceNumber],
        d.[Currency] AS [Currency],
        d.[Remarks] AS [Remarks]
    FROM [dbo].[Donations] d
    ORDER BY d.[DonationDate] DESC;
END;
GO

-- Get donation by ID
CREATE OR ALTER PROCEDURE [dbo].[sp_GetDonationById]
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        d.[DonationId] AS [Id],
        d.[DonorId] AS [DonorId],
        d.[Amount] AS [Amount],
        d.[DonationDate] AS [DonationDate],
        d.[PaymentModeID] AS [PaymentModeID],
        d.[ReferenceNumber] AS [ReferenceNumber],
        d.[Currency] AS [Currency],
        d.[Remarks] AS [Remarks]
    FROM [dbo].[Donations] d
    WHERE d.[DonationId] = @Id;
END;
GO

-- Create donation
CREATE OR ALTER PROCEDURE [dbo].[sp_CreateDonation]
    @DonorId INT,
    @Amount DECIMAL(18,2),
    @DonationDate DATETIME,
    @PaymentModeID INT = NULL,
    @ReferenceNumber NVARCHAR(100) = NULL,
    @Currency NVARCHAR(10) = NULL,
    @Remarks NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO [dbo].[Donations] (
        [DonorId], [Amount], [DonationDate], [PaymentModeID], 
        [ReferenceNumber], [Currency], [Remarks]
    )
    VALUES (
        @DonorId, @Amount, @DonationDate, @PaymentModeID, 
        @ReferenceNumber, @Currency, @Remarks
    );
END;
GO

-- Update donation
CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateDonation]
    @Id INT,
    @DonorId INT,
    @Amount DECIMAL(18,2),
    @DonationDate DATETIME,
    @PaymentModeID INT = NULL,
    @ReferenceNumber NVARCHAR(100) = NULL,
    @Currency NVARCHAR(10) = NULL,
    @Remarks NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE [dbo].[Donations]
    SET 
        [DonorId] = @DonorId,
        [Amount] = @Amount,
        [DonationDate] = @DonationDate,
        [PaymentModeID] = @PaymentModeID,
        [ReferenceNumber] = @ReferenceNumber,
        [Currency] = @Currency,
        [Remarks] = @Remarks
    WHERE [DonationId] = @Id;
END;
GO

-- Delete donation
CREATE OR ALTER PROCEDURE [dbo].[sp_DeleteDonation]
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DELETE FROM [dbo].[Donations] WHERE [DonationId] = @Id;
END;
GO

-- Updated: Get all donors with donations
CREATE OR ALTER PROCEDURE [dbo].[sp_GetAllDonorsWithDonations]
AS
BEGIN
    SELECT d.*, 
        (SELECT 
            DonationId, DonorId, Amount, DonationDate, PaymentModeID, ReferenceNumber, Currency, Remarks
         FROM Donations dn WHERE dn.DonorId = d.DonorID FOR JSON PATH) AS donations
    FROM Donors d
END
GO

--Teacher Assignment Changes
CREATE OR ALTER PROCEDURE [dbo].[sp_CreateTeacherAssignment]
    @TeacherID INT,
    @AcademicYearID INT,
    @ClusterID INT,
    @ProgramID INT,
    @Role NVARCHAR(20),
    @IsActive BIT,
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        INSERT INTO TeacherAssignments (TeacherID, AcademicYearID, ClusterID, ProgramID, Role, IsActive)
        VALUES (@TeacherID, @AcademicYearID, @ClusterID, @ProgramID, @Role, @IsActive);
        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        SET @Output = ERROR_MESSAGE();
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateTeacherAssignment]
    @TeacherAssignmentID INT,
    @TeacherID INT,
    @AcademicYearID INT,
    @ClusterID INT,
    @ProgramID INT,
    @Role NVARCHAR(20),
    @IsActive BIT,
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        UPDATE TeacherAssignments
        SET TeacherID = @TeacherID,
            AcademicYearID = @AcademicYearID,
            ClusterID = @ClusterID,
            ProgramID = @ProgramID,
            Role = @Role,
            IsActive = @IsActive,
            UpdatedAt = GETUTCDATE()
        WHERE TeacherAssignmentID = @TeacherAssignmentID;
        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        SET @Output = ERROR_MESSAGE();
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_DeleteTeacherAssignment]
    @TeacherAssignmentID INT,
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        DELETE FROM TeacherAssignments
        WHERE TeacherAssignmentID = @TeacherAssignmentID;
        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        SET @Output = ERROR_MESSAGE();
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE sp_GetClusterProgramCombinations
    @AcademicYearID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        c.ClusterID,
        c.Name AS ClusterName,
        p.ProgramID,
        p.Name AS ProgramName
    FROM Clusters c
	INNER JOIN Programs p ON 1=1
    WHERE
        EXISTS (
            SELECT 1
            FROM TeacherAssignments ta
            WHERE ta.ClusterID = c.ClusterID
              AND ta.ProgramID = p.ProgramID
              AND ta.AcademicYearID = @AcademicYearID
              AND ta.IsActive = 0
        )
    ORDER BY c.Name, p.Name
END
GO

CREATE OR ALTER PROCEDURE sp_GetClustersForProgram
    @ProgramID INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        c.ClusterID AS Id,
        c.Name,
        c.Address,
        c.City,
        c.State,
        c.Latitude,
        c.Longitude,
        c.GeoRadiusMeters,
        c.IsActive,
        c.CreatedAt,
        c.UpdatedAt
    FROM Clusters c
    INNER JOIN TeacherAssignments ta ON c.ClusterID = ta.ClusterID
    WHERE ta.ProgramID = @ProgramID AND ta.IsActive = 1
END
GO

CREATE OR ALTER PROCEDURE sp_GetStudentsForProgram
    @ProgramID INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        s.StudentID,
        s.Name,
        s.StudentCode,
        s.DateOfBirth,
        s.Address,
        s.City,
        s.State,
        s.IDNumber as IDProofNumber,
        ca.Name as CasteCategory,
        id.Name as IDProofType,
        sar.ClassGrade,
        sar.SchoolName,
        sar.AttendancePercentage,
        sar.ResultPercentage,
        s.IsActive,
        s.CreatedAt,
        s.UpdatedAt
    FROM Students s
    INNER JOIN StudentAcademicRecords sar ON s.StudentID = sar.StudentID
	INNER JOIN IDProofTypes id ON id.IDProofTypeID = s.IDProofTypeID
	INNER JOIN CasteCategories ca ON ca.CasteCategoryID = s.CasteID
    WHERE sar.ProgramID = @ProgramID AND s.IsActive = 1
END
GO

PRINT 'Part 5: Stored Procedures for API Endpoints created successfully';
GO
