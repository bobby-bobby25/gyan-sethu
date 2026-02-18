-- =============================================
-- PART 5: STORED PROCEDURES FOR API ENDPOINTS
-- SQL Server Migration for StudentHub Application
-- =============================================

USE [gyansethu]
GO

-- =============================================
-- LOGIN AND REGISTER PROCEDURES
-- =============================================

-- Get Login Details (used by LoginController)
IF EXISTS(SELECT 1 FROM SYS.PROCEDURES WHERE NAME='spCMNStudentHub_GetLoginDetails')
DROP PROCEDURE spCMNStudentHub_GetLoginDetails
GO
-- EXEC spCMNStudentHub_GetLoginDetails 'Testadmin@yahoo.com'
CREATE PROCEDURE spCMNStudentHub_GetLoginDetails
    @Email NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        U.UserID,
		UP.FullName,
        U.Email,
        U.PasswordHash,
        STRING_AGG(R.RoleName, ',') AS Role
    FROM Users U
    INNER JOIN UserRoles UR ON U.UserID = UR.UserID
	INNER JOIN UserProfiles UP ON U.UserID = UP.UserID
    INNER JOIN Roles R ON UR.RoleID = R.RoleID
    WHERE 
        U.Email = @Email
        AND U.IsActive = 1
    GROUP BY 
        U.UserID, UP.FullName, U.Email, U.PasswordHash;
END;
GO

-- Register User
IF EXISTS(SELECT 1 FROM SYS.PROCEDURES WHERE NAME='spCMNStudentHub_RegisterUser')
DROP PROCEDURE spCMNStudentHub_RegisterUser
GO
CREATE PROCEDURE spCMNStudentHub_RegisterUser
(
    @Email NVARCHAR(255),
    @PasswordHash NVARCHAR(255),
	@RoleId INT,
    @FullName NVARCHAR(150) = NULL,
    @Output NVARCHAR(50) OUTPUT
)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF EXISTS (SELECT 1 FROM Users WHERE Email = @Email)
        BEGIN
            SET @Output = 'UserExists';
            ROLLBACK;
            RETURN;
        END

        INSERT INTO Users (Email, PasswordHash)
        VALUES (@Email, @PasswordHash);

        DECLARE @UserId INT = SCOPE_IDENTITY();

        -- Profile
        INSERT INTO UserProfiles (UserID, FullName)
        VALUES (@UserId, ISNULL(@FullName, @Email));

        INSERT INTO UserRoles (UserID, RoleID)
        VALUES (@UserId, @RoleId);

        COMMIT;

        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        SET @Output = 'Error';
    END CATCH
END;
GO

-- Check/Add Refresh Token
IF EXISTS(SELECT 1 FROM SYS.PROCEDURES WHERE NAME='spMbl_CMN_CheckAddRefreshToken')
DROP PROCEDURE spMbl_CMN_CheckAddRefreshToken
GO
/*****************************************************  
NAME			=>	[spMbl_CMN_CheckAddRefreshToken]
CREATED BY		=>	
CREATED ON		=>  
MODIFIED BY		=>  
MODIFIED ON		=>  

DECLARE @Output VARCHAR(100)
EXEC spMbl_CMN_CheckAddRefreshToken 'B39tr6iN46NE15FZiwLy9kMu1F6s4k9UfcRuOEImnv2ra3tQldJbjkgSgJzf+e1jMx+bBEyNfBVPSi3rD32Ndw==',377, '08-12-2025 15:26:28', 'CHECK', @Output OUTPUT
SELECT @Output
*****************************************************/
CREATE PROCEDURE spMbl_CMN_CheckAddRefreshToken
(
@RefreshToken	    NVARCHAR(200),
@LoginID			INT,
@RefreshExpiry		DATETIME NULL,
@Type				VARCHAR(100),
@Output				VARCHAR(100) OUTPUT
)	
AS
BEGIN
	BEGIN TRY  
	  BEGIN TRANSACTION
		SET NOCOUNT ON 
		SET XACT_ABORT ON 
		IF(@Type = 'CHECK')
		BEGIN
			IF EXISTS(SELECT 1 FROM Mbl_CMN_RefreshTokenDtls WITH(NOLOCK) WHERE Token = @RefreshToken AND UserId = @LoginID 
					  AND Expires > GETDATE() AND CAST(ISNULL(Revoked,0) AS BIT) <> CAST(1 AS BIT))
				SET @Output = 'Token_Valid'
			ELSE
				SET @Output = 'Invalid'
		END
		ELSE
		BEGIN
			IF EXISTS(SELECT 1 FROM Mbl_CMN_RefreshTokenDtls WITH(NOLOCK) WHERE UserId = @LoginID)
				BEGIN
					UPDATE Mbl_CMN_RefreshTokenDtls 
						SET Token = @RefreshToken,
						Expires = @RefreshExpiry
						WHERE UserId = @LoginID;
					SET @Output = 'Successfully Updated'
				END
			ELSE
				BEGIN
					INSERT INTO Mbl_CMN_RefreshTokenDtls(UserId, Token, Expires, Created)
					VALUES (@LoginID, @RefreshToken, @RefreshExpiry, GETDATE());
					SET @Output = 'Successfully Inserted'
				END
		END
		SELECT @Output
	 COMMIT TRANSACTION
	END TRY  
	BEGIN CATCH
		ROLLBACK TRANSACTION         
		DECLARE @ErrorMsg VARCHAR(100), @ErrSeverity INT, @ERRORLINE VARCHAR(200)  
		SELECT @ErrorMsg = ERROR_MESSAGE(), @ErrSeverity = ERROR_SEVERITY(), @ERRORLINE = ERROR_LINE(); 					
		INSERT INTO CMN_Exception (SPName, ErrorDesc, CreatedDate, CreatedBy) 
		VALUES(OBJECT_NAME(@@PROCID), @ErrorMsg, GETDATE(), 1) 
		RAISERROR (@ErrorMsg, @ErrSeverity, @ERRORLINE) ; 
	END CATCH 
END				
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
        ISNULL(up.[FullName],'') AS [FullName],
        ISNULL(u.[Phone],'') AS [Phone],
        u.[CreatedAt] AS [CreatedAt],
        u.[UpdatedAt] AS [UpdatedAt],
        r.[RoleName] AS [Role],
        u.[IsActive] AS [IsActive]
    FROM [dbo].[Users] u
    LEFT JOIN [dbo].[UserRoles] ur ON u.[UserID] = ur.[UserID]
	LEFT JOIN [dbo].[UserProfiles] up ON u.[UserID] = up.[UserID]
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
        ISNULL(u.[FullName],'') AS [FullName],
        ISNULL(u.[Phone],'') AS [Phone],
        u.[CreatedAt] AS [CreatedAt],
        u.[UpdatedAt] AS [UpdatedAt],
        ISNULL(r.[RoleName],'') AS [Role],
        u.[IsActive] AS [IsActive]
    FROM [dbo].[Users] u
    LEFT JOIN [dbo].[UserRoles] ur ON u.[UserID] = ur.[UserID]
    LEFT JOIN [dbo].[Roles] r ON ur.[RoleID] = r.[RoleID]
    WHERE u.[UserID] = @UserID;
END;
GO

-- Get user by Email
CREATE OR ALTER PROCEDURE [dbo].[sp_GetUserByEmail]
    @Email NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        u.[UserID] AS [UserID],
        u.[Email] AS [Email],
        ISNULL(u.[FullName],'') AS [FullName],
        ISNULL(u.[Phone],'') AS [Phone],
        u.[CreatedAt] AS [CreatedAt],
        u.[UpdatedAt] AS [UpdatedAt],
        ISNULL(r.[RoleName],'') AS [Role],
        u.[IsActive] AS [IsActive]
    FROM [dbo].[Users] u
    LEFT JOIN [dbo].[UserRoles] ur ON u.[UserID] = ur.[UserID]
    LEFT JOIN [dbo].[Roles] r ON ur.[RoleID] = r.[RoleID]
    WHERE u.[Email] = @Email;
END;
GO

-- Update user profile
CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateUserProfile]
    @UserID INT,
    @FullName NVARCHAR(255) = NULL,
    @Phone NVARCHAR(50) = NULL,
    @RoleName NVARCHAR(50),
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
	    -- Get RoleID from RoleName
        DECLARE @RoleID INT;
        SELECT @RoleID = [RoleID] FROM [dbo].[Roles] WHERE [RoleName] = @RoleName;

        UPDATE [dbo].[Users]
        SET 
            [FullName] = ISNULL(@FullName, [FullName]),
            [Phone] = ISNULL(@Phone, [Phone]),
            [UpdatedAt] = GETUTCDATE()
        WHERE [UserID] = @UserID;

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

-- Get all students with nested data
CREATE OR ALTER PROCEDURE [dbo].[sp_GetAllStudents]
    @SearchTerm NVARCHAR(255) = NULL,
	@AcademicYearID INT = NULL,
	@LearningCentreID INT = NULL,
    @ClusterID INT = NULL,
    @ProgramID INT = NULL,
    @IsActive BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT DISTINCT
        s.[StudentID] AS [id],
        s.[Name] AS [name],
        s.[StudentCode] AS [student_code],
        ISNULL(s.[DateOfBirth],'') AS [dob],
		ISNULL(s.[Gender],'') AS [Gender],
		ISNULL(s.[City],'') AS [City],
		ISNULL(s.[State],'') AS [State],
		ISNULL(s.[Ambition],'') AS [Ambition],
		ISNULL(s.[Hobbies],'') AS [Hobbies],
		ISNULL(s.[Notes],'') AS [Notes], 
        ISNULL(s.[CasteID],0) AS [caste_category_id],
        ISNULL(s.[IDProofTypeID],0) AS [id_proof_type_id],
        ISNULL(s.[IDNumber],'') AS [id_proof_number],
        ISNULL(s.[PhotoDocumentID],'') AS [photo_document_id],
        ISNULL(s.[Address],'') AS [address],
		ISNULL(s.[Phone],'') AS [phone],
        ISNULL(s.[Email],'') AS [Email],
        s.[CreatedAt] AS [created_at],
        s.[UpdatedAt] AS [updated_at],
        s.[IsActive] AS [is_active],
        ISNULL(sar.[StudentAcademicRecordID], 0) AS [academic_record_id],
        ISNULL(sar.[ClusterID], 0) AS [cluster_id],
        ISNULL(sar.[ProgramID], 0) AS [program_id],
        ISNULL(sar.[AcademicYearID], 0) AS [academic_year_id],
        ISNULL(sar.[ClassGrade], '') AS [class_grade],
        ISNULL(sar.[SchoolName], '') AS [school_name],
        ISNULL(sar.[AttendancePercentage], 0) AS [attendance_percentage],
        ISNULL(sar.[ResultPercentage], 0) AS [result_percentage],
        ISNULL(cc.[Name],'') AS [caste_category],
        ISNULL(ipt.[Name],'') AS [id_proof_type],
        ISNULL(c.[Name],'') AS [cluster],
        ISNULL(p.[Name],'') AS [program],
        ISNULL(ay.[Name],'') AS [academicyearname],
        ISNULL(ay.[IsCurrent],0) AS [academicyeariscurrent],
		ISNULL(sar.SchoolTypeID,0) AS [school_type_id],
		ISNULL(sar.MediumID,0) AS [medium_id],
		ISNULL(s.SiblingStudentCode,'') AS [sibling_student_code]
    FROM [dbo].[Students] s
    LEFT JOIN [dbo].[CasteCategories] cc ON s.[CasteID] = cc.[CasteCategoryID]
    LEFT JOIN [dbo].[IDProofTypes] ipt ON s.[IDProofTypeID] = ipt.[IDProofTypeID]
    LEFT JOIN [dbo].[StudentAcademicRecords] sar ON s.[StudentID] = sar.[StudentID]
    LEFT JOIN [dbo].[Clusters] c ON sar.[ClusterID] = c.[ClusterID]
    LEFT JOIN [dbo].[Programs] p ON sar.[ProgramID] = p.[ProgramID]
    LEFT JOIN [dbo].[AcademicYears] ay ON sar.[AcademicYearID] = ay.[AcademicYearID]
    WHERE s.[IsActive] = @IsActive
        AND (@SearchTerm IS NULL OR s.[Name] LIKE '%' + @SearchTerm + '%' OR s.[StudentCode] LIKE '%' + @SearchTerm + '%')
		AND (@AcademicYearID IS NULL OR sar.[AcademicYearID] = @AcademicYearID)
		AND (@LearningCentreID IS NULL OR sar.[LearningCentreID] = @LearningCentreID)
        AND (@ClusterID IS NULL OR sar.[ClusterID] = @ClusterID)
        AND (@ProgramID IS NULL OR sar.[ProgramID] = @ProgramID)
    ORDER BY s.[Name];
END;
GO

-- Get student by ID with nested data
CREATE OR ALTER PROCEDURE [dbo].[sp_GetStudentById]
    @StudentID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        s.[StudentID] AS [id],
        s.[Name] AS [name],
        s.[StudentCode] AS [student_code],
        ISNULL(s.[DateOfBirth],'') AS [dob],
		ISNULL(s.[Gender],'') AS [Gender],
		ISNULL(s.[City],'') AS [City],
		ISNULL(s.[State],'') AS [State],
		ISNULL(s.[Ambition],'') AS [Ambition],
		ISNULL(s.[Hobbies],'') AS [Hobbies],
		ISNULL(s.[Notes],'') AS [Notes], 
        ISNULL(s.[CasteID],0) AS [caste_category_id],
        ISNULL(s.[IDProofTypeID],0) AS [id_proof_type_id],
        ISNULL(s.[IDNumber],'') AS [id_proof_number],
		ISNULL(s.[PhotoDocumentID],'') AS [photo_document_id],
        ISNULL(s.[Address],'') AS [address],
		ISNULL(s.[Phone],'') AS [phone],
        ISNULL(s.[Email],'') AS [Email],
        s.[CreatedAt] AS [created_at],
        s.[UpdatedAt] AS [updated_at],
        s.[IsActive] AS [is_active],
        ISNULL(sar.[StudentAcademicRecordID], 0) AS [academic_record_id],
        ISNULL(sar.[ClusterID], 0) AS [cluster_id],
        ISNULL(sar.[ProgramID], 0) AS [program_id],
        ISNULL(sar.[AcademicYearID], 0) AS [academic_year_id],
        ISNULL(sar.[ClassGrade], '') AS [class_grade],
        ISNULL(sar.[SchoolName], '') AS [school_name],
        ISNULL(sar.[AttendancePercentage], 0) AS [attendance_percentage],
        ISNULL(sar.[ResultPercentage], 0) AS [result_percentage],
        ISNULL(cc.[Name],'') AS [caste_category],
        ISNULL(ipt.[Name],'') AS [id_proof_type],
        ISNULL(c.[Name],'') AS [cluster],
        ISNULL(p.[Name],'') AS [program],
        ISNULL(ay.[Name],'') AS [academicyearname],
        ISNULL(ay.[IsCurrent],0) AS [academicyeariscurrent],
		ISNULL(sar.SchoolTypeID,0) AS [school_type_id],
		ISNULL(sar.MediumID,0) AS [medium_id],
		ISNULL(s.SiblingStudentCode,'') AS [sibling_student_code]
    FROM [dbo].[Students] s
    LEFT JOIN [dbo].[CasteCategories] cc ON s.[CasteID] = cc.[CasteCategoryID]
    LEFT JOIN [dbo].[IDProofTypes] ipt ON s.[IDProofTypeID] = ipt.[IDProofTypeID]
    LEFT JOIN [dbo].[StudentAcademicRecords] sar ON s.[StudentID] = sar.[StudentID]
    LEFT JOIN [dbo].[Clusters] c ON sar.[ClusterID] = c.[ClusterID]
    LEFT JOIN [dbo].[Programs] p ON sar.[ProgramID] = p.[ProgramID]
    LEFT JOIN [dbo].[AcademicYears] ay ON sar.[AcademicYearID] = ay.[AcademicYearID]
    WHERE s.[StudentID] = @StudentID;
END;
GO

-- Create student
CREATE OR ALTER PROCEDURE [dbo].[sp_InsertStudent]
    @Name NVARCHAR(255),
    @DateOfBirth DATE = NULL,
	@Gender NVARCHAR(15) = NULL,
	@Email NVARCHAR(200) = NULL,
	@Phone NVARCHAR(100) = NULL,
	@Ambition NVARCHAR(100) = NULL,
	@Hobbies NVARCHAR(MAX) = NULL,
	@Notes NVARCHAR(MAX) = NULL,
    @IDProofTypeID INT = NULL,
    @IDNumber NVARCHAR(100) = NULL,
    @Address NVARCHAR(MAX) = NULL,
    @City NVARCHAR(100) = NULL,
    @State NVARCHAR(100) = NULL,
    @CasteID INT = NULL,
	@SiblingStudentCode NVARCHAR(100) = NULL,
	@StudentID INT OUTPUT,
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
		BEGIN TRANSACTION

        INSERT INTO [dbo].[Students] (
            [Name], [DateOfBirth], [Gender], [Email], [Phone], [Ambition], [Hobbies], 
			[Notes], [IDProofTypeID], [IDNumber], [Address], [City], [State], [CasteID],
			[SiblingStudentCode]
        )
        VALUES (
            @Name, @DateOfBirth, @Gender, @Email, @Phone, @Ambition, @Hobbies, 
			@Notes, @IDProofTypeID, @IDNumber, @Address, @City, @State, @CasteID, 
			@SiblingStudentCode
        );
        
		SET @StudentID = SCOPE_IDENTITY();

		IF (@SiblingStudentCode IS NOT NULL AND LTRIM(RTRIM(@SiblingStudentCode)) <> '')
        BEGIN
            DECLARE @SiblingStudentID INT;

            SELECT @SiblingStudentID = StudentID
            FROM [dbo].[Students]
            WHERE StudentCode = @SiblingStudentCode;

            IF (@SiblingStudentID IS NOT NULL)
            BEGIN
                INSERT INTO [dbo].[StudentFamilyMemberLinking] (
                    StudentID,
                    FamilyMemberID,
                    IsPrimary,
                    CreatedAt
                )
                SELECT
                    @StudentID,
                    sfl.FamilyMemberID,
                    CAST(0 AS BIT),
                    GETUTCDATE()
                FROM [dbo].[StudentFamilyMemberLinking] sfl
                WHERE sfl.StudentID = @SiblingStudentID
                  AND NOT EXISTS (
                      SELECT 1
                      FROM [dbo].[StudentFamilyMemberLinking] x
                      WHERE x.StudentID = @StudentID
                        AND x.FamilyMemberID = sfl.FamilyMemberID
                  );
            END
        END

        COMMIT TRANSACTION;

		SET @Output = 'Success';

    END TRY
    BEGIN CATCH
        SET @Output = 'Error';
		SET @StudentID = 0;
        THROW;
    END CATCH
END;
GO

-- Update student
CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateStudent]
    @StudentID INT,
    @Name NVARCHAR(255) = NULL,
    @DateOfBirth DATE = NULL,
	@Gender NVARCHAR(15) = NULL,
	@Email NVARCHAR(200) = NULL,
	@Phone NVARCHAR(100) = NULL,
	@Ambition NVARCHAR(100) = NULL,
	@Hobbies NVARCHAR(MAX) = NULL,
	@Notes NVARCHAR(MAX) = NULL,
    @IDProofTypeID INT = NULL,
    @IDNumber NVARCHAR(100) = NULL,
    @Address NVARCHAR(MAX) = NULL,
    @City NVARCHAR(100) = NULL,
    @State NVARCHAR(100) = NULL,
    @CasteID INT = NULL,
	@SiblingStudentCode NVARCHAR(100) = NULL,
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        UPDATE [dbo].[Students]
        SET 
            [Name] = ISNULL(@Name, [Name]),
            [DateOfBirth] = ISNULL(@DateOfBirth, [DateOfBirth]),
			[Gender] = ISNULL(@Gender, [Gender]),
			[Email] = ISNULL(@Email, [Email]),
			[Phone] = ISNULL(@Phone, [Phone]),
			[Ambition] = ISNULL(@Ambition, [Ambition]),
			[Hobbies] = ISNULL(@Hobbies, [Hobbies]),
			[Notes] = ISNULL(@Notes, [Notes]),
            [IDProofTypeID] = ISNULL(@IDProofTypeID, [IDProofTypeID]),
            [IDNumber] = ISNULL(@IDNumber, [IDNumber]),
            [Address] = ISNULL(@Address, [Address]),
            [City] = ISNULL(@City, [City]),
            [State] = ISNULL(@State, [State]),
            [CasteID] = ISNULL(@CasteID, [CasteID]),
			[SiblingStudentCode] = ISNULL(@SiblingStudentCode, ''),
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
	@LearningCentreID INT,
    @SchoolName NVARCHAR(255) = NULL,
    @ClassGrade NVARCHAR(50) = NULL,
    @AttendancePercentage DECIMAL(5,2) = NULL,
    @ResultPercentage DECIMAL(5,2) = NULL,
    @YearlyFees DECIMAL(10,2) = NULL,
    @Remarks NVARCHAR(MAX) = NULL,
	@SchoolTypeID INT = NULL,
	@MediumID INT = NULL,
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
            LearningCentreID, SchoolName, ClassGrade, AttendancePercentage,
            ResultPercentage, YearlyFees, Remarks, SchoolTypeID, MediumID, IsActive
        )
        VALUES
        (
            @StudentID, @AcademicYearID, @ClusterID, @ProgramID,
            @LearningCentreID, @SchoolName, @ClassGrade, @AttendancePercentage,
            @ResultPercentage, @YearlyFees, @Remarks, @SchoolTypeID, @MediumID, @IsActive
        );

        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        SET @Output = ERROR_MESSAGE();
    END CATCH
END
GO

--Update Academic Record
CREATE OR ALTER PROCEDURE sp_UpdateStudentAcademicRecord
    @StudentAcademicRecordID INT,
    @StudentID INT,
    @AcademicYearID INT,
    @ClusterID INT,
    @ProgramID INT,
	@LearningCentreID INT,
    @SchoolName NVARCHAR(255) = NULL,
    @ClassGrade NVARCHAR(50) = NULL,
    @AttendancePercentage DECIMAL(5,2) = NULL,
    @ResultPercentage DECIMAL(5,2) = NULL,
    @YearlyFees DECIMAL(10,2) = NULL,
    @Remarks NVARCHAR(MAX) = NULL,
	@SchoolTypeID INT = NULL,
	@MediumID INT = NULL,
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
			LearningCentreID = @LearningCentreID,
            SchoolName = @SchoolName,
            ClassGrade = @ClassGrade,
            AttendancePercentage = @AttendancePercentage,
            ResultPercentage = @ResultPercentage,
            YearlyFees = @YearlyFees,
            Remarks = @Remarks,
			SchoolTypeID = @SchoolTypeID,
			MediumID = @MediumID,
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

--Get Academic Record
CREATE OR ALTER PROCEDURE sp_GetStudentAcademicRecords
(
    @StudentID INT
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ISNULL(sar.StudentAcademicRecordID,0)	AS Id,
        ISNULL(sar.StudentID,0)					AS StudentId,
        ISNULL(sar.AcademicYearID,0)			AS AcademicYearId,
        ISNULL(sar.ClusterID,0)					AS ClusterId,
        ISNULL(sar.ProgramID,0)					AS ProgramId,
        ISNULL(sar.LearningCentreID,0)			AS LearningCentreId,
        ISNULL(sar.SchoolName,'')			    AS SchoolName,
        sar.ClassGrade,
        sar.AttendancePercentage,
        sar.ResultPercentage,
        sar.YearlyFees,
        ISNULL(sar.Remarks,'')					AS Remarks,
        sar.IsActive,
        ISNULL(c.Name,'')						AS ClusterName,
        ISNULL(p.Name,'')						AS ProgramName,
		ISNULL(lc.Name,'')						AS LearningCentreName,
        ISNULL(ay.Name,'')						AS AcademicYearName,
        ay.IsCurrent							AS AcademicYearIsCurrent,
		ISNULL(sar.SchoolTypeID,0)				AS SchoolTypeId,
		ISNULL(sar.MediumID,0)					AS MediumId

    FROM StudentAcademicRecords sar
    INNER JOIN Clusters c
        ON sar.ClusterID = c.ClusterID
    INNER JOIN Programs p
        ON sar.ProgramID = p.ProgramID
	INNER JOIN LearningCentres lc
        ON sar.LearningCentreID = lc.LearningCentreID
    INNER JOIN AcademicYears ay
        ON sar.AcademicYearID = ay.AcademicYearID
    WHERE sar.StudentID = @StudentID
      AND sar.IsActive = 1
    ORDER BY ay.AcademicYearID DESC;
END
GO

-- =============================================
-- ATTENDANCE STORED PROCEDURES
-- =============================================

-- Get Attendance Records with Details
CREATE OR ALTER PROCEDURE [dbo].[sp_GetAttendanceRecords]
    @StudentID INT = NULL,
    @LearningCentreID INT = NULL,
    @ProgramID INT = NULL,
    @AcademicYearID INT = NULL,
	@StatusID INT = NULL,
    @FromDate DATE = NULL,
    @ToDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ar.[AttendanceRecordID],
        ar.[StudentID],
        s.[Name] AS [StudentName],
        s.[StudentCode],
        ar.[AttendanceDate],
		ast.[AttendanceStatusTypeID] AS [StatusId],
        ast.[Name] AS [Status],
        ast.[Code] AS [StatusCode],
		ar.[LearningCentreID] AS [LearningCentreID],
		ar.[ProgramID] AS [ProgramID],
		c.[ClusterID] AS [ClusterID],
        lc.[Name] AS [LearningCentreName],
        p.[Name] AS [ProgramName],
		c.[Name] AS [ClusterName],
		ar.[AcademicYearID] AS [AcademicYearID],
        ay.[Name] AS [AcademicYear],
		ISNULL(ar.[MarkedByTeacherID],0) AS [MarkedByTeacherID],
        ISNULL(t.[Name],'') AS [MarkedByTeacher],
        ISNULL(ar.[Latitude],0) AS [Latitude],
        ISNULL(ar.[Longitude],0) AS [Longitude],
        ar.[MarkedAt],
		ar.[CreatedAt],
		ar.[UpdatedAt]
    FROM [dbo].[AttendanceRecords] ar
    INNER JOIN [dbo].[Students] s ON ar.[StudentID] = s.[StudentID]
    INNER JOIN [dbo].[AttendanceStatusTypes] ast ON ar.[StatusID] = ast.[AttendanceStatusTypeID]
    INNER JOIN [dbo].[LearningCentres] lc ON ar.[LearningCentreID] = lc.[LearningCentreID]
    INNER JOIN [dbo].[Programs] p ON ar.[ProgramID] = p.[ProgramID]
	INNER JOIN [dbo].[Clusters] c ON c.[ClusterID] = ar.ClusterID
    INNER JOIN [dbo].[AcademicYears] ay ON ar.[AcademicYearID] = ay.[AcademicYearID]
    LEFT JOIN [dbo].[Teachers] t ON ar.[MarkedByTeacherID] = t.[TeacherID]
    WHERE (@StudentID IS NULL OR ar.[StudentID] = @StudentID)
        AND (@LearningCentreID IS NULL OR ar.[LearningCentreID] = @LearningCentreID)
        AND (@ProgramID IS NULL OR ar.[ProgramID] = @ProgramID)
        AND (@AcademicYearID IS NULL OR ar.[AcademicYearID] = @AcademicYearID)
		AND (@StatusID IS NULL OR ar.[StatusID] = @StatusID)
        AND (@FromDate IS NULL OR ar.[AttendanceDate] >= @FromDate)
        AND (@ToDate IS NULL OR ar.[AttendanceDate] <= @ToDate)
    ORDER BY ar.[AttendanceDate] DESC, s.[Name];
END;
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_GetAttendanceReport]
(
    @StartDate DATE,
    @EndDate DATE,
    @LearningCentreID INT = NULL,
    @ProgramID INT = NULL
)
AS
BEGIN
    SET NOCOUNT ON;

	SELECT
		ar.AttendanceRecordID    AS Id,
		ar.AttendanceDate        AS AttendanceDate,
		ast.Code                 AS StatusCode,
		ast.Name                 AS StatusName,
		s.Name                   AS StudentName,
		s.StudentCode            AS StudentCode,
		lc.LearningCentreID      AS LearningCentreId,
		lc.Name                  AS LearningCentreName,
		p.ProgramID              AS ProgramId,
		p.Name                   AS ProgramName,
		c.ClusterID              AS ClusterId,
		c.Name                   AS ClusterName,
		t.Name                   AS TeacherName,
		ar.MarkedAt              AS MarkedAt
    FROM dbo.AttendanceRecords ar 
	INNER JOIN dbo.Students s ON s.StudentID = ar.StudentID
    INNER JOIN dbo.AttendanceStatusTypes ast ON ast.AttendanceStatusTypeID = ar.StatusID
    INNER JOIN dbo.LearningCentres lc ON lc.LearningCentreID = ar.LearningCentreID
    INNER JOIN dbo.Programs p ON p.ProgramID = ar.ProgramID
    INNER JOIN dbo.Clusters c ON c.ClusterID = ar.ClusterID
    LEFT JOIN dbo.Teachers t ON t.TeacherID = ar.MarkedByTeacherID
    WHERE ar.AttendanceDate BETWEEN @StartDate AND @EndDate
        AND (@LearningCentreID IS NULL OR ar.LearningCentreID = @LearningCentreID)
        AND (@ProgramID IS NULL OR ar.ProgramID = @ProgramID)
    ORDER BY ar.AttendanceDate ASC, lc.Name, p.Name, s.Name;
END;
GO

-- Upsert Attendance Record
CREATE OR ALTER PROCEDURE [dbo].[sp_UpsertAttendanceRecord]
    @StudentID INT,
    @AcademicYearID INT,
    @LearningCentreID INT,
    @ProgramID INT,
	@ClusterID INT,
    @AttendanceDate DATE,
    @StatusID INT,
    @MarkedByTeacherID INT = NULL,
    @MarkedByUserID INT = NULL,
    @Latitude DECIMAL(10, 8) = NULL,
    @Longitude DECIMAL(11, 8) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if record exists
    IF EXISTS (
        SELECT 1 FROM [dbo].[AttendanceRecords]
        WHERE [StudentID] = @StudentID
            AND [ProgramID] = @ProgramID
            AND [LearningCentreID] = @LearningCentreID
            AND [AttendanceDate] = @AttendanceDate
    )
    BEGIN
        -- Update existing record
        UPDATE [dbo].[AttendanceRecords]
        SET [StatusID] = @StatusID,
            [MarkedByTeacherID] = @MarkedByTeacherID,
            [MarkedByUserID] = @MarkedByUserID,
            [Latitude] = @Latitude,
            [Longitude] = @Longitude,
            [MarkedAt] = GETUTCDATE()
        WHERE [StudentID] = @StudentID
            AND [ProgramID] = @ProgramID
            AND [LearningCentreID] = @LearningCentreID
            AND [AttendanceDate] = @AttendanceDate;
    END
    ELSE
    BEGIN
        -- Insert new record
        INSERT INTO [dbo].[AttendanceRecords] (
            [StudentID], [AcademicYearID], [LearningCentreID], [ProgramID],[ClusterID],
            [AttendanceDate], [StatusID], [MarkedByTeacherID], 
            [MarkedByUserID], [Latitude], [Longitude]
        )
        VALUES (
            @StudentID, @AcademicYearID, @LearningCentreID, @ProgramID, @ClusterID,
            @AttendanceDate, @StatusID, @MarkedByTeacherID,
            @MarkedByUserID, @Latitude, @Longitude
        );
    END
    
    SELECT SCOPE_IDENTITY() AS [AttendanceRecordID];
END;
GO


--Get Students for Attendance
CREATE OR ALTER PROCEDURE [dbo].[sp_GetStudentsForAttendance]
    @LearningCentreID INT,
	@ProgramID INT,
    @AcademicYearID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT DISTINCT 
		s.StudentID as ID, 
		s.Name as Name, 
		s.StudentCode as Student_Code
	FROM [dbo].[Students] s 
	INNER JOIN [dbo].[StudentAcademicRecords] sar ON s.[StudentID] = sar.[StudentID]
    WHERE sar.[LearningCentreID] = @LearningCentreID AND sar.[ProgramID] = @ProgramID AND sar.[AcademicYearID] = @AcademicYearID AND s.[IsActive] = 1
    ORDER BY s.[Name]
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_GetLearningCentreProgramCombinations
    @AcademicYearID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        sar.LearningCentreID     AS LearningCentreId,
        sar.ProgramID            AS ProgramId,
        lc.Name                  AS LearningCentreName,
        lc.City                  AS LearningCentreCity,
        p.Name                   AS ProgramName,
		c.ClusterID				 AS ClusterId,
		c.Name					 AS ClusterName,
        COUNT(DISTINCT sar.StudentID) AS StudentCount
    FROM dbo.StudentAcademicRecords sar
    INNER JOIN dbo.LearningCentres lc ON lc.LearningCentreID = sar.LearningCentreID AND lc.IsActive = 1
    INNER JOIN dbo.Programs p ON p.ProgramID = sar.ProgramID AND p.IsActive = 1
	INNER JOIN dbo.Clusters c ON c.ClusterID = sar.ClusterID AND c.IsActive = 1
    WHERE sar.AcademicYearID = @AcademicYearID AND sar.IsActive = 1
    GROUP BY sar.LearningCentreID, sar.ProgramID, c.ClusterID, lc.Name, lc.City, p.Name, c.Name
    ORDER BY lc.Name, p.Name;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_GetAllGrades
    @IsActive BIT = NULL,
	@LearningCentreID INT = NULL,
	@ProgramID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT DISTINCT 
	sar.ClassGrade AS NAME
    FROM dbo.StudentAcademicRecords sar
	INNER JOIN Students s ON sar.StudentID = s.StudentID
    WHERE (@IsActive IS NULL OR sar.[IsActive] = @IsActive)
		AND (@ProgramId IS NULL OR sar.ProgramID = @ProgramId)
        AND (@LearningCentreId IS NULL OR sar.LearningCentreID = @LearningCentreId)
    ORDER BY sar.ClassGrade;
END;
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
    
    SELECT DISTINCT
        t.[TeacherID] AS [id],
        t.[Name] AS [name],
		t.[Gender] AS [Gender],
		t.[DateOfBirth] AS [DateOfBirth],
        t.[Email] AS [email],
        t.[Phone] AS [phone],
        ISNULL(t.[IDProofTypeID],0) AS [idprooftypeid],
        ISNULL(t.[IDNumber], '') AS [idproofnumber],
		ISNULL(t.[PhotoDocumentID], '') AS [photodocumentid],
        ISNULL(t.[Address], '') AS [address],
        ISNULL(t.[City], '') AS [city],
        ISNULL(t.[State], '') AS [state],
		ISNULL(t.[Notes], '') AS [Notes],
        t.[CreatedAt] AS [createdat],
        t.[UpdatedAt] AS [updatedat],
        t.[IsActive] AS [isactive],
        ISNULL(ipt.[Name],'') AS [idprooftype],
        ISNULL(ta.[TeacherAssignmentID], 0) AS [teacherassignmentid],
        ISNULL(ta.[ClusterID], 0) AS [clusterid],
        ISNULL(ta.[ProgramID], 0) AS [programid],
		ISNULL(ta.[LearningCentreID], 0) AS [learningcentreid],
        ISNULL(ta.[AcademicYearID], 0) AS [academicyearid],
        ISNULL(ta.[Role], '') AS [role],
        ISNULL(c.[Name], '') AS [cluster],
        ISNULL(p.[Name], '') AS [program],
		ISNULL(lc.[Name], '') AS [learningcentre],
        ISNULL(ay.[Name], '') AS [academicyearname],
        ISNULL(ay.[IsCurrent], 0) AS [academicyeariscurrent],
		ISNULL(t.[Subjects],'') AS [subjects],
		ISNULL(t.[StudentID],0) AS [studentid],
		CASE WHEN ISNULL(t.[StudentID],0) > 0 THEN CAST(1 AS BIT) 
		ELSE CAST(0 AS BIT) END AS [isExStudent]
    FROM [dbo].[Teachers] t
    LEFT JOIN [dbo].[IDProofTypes] ipt ON t.[IDProofTypeID] = ipt.[IDProofTypeID]
    LEFT JOIN [dbo].[TeacherAssignments] ta ON t.[TeacherID] = ta.[TeacherID]
    LEFT JOIN [dbo].[Clusters] c ON ta.[ClusterID] = c.[ClusterID]
    LEFT JOIN [dbo].[Programs] p ON ta.[ProgramID] = p.[ProgramID]
	LEFT JOIN [dbo].[LearningCentres] lc ON ta.[LearningCentreID] = lc.[LearningCentreID]
    LEFT JOIN [dbo].[AcademicYears] ay ON ta.[AcademicYearID] = ay.[AcademicYearID]
    WHERE t.[IsActive] = @IsActive
    ORDER BY t.[Name];
END;
GO

-- Get teacher by ID with assignment details
CREATE OR ALTER PROCEDURE [dbo].[sp_GetTeacherById]
    @TeacherID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT DISTINCT
        t.[TeacherID] AS [id],
        t.[Name] AS [name],
		t.[Gender] AS [Gender],
		t.[DateOfBirth] AS [DateOfBirth],
        t.[Email] AS [email],
        t.[Phone] AS [phone],
        ISNULL(t.[IDProofTypeID],0) AS [idprooftypeid],
        ISNULL(t.[IDNumber], '') AS [idproofnumber],
		ISNULL(t.[PhotoDocumentID], '') AS [photodocumentid],
        ISNULL(t.[Address], '') AS [address],
        ISNULL(t.[City], '') AS [city],
        ISNULL(t.[State], '') AS [state],
		ISNULL(t.[Notes], '') AS [Notes],
        t.[CreatedAt] AS [createdat],
        t.[UpdatedAt] AS [updatedat],
        t.[IsActive] AS [isactive],
        ISNULL(ipt.[Name],'') AS [idprooftype],
        ISNULL(ta.[TeacherAssignmentID], 0) AS [teacherassignmentid],
        ISNULL(ta.[ClusterID], 0) AS [clusterid],
        ISNULL(ta.[ProgramID], 0) AS [programid],
		ISNULL(ta.[LearningCentreID], 0) AS [learningcentreid],
        ISNULL(ta.[AcademicYearID], 0) AS [academicyearid],
        ISNULL(ta.[Role], '') AS [role],
        ISNULL(c.[Name], '') AS [cluster],
        ISNULL(p.[Name], '') AS [program],
		ISNULL(lc.[Name], '') AS [learningcentre],
        ISNULL(ay.[Name], '') AS [academicyearname],
        ISNULL(ay.[IsCurrent], 0) AS [academicyeariscurrent],
		ISNULL(t.[Subjects],'') AS [subjects],
		ISNULL(t.[StudentID],0) AS [studentid],
		CASE WHEN ISNULL(t.[StudentID],0) > 0 THEN CAST(1 AS BIT) 
		ELSE CAST(0 AS BIT) END AS [isExStudent]
    FROM [dbo].[Teachers] t
    LEFT JOIN [dbo].[IDProofTypes] ipt ON t.[IDProofTypeID] = ipt.[IDProofTypeID]
    LEFT JOIN [dbo].[TeacherAssignments] ta ON t.[TeacherID] = ta.[TeacherID]
    LEFT JOIN [dbo].[Clusters] c ON ta.[ClusterID] = c.[ClusterID]
    LEFT JOIN [dbo].[Programs] p ON ta.[ProgramID] = p.[ProgramID]
	LEFT JOIN [dbo].[LearningCentres] lc ON ta.[LearningCentreID] = lc.[LearningCentreID]
    LEFT JOIN [dbo].[AcademicYears] ay ON ta.[AcademicYearID] = ay.[AcademicYearID]
    WHERE t.[TeacherID] = @TeacherID;
END;
GO

-- Create teacher
CREATE OR ALTER PROCEDURE [dbo].[sp_InsertTeacher]
(
    @Name NVARCHAR(255),
    @Gender NVARCHAR(15),
    @DateOfBirth DATE,
    @Email NVARCHAR(255),
    @Phone NVARCHAR(50) = NULL,
    @Address NVARCHAR(MAX) = NULL,
    @City NVARCHAR(100) = NULL,
    @State NVARCHAR(100) = NULL,
    @Notes NVARCHAR(MAX) = NULL,
    @IDProofTypeID INT = NULL,
    @IDNumber NVARCHAR(100) = NULL,
    @Subjects NVARCHAR(MAX) = NULL,
    @StudentId INT = NULL,
    @PasswordHash NVARCHAR(500),
    @TeacherID INT OUTPUT,
    @UserID INT OUTPUT,
    @Output NVARCHAR(50) OUTPUT
)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TeacherRoleID INT;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF EXISTS (SELECT 1 FROM dbo.Users WHERE Email = @Email)
        BEGIN
            ROLLBACK;
            SET @Output = 'User Already Exists. Please use different email';
            SET @UserID = 0;
            RETURN;
        END

        INSERT INTO dbo.Teachers(
            Gender, DateOfBirth, Name, Email, Phone, Address,
            City, State, Notes, IDProofTypeID, IDNumber, Subjects, StudentID
			)
        VALUES( @Gender, @DateOfBirth, @Name, @Email, @Phone, @Address,
            @City, @State, @Notes, @IDProofTypeID, @IDNumber, @Subjects, @StudentId
			);

        SET @TeacherID = SCOPE_IDENTITY();

        INSERT INTO dbo.Users
        (
            Email, PasswordHash, FullName, Phone
        )
        VALUES
        (
            @Email, @PasswordHash, @Name, @Phone
        );

        SET @UserID = SCOPE_IDENTITY();

        INSERT INTO dbo.UserProfiles (UserID, Email, FullName, Phone)
        VALUES (@UserID, @Email, @Name, @Phone);

        SELECT @TeacherRoleID = RoleID FROM dbo.Roles WHERE RoleName = 'teacher';

        INSERT INTO dbo.UserRoles(UserID, RoleID)
        VALUES(@UserID, @TeacherRoleID);

        UPDATE dbo.Teachers
        SET UserID = @UserID
        WHERE TeacherID = @TeacherID;

        COMMIT;

        SET @Output = 'Success';

    END TRY
    BEGIN CATCH
        ROLLBACK;
        SET @TeacherID = 0;
        SET @UserID = 0;
        SET @Output = 'Error';
        THROW;
    END CATCH
END;
GO



-- Update teacher
CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateTeacher]
    @TeacherID INT,
    @Name NVARCHAR(255) = NULL,
	@Gender NVARCHAR(15),
	@DateOfBirth DATE,
    @Email NVARCHAR(255) = NULL,
    @Phone NVARCHAR(50) = NULL,
    @Address NVARCHAR(MAX) = NULL,
    @City NVARCHAR(100) = NULL,
    @State NVARCHAR(100) = NULL,
	@Notes NVARCHAR(MAX) = NULL,
    @IDProofTypeID INT = NULL,
    @IDNumber NVARCHAR(100) = NULL,
	@Subjects NVARCHAR(MAX) = NULL,
	@StudentId INT = NULL,
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        UPDATE [dbo].[Teachers]
        SET 
            [Name] = ISNULL(@Name, [Name]),
			[Gender] = ISNULL(@Gender, [Gender]),
            [DateOfBirth] = ISNULL(@DateOfBirth, [DateOfBirth]),
            [Email] = ISNULL(@Email, [Email]),
            [Phone] = ISNULL(@Phone, [Phone]),
            [Address] = ISNULL(@Address, [Address]),
            [City] = ISNULL(@City, [City]),
            [State] = ISNULL(@State, [State]),
			[Notes] = ISNULL(@Notes, [Notes]),
            [IDProofTypeID] = ISNULL(@IDProofTypeID, [IDProofTypeID]),
            [IDNumber] = ISNULL(@IDNumber, [IDNumber]),
			[Subjects] = ISNULL(@Subjects,''),
			[StudentID] = ISNULL(@StudentId,0),
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

-- Get teacher by linked User ID with assignment details
CREATE OR ALTER PROCEDURE [dbo].[sp_GetTeacherByUserId]
    @UserID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT DISTINCT
        t.[TeacherID] AS [id],
        t.[Name] AS [name],
		t.[Gender] AS [Gender],
		t.[DateOfBirth] AS [DateOfBirth],
        t.[Email] AS [email],
        t.[Phone] AS [phone],
        ISNULL(t.[IDProofTypeID],0) AS [idprooftypeid],
        ISNULL(t.[IDNumber], '') AS [idproofnumber],
		ISNULL(t.[PhotoDocumentID], '') AS [photodocumentid],
        ISNULL(t.[Address], '') AS [address],
        ISNULL(t.[City], '') AS [city],
        ISNULL(t.[State], '') AS [state],
		ISNULL(t.[Notes], '') AS [Notes],
        t.[CreatedAt] AS [createdat],
        t.[UpdatedAt] AS [updatedat],
        t.[IsActive] AS [isactive],
        ISNULL(ipt.[Name],'') AS [idprooftype],
        ISNULL(ta.[TeacherAssignmentID], 0) AS [teacherassignmentid],
        ISNULL(ta.[ClusterID], 0) AS [clusterid],
        ISNULL(ta.[ProgramID], 0) AS [programid],
		ISNULL(ta.[LearningCentreID], 0) AS [learningcentreid],
        ISNULL(ta.[AcademicYearID], 0) AS [academicyearid],
        ISNULL(ta.[Role], '') AS [role],
        ISNULL(c.[Name], '') AS [cluster],
        ISNULL(p.[Name], '') AS [program],
		ISNULL(lc.[Name], '') AS [learningcentre],
        ISNULL(ay.[Name], '') AS [academicyearname],
        ISNULL(ay.[IsCurrent], 0) AS [academicyeariscurrent],
		ISNULL(t.[Subjects],'') AS [subjects],
		ISNULL(t.[StudentID],0) AS [studentid],
		CASE WHEN ISNULL(t.[StudentID],0) > 0 THEN CAST(1 AS BIT) 
		ELSE CAST(0 AS BIT) END AS [isExStudent]
    FROM [dbo].[Teachers] t
    LEFT JOIN [dbo].[IDProofTypes] ipt ON t.[IDProofTypeID] = ipt.[IDProofTypeID]
    LEFT JOIN [dbo].[TeacherAssignments] ta ON t.[TeacherID] = ta.[TeacherID]
    LEFT JOIN [dbo].[Clusters] c ON ta.[ClusterID] = c.[ClusterID]
    LEFT JOIN [dbo].[Programs] p ON ta.[ProgramID] = p.[ProgramID]
	LEFT JOIN [dbo].[LearningCentres] lc ON ta.[LearningCentreID] = lc.[LearningCentreID]
    LEFT JOIN [dbo].[AcademicYears] ay ON ta.[AcademicYearID] = ay.[AcademicYearID]
    WHERE t.[UserID] = @UserID;
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
        ISNULL(c.[Address],'') AS [Address],
        ISNULL(c.[City],'') AS [City],
        ISNULL(c.[State],'') AS [State],
		ISNULL(c.[Notes],'') AS [Notes],
        c.[CreatedAt] AS [CreatedAt],
        c.[UpdatedAt] AS [UpdatedAt],
        c.[IsActive] AS [IsActive]
    FROM [dbo].[Clusters] c
    WHERE c.[IsActive] = @IsActive
    ORDER BY c.[Name];
END;
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_GetAllClustersStats]
    @IsActive BIT = 1
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        c.[ClusterID]        AS [Id],
        c.[Name]             AS [Name],
        c.[Address]          AS [Address],
        c.[City]             AS [City],
        c.[State]            AS [State],
        c.[Notes]            AS [Notes],
        c.[CreatedAt]        AS [CreatedAt],
        c.[UpdatedAt]        AS [UpdatedAt],
        c.[IsActive]         AS [IsActive],
        ISNULL(st.StudentCount, 0) AS StudentCount,
        ISNULL(tc.TeacherCount, 0) AS TeacherCount,
		ISNULL(lc.LearningCentreCount, 0) AS LearningCentreCount,
        ISNULL(p.ProgramsCsv, '') AS Programs

    FROM [dbo].[Clusters] c
    LEFT JOIN (
        SELECT
            sar.ClusterID,
            COUNT(DISTINCT sar.StudentID) AS StudentCount
        FROM [dbo].[StudentAcademicRecords] sar
        WHERE sar.IsActive = 1
        GROUP BY sar.ClusterID
    ) st ON st.ClusterID = c.ClusterID

    LEFT JOIN (
        SELECT
            ta.ClusterID,
            COUNT(DISTINCT ta.TeacherID) AS TeacherCount
        FROM [dbo].[TeacherAssignments] ta
        WHERE ta.IsActive = 1
        GROUP BY ta.ClusterID
    ) tc ON tc.ClusterID = c.ClusterID

    LEFT JOIN (
        SELECT
            lc.ClusterID,
            COUNT(lc.LearningCentreID) AS LearningCentreCount
        FROM [dbo].[LearningCentres] lc
        WHERE lc.IsActive = 1
        GROUP BY lc.ClusterID
    ) lc ON lc.ClusterID = c.ClusterID

    LEFT JOIN (
        SELECT
            x.ClusterID,
            STRING_AGG(x.ProgramName, ',') AS ProgramsCsv
        FROM (
            SELECT DISTINCT
                ta.ClusterID,
                p.Name AS ProgramName
            FROM [dbo].[TeacherAssignments] ta
            INNER JOIN [dbo].[Programs] p ON p.ProgramID = ta.ProgramID
            WHERE ta.IsActive = 1
        ) x
        GROUP BY x.ClusterID
    ) p ON p.ClusterID = c.ClusterID

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
		c.[Notes] AS [Notes],
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
	@Notes NVARCHAR(MAX) = NULL,
	@ClusterID INT OUTPUT,
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        INSERT INTO [dbo].[Clusters] (
            [Name], [Address], [City], [State], [Notes]
        )
        VALUES (
            @Name, @Address, @City, @State, @Notes
        );
        
        SET @Output = 'Success';
        SET @ClusterID = SCOPE_IDENTITY();
    END TRY
    BEGIN CATCH
        SET @Output = 'Error';
		SET @ClusterID = 0;
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
	@Notes NVARCHAR(MAX) = NULL,
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
			[Notes] = ISNULL(@Notes, [Notes]),
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
        ISNULL(p.[Description],'') AS [Description],
        p.[CreatedAt] AS [CreatedAt],
        p.[UpdatedAt] AS [UpdatedAt],
        p.[IsActive] AS [IsActive]
    FROM [dbo].[Programs] p
    WHERE p.[IsActive] = @IsActive
    ORDER BY p.[Name];
END;
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_GetAllProgramsStats]
    @IsActive BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        p.[ProgramID] AS [Id],
        p.[Name] AS [Name],
        p.[Description] AS [Description],
        (
            SELECT COUNT(DISTINCT sar.StudentID)
            FROM dbo.StudentAcademicRecords sar
            WHERE sar.ProgramID = p.ProgramID
              AND sar.IsActive = 1
        ) AS StudentCount,
        (
            SELECT COUNT(DISTINCT ta.ClusterID)
            FROM dbo.TeacherAssignments ta
            WHERE ta.ProgramID = p.ProgramID
              AND ta.IsActive = 1
        ) AS ClusterCount,
        (
            SELECT COUNT(DISTINCT ta.TeacherID)
            FROM dbo.TeacherAssignments ta
            WHERE ta.ProgramID = p.ProgramID
              AND ta.IsActive = 1
        ) AS TeacherCount,
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
	@ProgramID INT OUTPUT,
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        INSERT INTO [dbo].[Programs] ([Name], [Description])
        VALUES (@Name, @Description);
        
        SET @Output = 'Success';
		SET @ProgramID = SCOPE_IDENTITY();
    END TRY
    BEGIN CATCH
        SET @Output = 'Error';
		SET @ProgramID = 0;
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
	@DonorID INT OUTPUT,
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
		SET @DonorID = SCOPE_IDENTITY();
    END TRY  
    BEGIN CATCH  
        SET @Output = 'Error';  
		SET @DonorID = 0;
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
    @LearningCentreID INT,
    @Role NVARCHAR(20),
    @IsActive BIT,
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        INSERT INTO TeacherAssignments (TeacherID, AcademicYearID, ClusterID, ProgramID, LearningCentreID, Role, IsActive)
        VALUES (@TeacherID, @AcademicYearID, @ClusterID, @ProgramID, @LearningCentreID, @Role, @IsActive);
        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        SET @Output = ERROR_MESSAGE();
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateTeacherAssignment]
    @TeacherAssignmentID INT,
    @AcademicYearID INT,
    @ClusterID INT,
    @ProgramID INT,
    @LearningCentreID INT,
    @Role NVARCHAR(20),
    @IsActive BIT,
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        UPDATE TeacherAssignments
        SET AcademicYearID = @AcademicYearID,
            ClusterID = @ClusterID,
            ProgramID = @ProgramID,
			LearningCentreID = @LearningCentreID,
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
 
CREATE OR ALTER PROCEDURE sp_GetClustersForProgram
    @ProgramID INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT DISTINCT
		c.[ClusterID] AS [Id],
        c.[Name] AS [Name],
        c.[Address] AS [Address],
        c.[City] AS [City],
        c.[State] AS [State],
		c.[Notes] AS [Notes],
        c.[CreatedAt] AS [CreatedAt],
        c.[UpdatedAt] AS [UpdatedAt],
        c.[IsActive] AS [IsActive]
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
        s.[StudentID] AS [id],
        s.[Name] AS [name],
        s.[StudentCode] AS [student_code],
        ISNULL(s.[DateOfBirth],'') AS [dob],
		ISNULL(s.[Gender],'') AS [Gender],
		ISNULL(s.[City],'') AS [City],
		ISNULL(s.[State],'') AS [State],
		ISNULL(s.[Ambition],'') AS [Ambition],
		ISNULL(s.[Hobbies],'') AS [Hobbies],
		ISNULL(s.[Notes],'') AS [Notes], 
        ISNULL(s.[CasteID],0) AS [caste_category_id],
        ISNULL(s.[IDProofTypeID],0) AS [id_proof_type_id],
        ISNULL(s.[IDNumber],'') AS [id_proof_number],
        ISNULL(s.[PhotoDocumentID],'') AS [photo_document_id],
        ISNULL(s.[Address],'') AS [address],
		ISNULL(s.[Phone],'') AS [phone],
        ISNULL(s.[Email],'') AS [Email],
        s.[CreatedAt] AS [created_at],
        s.[UpdatedAt] AS [updated_at],
        s.[IsActive] AS [is_active],
        ISNULL(sar.[StudentAcademicRecordID], 0) AS [academic_record_id],
        ISNULL(sar.[ClusterID], 0) AS [cluster_id],
        ISNULL(sar.[ProgramID], 0) AS [program_id],
        ISNULL(sar.[AcademicYearID], 0) AS [academic_year_id],
        ISNULL(sar.[ClassGrade], '') AS [class_grade],
        ISNULL(sar.[SchoolName], '') AS [school_name],
        ISNULL(sar.[AttendancePercentage], 0) AS [attendance_percentage],
        ISNULL(sar.[ResultPercentage], 0) AS [result_percentage],
        ISNULL(cc.[Name],'') AS [caste_category],
        ISNULL(ipt.[Name],'') AS [id_proof_type],
        ISNULL(c.[Name],'') AS [cluster],
        ISNULL(p.[Name],'') AS [program],
        ISNULL(ay.[Name],'') AS [academicyearname],
        ISNULL(ay.[IsCurrent],0) AS [academicyeariscurrent],
		ISNULL(sar.SchoolTypeID,0) AS [school_type_id],
		ISNULL(sar.MediumID,0) AS [medium_id],
		ISNULL(s.SiblingStudentCode,'') AS [sibling_student_code]
    FROM [dbo].[Students] s
    INNER JOIN [dbo].[StudentAcademicRecords] sar ON s.[StudentID] = sar.[StudentID]
    LEFT JOIN [dbo].[CasteCategories] cc ON s.[CasteID] = cc.[CasteCategoryID]
    LEFT JOIN [dbo].[IDProofTypes] ipt ON s.[IDProofTypeID] = ipt.[IDProofTypeID]
    LEFT JOIN [dbo].[Clusters] c ON sar.[ClusterID] = c.[ClusterID]
    LEFT JOIN [dbo].[Programs] p ON sar.[ProgramID] = p.[ProgramID]
    LEFT JOIN [dbo].[AcademicYears] ay ON sar.[AcademicYearID] = ay.[AcademicYearID]
    WHERE sar.ProgramID = @ProgramID AND s.IsActive = 1
	ORDER BY s.[StudentCode];
END
GO

-- =============================================
-- CLUSTER STUDENTS AND TEACHERS RETRIEVAL
-- =============================================

-- Get students in a specific cluster
CREATE OR ALTER PROCEDURE [dbo].[sp_GetStudentsByCluster]
    @ClusterID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT DISTINCT
        s.[StudentID] AS [id],
        s.[Name] AS [name],
        s.[StudentCode] AS [student_code],
        ISNULL(s.[DateOfBirth],'') AS [dob],
		ISNULL(s.[Gender],'') AS [Gender],
		ISNULL(s.[City],'') AS [City],
		ISNULL(s.[State],'') AS [State],
		ISNULL(s.[Ambition],'') AS [Ambition],
		ISNULL(s.[Hobbies],'') AS [Hobbies],
		ISNULL(s.[Notes],'') AS [Notes], 
        ISNULL(s.[CasteID],0) AS [caste_category_id],
        ISNULL(s.[IDProofTypeID],0) AS [id_proof_type_id],
        ISNULL(s.[IDNumber],'') AS [id_proof_number],
        ISNULL(s.[PhotoDocumentID],'') AS [photo_document_id],
        ISNULL(s.[Address],'') AS [address],
		ISNULL(s.[Phone],'') AS [phone],
        ISNULL(s.[Email],'') AS [Email],
        s.[CreatedAt] AS [created_at],
        s.[UpdatedAt] AS [updated_at],
        s.[IsActive] AS [is_active],
        ISNULL(sar.[StudentAcademicRecordID], 0) AS [academic_record_id],
        ISNULL(sar.[ClusterID], 0) AS [cluster_id],
        ISNULL(sar.[ProgramID], 0) AS [program_id],
        ISNULL(sar.[AcademicYearID], 0) AS [academic_year_id],
        ISNULL(sar.[ClassGrade], '') AS [class_grade],
        ISNULL(sar.[SchoolName], '') AS [school_name],
        ISNULL(sar.[AttendancePercentage], 0) AS [attendance_percentage],
        ISNULL(sar.[ResultPercentage], 0) AS [result_percentage],
        ISNULL(cc.[Name],'') AS [caste_category],
        ISNULL(ipt.[Name],'') AS [id_proof_type],
        ISNULL(c.[Name],'') AS [cluster],
        ISNULL(p.[Name],'') AS [program],
        ISNULL(ay.[Name],'') AS [academicyearname],
        ISNULL(ay.[IsCurrent],0) AS [academicyeariscurrent],
		ISNULL(sar.SchoolTypeID,0) AS [school_type_id],
		ISNULL(sar.MediumID,0) AS [medium_id],
		ISNULL(s.SiblingStudentCode,'') AS [sibling_student_code]
    FROM [dbo].[Students] s
    INNER JOIN [dbo].[StudentAcademicRecords] sar ON s.[StudentID] = sar.[StudentID]
    LEFT JOIN [dbo].[CasteCategories] cc ON s.[CasteID] = cc.[CasteCategoryID]
    LEFT JOIN [dbo].[IDProofTypes] ipt ON s.[IDProofTypeID] = ipt.[IDProofTypeID]
    LEFT JOIN [dbo].[Clusters] c ON sar.[ClusterID] = c.[ClusterID]
    LEFT JOIN [dbo].[Programs] p ON sar.[ProgramID] = p.[ProgramID]
    LEFT JOIN [dbo].[AcademicYears] ay ON sar.[AcademicYearID] = ay.[AcademicYearID]
    WHERE sar.[ClusterID] = @ClusterID AND s.[IsActive] = 1
    ORDER BY s.[Name];
END;
GO

-- Get teachers assigned to a specific cluster
CREATE OR ALTER PROCEDURE [dbo].[sp_GetTeachersByCluster]
    @ClusterID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT DISTINCT
        t.[TeacherID] AS [id],
        t.[Name] AS [name],
		t.[Gender] AS [Gender],
		t.[DateOfBirth] AS [DateOfBirth],
        t.[Email] AS [email],
        t.[Phone] AS [phone],
        ISNULL(t.[IDProofTypeID],0) AS [idprooftypeid],
        ISNULL(t.[IDNumber], '') AS [idproofnumber],
		ISNULL(t.[PhotoDocumentID], '') AS [photodocumentid],
        ISNULL(t.[Address], '') AS [address],
        ISNULL(t.[City], '') AS [city],
        ISNULL(t.[State], '') AS [state],
		ISNULL(t.[Notes], '') AS [Notes],
        t.[CreatedAt] AS [createdat],
        t.[UpdatedAt] AS [updatedat],
        t.[IsActive] AS [isactive],
        ISNULL(ipt.[Name],'') AS [idprooftype],
        ISNULL(ta.[TeacherAssignmentID], 0) AS [teacherassignmentid],
        ISNULL(ta.[ClusterID], 0) AS [clusterid],
        ISNULL(ta.[ProgramID], 0) AS [programid],
		ISNULL(ta.[LearningCentreID], 0) AS [learningcentreid],
        ISNULL(ta.[AcademicYearID], 0) AS [academicyearid],
        ISNULL(ta.[Role], '') AS [role],
        ISNULL(c.[Name], '') AS [cluster],
        ISNULL(p.[Name], '') AS [program],
		ISNULL(lc.[Name], '') AS [learningcentre],
        ISNULL(ay.[Name], '') AS [academicyearname],
        ISNULL(ay.[IsCurrent], 0) AS [academicyeariscurrent],
		ISNULL(t.[Subjects],'') AS [subjects],
		ISNULL(t.[StudentID],0) AS [studentid],
		CASE WHEN ISNULL(t.[StudentID],0) > 0 THEN CAST(1 AS BIT) 
		ELSE CAST(0 AS BIT) END AS [isExStudent]
    FROM [dbo].[Teachers] t
    LEFT JOIN [dbo].[IDProofTypes] ipt ON t.[IDProofTypeID] = ipt.[IDProofTypeID]
    INNER JOIN [dbo].[TeacherAssignments] ta ON t.[TeacherID] = ta.[TeacherID]
    LEFT JOIN [dbo].[Clusters] c ON ta.[ClusterID] = c.[ClusterID]
    LEFT JOIN [dbo].[Programs] p ON ta.[ProgramID] = p.[ProgramID]
	LEFT JOIN [dbo].[LearningCentres] lc ON ta.[LearningCentreID] = lc.[LearningCentreID]
    LEFT JOIN [dbo].[AcademicYears] ay ON ta.[AcademicYearID] = ay.[AcademicYearID]
    WHERE ta.[ClusterID] = @ClusterID AND t.[IsActive] = 1
    ORDER BY t.[Name];
END;
GO

-- Get students in a specific learning centre
CREATE OR ALTER PROCEDURE [dbo].[sp_GetStudentsByLearningCentre]
    @LearningCentreID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT DISTINCT
        s.[StudentID] AS [id],
        s.[Name] AS [name],
        s.[StudentCode] AS [student_code],
        ISNULL(s.[DateOfBirth],'') AS [dob],
		ISNULL(s.[Gender],'') AS [Gender],
		ISNULL(s.[City],'') AS [City],
		ISNULL(s.[State],'') AS [State],
		ISNULL(s.[Ambition],'') AS [Ambition],
		ISNULL(s.[Hobbies],'') AS [Hobbies],
		ISNULL(s.[Notes],'') AS [Notes], 
        ISNULL(s.[CasteID],0) AS [caste_category_id],
        ISNULL(s.[IDProofTypeID],0) AS [id_proof_type_id],
        ISNULL(s.[IDNumber],'') AS [id_proof_number],
        ISNULL(s.[PhotoDocumentID],'') AS [photo_document_id],
        ISNULL(s.[Address],'') AS [address],
		ISNULL(s.[Phone],'') AS [phone],
        ISNULL(s.[Email],'') AS [Email],
        s.[CreatedAt] AS [created_at],
        s.[UpdatedAt] AS [updated_at],
        s.[IsActive] AS [is_active],
        ISNULL(sar.[StudentAcademicRecordID], 0) AS [academic_record_id],
        ISNULL(sar.[ClusterID], 0) AS [cluster_id],
        ISNULL(sar.[ProgramID], 0) AS [program_id],
        ISNULL(sar.[AcademicYearID], 0) AS [academic_year_id],
        ISNULL(sar.[ClassGrade], '') AS [class_grade],
        ISNULL(sar.[SchoolName], '') AS [school_name],
        ISNULL(sar.[AttendancePercentage], 0) AS [attendance_percentage],
        ISNULL(sar.[ResultPercentage], 0) AS [result_percentage],
        ISNULL(cc.[Name],'') AS [caste_category],
        ISNULL(ipt.[Name],'') AS [id_proof_type],
        ISNULL(c.[Name],'') AS [cluster],
        ISNULL(p.[Name],'') AS [program],
        ISNULL(ay.[Name],'') AS [academicyearname],
        ISNULL(ay.[IsCurrent],0) AS [academicyeariscurrent],
		ISNULL(sar.SchoolTypeID,0) AS [school_type_id],
		ISNULL(sar.MediumID,0) AS [medium_id],
		ISNULL(s.SiblingStudentCode,'') AS [sibling_student_code]
    FROM [dbo].[Students] s
    INNER JOIN [dbo].[StudentAcademicRecords] sar ON s.[StudentID] = sar.[StudentID]
    LEFT JOIN [dbo].[CasteCategories] cc ON s.[CasteID] = cc.[CasteCategoryID]
    LEFT JOIN [dbo].[IDProofTypes] ipt ON s.[IDProofTypeID] = ipt.[IDProofTypeID]
    LEFT JOIN [dbo].[Clusters] c ON sar.[ClusterID] = c.[ClusterID]
    LEFT JOIN [dbo].[Programs] p ON sar.[ProgramID] = p.[ProgramID]
    LEFT JOIN [dbo].[AcademicYears] ay ON sar.[AcademicYearID] = ay.[AcademicYearID]
    WHERE sar.[LearningCentreID] = @LearningCentreID AND s.[IsActive] = 1
    ORDER BY s.[Name];
END;
GO

-- Get teachers assigned to a specific learning centre 
CREATE OR ALTER PROCEDURE [dbo].[sp_GetTeachersByLearningCentre]
    @LearningCentreID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT DISTINCT
        t.[TeacherID] AS [id],
        t.[Name] AS [name],
		t.[Gender] AS [Gender],
		t.[DateOfBirth] AS [DateOfBirth],
        t.[Email] AS [email],
        t.[Phone] AS [phone],
        ISNULL(t.[IDProofTypeID],0) AS [idprooftypeid],
        ISNULL(t.[IDNumber], '') AS [idproofnumber],
		ISNULL(t.[PhotoDocumentID], '') AS [photodocumentid],
        ISNULL(t.[Address], '') AS [address],
        ISNULL(t.[City], '') AS [city],
        ISNULL(t.[State], '') AS [state],
		ISNULL(t.[Notes], '') AS [Notes],
        t.[CreatedAt] AS [createdat],
        t.[UpdatedAt] AS [updatedat],
        t.[IsActive] AS [isactive],
        ISNULL(ipt.[Name],'') AS [idprooftype],
        ISNULL(ta.[TeacherAssignmentID], 0) AS [teacherassignmentid],
        ISNULL(ta.[ClusterID], 0) AS [clusterid],
        ISNULL(ta.[ProgramID], 0) AS [programid],
		ISNULL(ta.[LearningCentreID], 0) AS [learningcentreid],
        ISNULL(ta.[AcademicYearID], 0) AS [academicyearid],
        ISNULL(ta.[Role], '') AS [role],
        ISNULL(c.[Name], '') AS [cluster],
        ISNULL(p.[Name], '') AS [program],
		ISNULL(lc.[Name], '') AS [learningcentre],
        ISNULL(ay.[Name], '') AS [academicyearname],
        ISNULL(ay.[IsCurrent], 0) AS [academicyeariscurrent],
		ISNULL(t.[Subjects],'') AS [subjects],
		ISNULL(t.[StudentID],0) AS [studentid],
		CASE WHEN ISNULL(t.[StudentID],0) > 0 THEN CAST(1 AS BIT) 
		ELSE CAST(0 AS BIT) END AS [isExStudent]
    FROM [dbo].[Teachers] t
    LEFT JOIN [dbo].[IDProofTypes] ipt ON t.[IDProofTypeID] = ipt.[IDProofTypeID]
    INNER JOIN [dbo].[TeacherAssignments] ta ON t.[TeacherID] = ta.[TeacherID]
    LEFT JOIN [dbo].[Clusters] c ON ta.[ClusterID] = c.[ClusterID]
    LEFT JOIN [dbo].[Programs] p ON ta.[ProgramID] = p.[ProgramID]
	LEFT JOIN [dbo].[LearningCentres] lc ON ta.[LearningCentreID] = lc.[LearningCentreID]
    LEFT JOIN [dbo].[AcademicYears] ay ON ta.[AcademicYearID] = ay.[AcademicYearID]
    WHERE ta.[LearningCentreID] = @LearningCentreID AND t.[IsActive] = 1
    ORDER BY t.[Name];
END;
GO



-- =============================================
-- FAMILY MEMBERS STORED PROCEDURES
-- =============================================

-- Get family members for a student
CREATE OR ALTER PROCEDURE [dbo].[sp_GetFamilyMembers]
    @StudentID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
		ISNULL(fm.[FamilyMemberID], 0) AS [FamilyMemberID],
		ISNULL(fm.[StudentID], 0) AS [StudentID],
		ISNULL(fm.[Name], '') AS [Name],
		ISNULL(fm.[Relationship], '') AS [Relationship],
		ISNULL(fm.[Phone], '') AS [Phone],
		ISNULL(fm.[IDProofTypeID], 0) AS [IDProofTypeID],
		ISNULL(fm.[IDNumber], '') AS [IDNumber],
		ISNULL(fm.[PhotoDocumentID], 0) AS [PhotoDocumentID],

		ISNULL(ipt.[Name], '') AS [IdProofTypeName],

		fm.[DateOfBirth] AS [DateOfBirth],  -- keep NULL
		ISNULL(fm.[Occupation], '') AS [Occupation],
		ISNULL(fm.[Notes], '') AS [Notes],
		ISNULL(fm.[Gender], '') AS [Gender],
		ISNULL(fm.[AnnualIncome], 0) AS [AnnualIncome],
		ISNULL(fm.[Address], '') AS [Address],
		ISNULL(fm.[City], '') AS [City],
		ISNULL(fm.[State], '') AS [State],
		ISNULL(fm.[BankName], '') AS [BankName],
		ISNULL(fm.[BankAccountNumber], '') AS [BankAccountNumber],

		fm.[CreatedAt] AS [CreatedAt],      
		fm.[UpdatedAt] AS [UpdatedAt], 
		ISNULL(fm.[IsActive], 0) AS [IsActive]
	FROM [dbo].[StudentFamilyMemberLinking] sfl
    INNER JOIN [dbo].[FamilyMembers] fm ON sfl.FamilyMemberID = fm.FamilyMemberID
    LEFT JOIN [dbo].[IDProofTypes] ipt ON fm.IDProofTypeID = ipt.IDProofTypeID
    WHERE sfl.StudentID = @StudentID AND fm.IsActive = 1
    ORDER BY fm.[Name];

END;
GO

-- Get family member by Id
CREATE OR ALTER PROCEDURE [dbo].[sp_GetFamilyMemberById]
    @FamilyMemberID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
		ISNULL(fm.[FamilyMemberID], 0) AS [FamilyMemberID],
		ISNULL(fm.[StudentID], 0) AS [StudentID],
		ISNULL(fm.[Name], '') AS [Name],
		ISNULL(fm.[Relationship], '') AS [Relationship],
		ISNULL(fm.[Phone], '') AS [Phone],
		ISNULL(fm.[IDProofTypeID], 0) AS [IDProofTypeID],
		ISNULL(fm.[IDNumber], '') AS [IDNumber],
		ISNULL(fm.[PhotoDocumentID], 0) AS [PhotoDocumentID],

		ISNULL(ipt.[Name], '') AS [IdProofTypeName],

		fm.[DateOfBirth] AS [DateOfBirth],  -- keep NULL
		ISNULL(fm.[Occupation], '') AS [Occupation],
		ISNULL(fm.[Notes], '') AS [Notes],
		ISNULL(fm.[Gender], '') AS [Gender],
		ISNULL(fm.[AnnualIncome], 0) AS [AnnualIncome],
		ISNULL(fm.[Address], '') AS [Address],
		ISNULL(fm.[City], '') AS [City],
		ISNULL(fm.[State], '') AS [State],
		ISNULL(fm.[BankName], '') AS [BankName],
		ISNULL(fm.[BankAccountNumber], '') AS [BankAccountNumber],

		fm.[CreatedAt] AS [CreatedAt],      
		fm.[UpdatedAt] AS [UpdatedAt], 
		ISNULL(fm.[IsActive], 0) AS [IsActive]
	FROM [dbo].[StudentFamilyMemberLinking] sfl
    INNER JOIN [dbo].[FamilyMembers] fm ON sfl.FamilyMemberID = fm.FamilyMemberID
    LEFT JOIN [dbo].[IDProofTypes] ipt ON fm.IDProofTypeID = ipt.IDProofTypeID
    WHERE (@FamilyMemberID IS NULL OR fm.[FamilyMemberID] = @FamilyMemberID)
	ORDER BY fm.[Name];

END;
GO

-- Insert new family member
CREATE OR ALTER PROCEDURE [dbo].[sp_InsertFamilyMember]
    @StudentID INT,
    @Name NVARCHAR(255),
    @Relationship NVARCHAR(100) = NULL,
    @Phone NVARCHAR(20) = NULL,
    @IDProofTypeID INT = NULL,
    @IDNumber NVARCHAR(100) = NULL,
    @DateOfBirth DATETIME2 = NULL,
    @Occupation NVARCHAR(255) = NULL,
    @AnnualIncome DECIMAL(15,2) = NULL,
    @Address NVARCHAR(500) = NULL,
    @City NVARCHAR(100) = NULL,
    @State NVARCHAR(100) = NULL,
    @BankName NVARCHAR(255) = NULL,
    @BankAccountNumber NVARCHAR(100) = NULL,
	@Gender NVARCHAR(100) = NULL,
	@Notes NVARCHAR(MAX) = NULL,
    @Output NVARCHAR(50) OUTPUT,
    @FamilyMemberID INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
	  BEGIN TRAN;

        INSERT INTO [dbo].[FamilyMembers] (
            [StudentID], [Name], [Relationship], [Phone],
            [IDProofTypeID], [IDNumber], [DateOfBirth], [Occupation],
            [AnnualIncome], [Address], [City], [State],
            [BankName], [BankAccountNumber], [Gender], [Notes], [IsActive], [CreatedAt], [UpdatedAt]
        )
        VALUES (
            @StudentID, @Name, @Relationship, @Phone,
            @IDProofTypeID, @IDNumber, @DateOfBirth, @Occupation,
            @AnnualIncome, @Address, @City, @State,
            @BankName, @BankAccountNumber, @Gender, @Notes, 1, GETUTCDATE(), GETUTCDATE()
        );
        
        SET @FamilyMemberID = @@IDENTITY;

		IF NOT EXISTS (
            SELECT 1
            FROM [dbo].[StudentFamilyMemberLinking]
            WHERE StudentID = @StudentID
              AND FamilyMemberID = @FamilyMemberID
        )
        BEGIN
            INSERT INTO [dbo].[StudentFamilyMemberLinking]
                (StudentID, FamilyMemberID, IsPrimary)
            VALUES
                (@StudentID, @FamilyMemberID, 1);
        END

        COMMIT TRAN;
        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        SET @Output = 'Error: ' + ERROR_MESSAGE();
        THROW;
    END CATCH
END;
GO

-- Update family member
CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateFamilyMember]
    @FamilyMemberID INT,
    @StudentID INT = NULL,
    @Name NVARCHAR(255) = NULL,
    @Relationship NVARCHAR(100) = NULL,
    @Phone NVARCHAR(20) = NULL,
    @IDProofTypeID INT = NULL,
    @IDNumber NVARCHAR(100) = NULL,
    @DateOfBirth DATETIME2 = NULL,
    @Occupation NVARCHAR(255) = NULL,
    @AnnualIncome DECIMAL(15,2) = NULL,
    @Address NVARCHAR(500) = NULL,
    @City NVARCHAR(100) = NULL,
    @State NVARCHAR(100) = NULL,
    @BankName NVARCHAR(255) = NULL,
    @BankAccountNumber NVARCHAR(100) = NULL,
	@Gender NVARCHAR(100) = NULL,
	@Notes NVARCHAR(MAX) = NULL,
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        UPDATE [dbo].[FamilyMembers]
        SET 
            [StudentID] = ISNULL(@StudentID, [StudentID]),
            [Name] = ISNULL(@Name, [Name]),
            [Relationship] = ISNULL(@Relationship, [Relationship]),
            [Phone] = ISNULL(@Phone, [Phone]),
            [IDProofTypeID] = ISNULL(@IDProofTypeID, [IDProofTypeID]),
            [IDNumber] = ISNULL(@IDNumber, [IDNumber]),
            [DateOfBirth] = ISNULL(@DateOfBirth, [DateOfBirth]),
            [Occupation] = ISNULL(@Occupation, [Occupation]),
            [AnnualIncome] = ISNULL(@AnnualIncome, [AnnualIncome]),
            [Address] = ISNULL(@Address, [Address]),
            [City] = ISNULL(@City, [City]),
            [State] = ISNULL(@State, [State]),
            [BankName] = ISNULL(@BankName, [BankName]),
            [BankAccountNumber] = ISNULL(@BankAccountNumber, [BankAccountNumber]),
			[Gender] = ISNULL(@Gender, [Gender]),
            [Notes] = ISNULL(@Notes, [Notes]),
            [UpdatedAt] = GETUTCDATE()
        WHERE [FamilyMemberID] = @FamilyMemberID;
        
        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        SET @Output = 'Error: ' + ERROR_MESSAGE();
        THROW;
    END CATCH
END;
GO

-- Delete family member
CREATE OR ALTER PROCEDURE [dbo].[sp_DeleteFamilyMember]
    @FamilyMemberID INT,
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        DELETE FROM [dbo].[FamilyMembers]
        WHERE [FamilyMemberID] = @FamilyMemberID;
        
        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        SET @Output = 'Error: ' + ERROR_MESSAGE();
        THROW;
    END CATCH
END;
GO

-- =============================================
-- ACADEMIC YEARS STORED PROCEDURES (CRUD)
-- =============================================

-- Insert Academic Year
CREATE OR ALTER PROCEDURE [dbo].[sp_InsertAcademicYear]
    @Name NVARCHAR(255),
    @StartDate DATETIME2,
    @EndDate DATETIME2,
    @IsCurrent BIT = 0,
    @Output NVARCHAR(50) OUTPUT,
    @AcademicYearID INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- If setting as current, unset previous current
        IF @IsCurrent = 1
        BEGIN
            UPDATE [dbo].[AcademicYears] SET [IsCurrent] = 0 WHERE [IsCurrent] = 1;
        END
        
        INSERT INTO [dbo].[AcademicYears] (
            [Name], [StartDate], [EndDate], [IsCurrent], [IsActive], [CreatedAt], [UpdatedAt]
        )
        VALUES (
            @Name, @StartDate, @EndDate, @IsCurrent, 1, GETUTCDATE(), GETUTCDATE()
        );
        
        SET @AcademicYearID = @@IDENTITY;
        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        SET @Output = 'Error: ' + ERROR_MESSAGE();
        THROW;
    END CATCH
END;
GO

-- Update Academic Year
CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateAcademicYear]
    @AcademicYearID INT,
    @Name NVARCHAR(255) = NULL,
    @StartDate DATETIME2 = NULL,
    @EndDate DATETIME2 = NULL,
    @IsActive BIT = NULL,
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        UPDATE [dbo].[AcademicYears]
        SET 
            [Name] = ISNULL(@Name, [Name]),
            [StartDate] = ISNULL(@StartDate, [StartDate]),
            [EndDate] = ISNULL(@EndDate, [EndDate]),
            [IsActive] = ISNULL(@IsActive, [IsActive]),
            [UpdatedAt] = GETUTCDATE()
        WHERE [AcademicYearID] = @AcademicYearID;
        
        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        SET @Output = 'Error: ' + ERROR_MESSAGE();
        THROW;
    END CATCH
END;
GO

-- Set Current Academic Year
CREATE OR ALTER PROCEDURE [dbo].[sp_SetCurrentAcademicYear]
    @AcademicYearID INT,
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Unset all current years
        UPDATE [dbo].[AcademicYears] SET [IsCurrent] = 0 WHERE [IsCurrent] = 1;
        
        -- Set the specified year as current
        UPDATE [dbo].[AcademicYears] 
        SET [IsCurrent] = 1
        WHERE [AcademicYearID] = @AcademicYearID;
        
        COMMIT TRANSACTION;
        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SET @Output = 'Error: ' + ERROR_MESSAGE();
        THROW;
    END CATCH
END;
GO

-- Delete Academic Year
CREATE OR ALTER PROCEDURE [dbo].[sp_DeleteAcademicYear]
    @AcademicYearID INT,
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Check if academic year is in use
        DECLARE @CountRecords INT;
        SELECT @CountRecords = COUNT(*) FROM [dbo].[StudentAcademicRecords]
        WHERE [AcademicYearID] = @AcademicYearID;
        
        IF @CountRecords > 0
        BEGIN
            SET @Output = 'Error: Academic year has associated records';
            RETURN;
        END
        
        DELETE FROM [dbo].[AcademicYears]
        WHERE [AcademicYearID] = @AcademicYearID;
        
        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        SET @Output = 'Error: ' + ERROR_MESSAGE();
        THROW;
    END CATCH
END;
GO

-- =============================================
-- CLUSTER & PROGRAM DELETE PROCEDURES
-- =============================================

-- Delete Cluster
CREATE OR ALTER PROCEDURE [dbo].[sp_DeleteCluster]
    @ClusterID INT,
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Soft delete - set IsActive to 0
        UPDATE [dbo].[Clusters]
        SET [IsActive] = 0, [UpdatedAt] = GETUTCDATE()
        WHERE [ClusterID] = @ClusterID;
        
        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        SET @Output = 'Error: ' + ERROR_MESSAGE();
        THROW;
    END CATCH
END;
GO

-- Delete Program
CREATE OR ALTER PROCEDURE [dbo].[sp_DeleteProgram]
    @ProgramID INT,
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Soft delete - set IsActive to 0
        UPDATE [dbo].[Programs]
        SET [IsActive] = 0, [UpdatedAt] = GETUTCDATE()
        WHERE [ProgramID] = @ProgramID;
        
        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        SET @Output = 'Error: ' + ERROR_MESSAGE();
        THROW;
    END CATCH
END;
GO

-- =============================================
-- MASTER DATA CRUD PROCEDURES
-- =============================================

-- Insert ID Proof Type
CREATE OR ALTER PROCEDURE [dbo].[sp_InsertIdProofType]
    @Name NVARCHAR(255),
    @Output NVARCHAR(50) OUTPUT,
    @IdProofTypeID INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        INSERT INTO [dbo].[IDProofTypes] ([Name], [IsActive], [CreatedAt])
        VALUES (@Name, 1, GETUTCDATE());
        
        SET @IdProofTypeID = @@IDENTITY;
        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        SET @Output = 'Error: ' + ERROR_MESSAGE();
        THROW;
    END CATCH
END;
GO

-- Update ID Proof Type
CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateIdProofType]
    @IdProofTypeID INT,
    @Name NVARCHAR(255),
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        UPDATE [dbo].[IDProofTypes]
        SET [Name] = @Name
        WHERE [IDProofTypeID] = @IdProofTypeID;
        
        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        SET @Output = 'Error: ' + ERROR_MESSAGE();
        THROW;
    END CATCH
END;
GO

-- Delete ID Proof Type
CREATE OR ALTER PROCEDURE [dbo].[sp_DeleteIdProofType]
    @IdProofTypeID INT,
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        UPDATE [dbo].[IDProofTypes]
        SET [IsActive] = 0
        WHERE [IDProofTypeID] = @IdProofTypeID;
        
        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        SET @Output = 'Error: ' + ERROR_MESSAGE();
        THROW;
    END CATCH
END;
GO

-- Insert Caste Category
CREATE OR ALTER PROCEDURE [dbo].[sp_InsertCasteCategory]
    @Name NVARCHAR(255),
    @Code NVARCHAR(50),
    @Output NVARCHAR(50) OUTPUT,
    @CasteCategoryID INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        INSERT INTO [dbo].[CasteCategories] ([Name], [Code], [IsActive], [CreatedAt])
        VALUES (@Name, @Code, 1, GETUTCDATE());
        
        SET @CasteCategoryID = @@IDENTITY;
        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        SET @Output = 'Error: ' + ERROR_MESSAGE();
        THROW;
    END CATCH
END;
GO

-- Update Caste Category
CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateCasteCategory]
    @CasteCategoryID INT,
    @Name NVARCHAR(255),
    @Code NVARCHAR(50),
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        UPDATE [dbo].[CasteCategories]
        SET [Name] = @Name, [Code] = @Code
        WHERE [CasteCategoryID] = @CasteCategoryID;
        
        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        SET @Output = 'Error: ' + ERROR_MESSAGE();
        THROW;
    END CATCH
END;
GO

-- Delete Caste Category
CREATE OR ALTER PROCEDURE [dbo].[sp_DeleteCasteCategory]
    @CasteCategoryID INT,
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        UPDATE [dbo].[CasteCategories]
        SET [IsActive] = 0
        WHERE [CasteCategoryID] = @CasteCategoryID;
        
        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        SET @Output = 'Error: ' + ERROR_MESSAGE();
        THROW;
    END CATCH
END;
GO

-- Insert Attendance Status Type
CREATE OR ALTER PROCEDURE [dbo].[sp_InsertAttendanceStatusType]
    @Name NVARCHAR(255),
    @Code NVARCHAR(50),
    @Output NVARCHAR(50) OUTPUT,
    @AttendanceStatusTypeID INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        INSERT INTO [dbo].[AttendanceStatusTypes] ([Name], [Code], [IsActive], [CreatedAt])
        VALUES (@Name, @Code, 1, GETUTCDATE());
        
        SET @AttendanceStatusTypeID = @@IDENTITY;
        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        SET @Output = 'Error: ' + ERROR_MESSAGE();
        THROW;
    END CATCH
END;
GO

-- Update Attendance Status Type
CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateAttendanceStatusType]
    @AttendanceStatusTypeID INT,
    @Name NVARCHAR(255),
    @Code NVARCHAR(50),
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        UPDATE [dbo].[AttendanceStatusTypes]
        SET [Name] = @Name, [Code] = @Code
        WHERE [AttendanceStatusTypeID] = @AttendanceStatusTypeID;
        
        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        SET @Output = 'Error: ' + ERROR_MESSAGE();
        THROW;
    END CATCH
END;
GO

-- Delete Attendance Status Type
CREATE OR ALTER PROCEDURE [dbo].[sp_DeleteAttendanceStatusType]
    @AttendanceStatusTypeID INT,
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        UPDATE [dbo].[AttendanceStatusTypes]
        SET [IsActive] = 0
        WHERE [AttendanceStatusTypeID] = @AttendanceStatusTypeID;
        
        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        SET @Output = 'Error: ' + ERROR_MESSAGE();
        THROW;
    END CATCH
END;
GO

-- Insert Payment Mode
CREATE OR ALTER PROCEDURE [dbo].[sp_InsertPaymentMode]
    @Name NVARCHAR(255),
    @Output NVARCHAR(50) OUTPUT,
    @PaymentModeID INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        INSERT INTO [dbo].[PaymentModes] ([Name], [IsActive], [CreatedAt])
        VALUES (@Name, 1, GETUTCDATE());
        
        SET @PaymentModeID = @@IDENTITY;
        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        SET @Output = 'Error: ' + ERROR_MESSAGE();
        THROW;
    END CATCH
END;
GO

-- Update Payment Mode
CREATE OR ALTER PROCEDURE [dbo].[sp_UpdatePaymentMode]
    @PaymentModeID INT,
    @Name NVARCHAR(255),
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        UPDATE [dbo].[PaymentModes]
        SET [Name] = @Name
        WHERE [PaymentModeID] = @PaymentModeID;
        
        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        SET @Output = 'Error: ' + ERROR_MESSAGE();
        THROW;
    END CATCH
END;
GO

-- Delete Payment Mode
CREATE OR ALTER PROCEDURE [dbo].[sp_DeletePaymentMode]
    @PaymentModeID INT,
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        UPDATE [dbo].[PaymentModes]
        SET [IsActive] = 0
        WHERE [PaymentModeID] = @PaymentModeID;
        
        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        SET @Output = 'Error: ' + ERROR_MESSAGE();
        THROW;
    END CATCH
END;
GO

-- =============================================
-- STORED PROCEDURE: Get Documents by Reference
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetDocumentsByReference
    @ReferenceType NVARCHAR(50),
    @ReferenceID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        DocumentID AS Id,
        ReferenceType AS ReferenceType,
        ReferenceID AS ReferenceId,
        Name AS Name,
        DocumentType AS DocumentType,
        FileUrl AS FileUrl,
        FileType AS FileType,
        FileSize AS FileSize,
        Description AS Description,
        Tags AS Tags,
        IsActive AS IsActive,
        IsVerified AS IsVerified,
        CreatedAt AS CreatedAt,
        UpdatedAt AS UpdatedAt
    FROM dbo.Documents
    WHERE ReferenceType = @ReferenceType 
        AND ReferenceID = @ReferenceID
        AND IsActive = 1
    ORDER BY CreatedAt DESC;
END
GO

-- =============================================
-- STORED PROCEDURE: Get Single Document
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetDocumentByID
    @DocumentID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        DocumentID AS Id,
        ReferenceType AS ReferenceType,
        ReferenceID AS ReferenceId,
        Name AS Name,
        DocumentType AS DocumentType,
        FileUrl AS FileUrl,
        FileType AS FileType,
        FileSize AS FileSize,
        Description AS Description,
        Tags AS Tags,
        IsActive AS IsActive,
        IsVerified AS IsVerified,
        UploadedBy AS UploadedBy,
        VerifiedBy AS VerifiedBy,
        VerifiedAt AS VerifiedAt,
        CreatedAt AS CreatedAt,
        UpdatedAt AS UpdatedAt
    FROM dbo.Documents
    WHERE DocumentID = @DocumentID;
END
GO

-- =============================================
-- STORED PROCEDURE: Create Document
-- =============================================
CREATE OR ALTER PROCEDURE sp_CreateDocument
    @ReferenceType NVARCHAR(50),
    @ReferenceID INT,
    @Name NVARCHAR(255),
    @DocumentType NVARCHAR(100) = NULL,
    @FileUrl NVARCHAR(MAX),
    @FileType NVARCHAR(50) = NULL,
    @FileSize INT = NULL,
    @UploadedBy INT = NULL,
    @Description NVARCHAR(MAX) = NULL,
    @Tags NVARCHAR(500) = NULL,
	@DocumentID INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO dbo.Documents (
        ReferenceType,
        ReferenceID,
        Name,
        DocumentType,
        FileUrl,
        FileType,
        FileSize,
        UploadedBy,
        Description,
        Tags,
        IsActive,
        CreatedAt,
        UpdatedAt
    )
    VALUES (
        @ReferenceType,
        @ReferenceID,
        @Name,
        @DocumentType,
        @FileUrl,
        @FileType,
        @FileSize,
        @UploadedBy,
        @Description,
        @Tags,
        1,
        SYSDATETIME(),
        SYSDATETIME()
    );
    
    SET @DocumentID = SCOPE_IDENTITY();
END
GO

-- =============================================
-- STORED PROCEDURE: Update Document
-- =============================================
CREATE OR ALTER PROCEDURE sp_UpdateDocument
    @DocumentID INT,
    @Name NVARCHAR(255) = NULL,
    @DocumentType NVARCHAR(100) = NULL,
    @Description NVARCHAR(MAX) = NULL,
    @Tags NVARCHAR(500) = NULL,
    @IsVerified BIT = NULL,
    @VerifiedBy INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE dbo.Documents
    SET 
        Name = ISNULL(@Name, Name),
        DocumentType = ISNULL(@DocumentType, DocumentType),
        Description = ISNULL(@Description, Description),
        Tags = ISNULL(@Tags, Tags),
        IsVerified = ISNULL(@IsVerified, IsVerified),
        VerifiedBy = ISNULL(@VerifiedBy, VerifiedBy),
        VerifiedAt = CASE WHEN @IsVerified = 1 THEN SYSDATETIME() ELSE VerifiedAt END,
        UpdatedAt = SYSDATETIME()
    WHERE DocumentID = @DocumentID;
    
    SELECT @@ROWCOUNT AS AffectedRows;
END
GO

-- =============================================
-- STORED PROCEDURE: Delete Document (Soft Delete)
-- =============================================
CREATE OR ALTER PROCEDURE sp_DeleteDocument
    @DocumentID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE dbo.Documents
    SET 
        IsActive = 0,
        UpdatedAt = SYSDATETIME()
    WHERE DocumentID = @DocumentID;
    
    SELECT @@ROWCOUNT AS AffectedRows;
END
GO

-- =============================================
-- STORED PROCEDURE: Get Document Statistics
-- =============================================
CREATE OR ALTER PROCEDURE sp_GetDocumentStats
    @ReferenceType NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ReferenceType AS ReferenceType,
        COUNT(*) AS TotalCount,
        SUM(CASE WHEN IsVerified = 1 THEN 1 ELSE 0 END) AS VerifiedCount,
        SUM(FileSize) AS TotalSizeBytes,
        MAX(CreatedAt) AS LatestUpload
    FROM dbo.Documents
    WHERE IsActive = 1
        AND (@ReferenceType IS NULL OR ReferenceType = @ReferenceType)
    GROUP BY ReferenceType;
END
GO

-- =============================================
-- STORED PROCEDURE: Search Documents
-- =============================================
CREATE OR ALTER PROCEDURE sp_SearchDocuments
    @SearchTerm NVARCHAR(255) = NULL,
    @ReferenceType NVARCHAR(50) = NULL,
    @DocumentType NVARCHAR(100) = NULL,
    @IsVerified BIT = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 50
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;
    
    SELECT 
        DocumentID AS Id,
        ReferenceType AS ReferenceType,
        ReferenceID AS ReferenceId,
        Name AS Name,
        DocumentType AS DocumentType,
        FileUrl AS FileUrl,
        FileType AS FileType,
        FileSize AS FileSize,
        IsVerified AS IsVerified,
        CreatedAt AS CreatedAt
    FROM dbo.Documents
    WHERE IsActive = 1
        AND (@SearchTerm IS NULL OR Name LIKE '%' + @SearchTerm + '%' OR Tags LIKE '%' + @SearchTerm + '%')
        AND (@ReferenceType IS NULL OR ReferenceType = @ReferenceType)
        AND (@DocumentType IS NULL OR DocumentType = @DocumentType)
        AND (@IsVerified IS NULL OR IsVerified = @IsVerified)
    ORDER BY CreatedAt DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
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
    @ClusterId INT = NULL,
	@LearningCentreId INT = NULL
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
          AND (@LearningCentreId IS NULL OR sar.LearningCentreID = @LearningCentreId)
        GROUP BY p.ProgramID, p.Name
    )

    SELECT
        -- Total active students
        (SELECT ISNULL(COUNT(DISTINCT sar.StudentID),0)
         FROM StudentAcademicRecords sar
         INNER JOIN Students s ON sar.StudentID = s.StudentID
         WHERE s.IsActive = 1
           AND sar.IsActive = 1
           AND (@ProgramId IS NULL OR sar.ProgramID = @ProgramId)
           AND (@ClusterId IS NULL OR sar.ClusterID = @ClusterId)
           AND (@LearningCentreId IS NULL OR sar.LearningCentreID = @LearningCentreId)
        ) AS ActiveStudents,

        -- Program wise students (ProgramID|ProgramName|StudentCount)
        ISNULL((
            SELECT STRING_AGG(
                CONCAT(ProgramID, '|', ProgramName, '|', StudentCount),
                ','
            )
            FROM ProgramStudentCounts
        ),'') AS ProgramWiseStudentsRaw,

        -- Teachers
        (SELECT COUNT(DISTINCT TeacherID)
         FROM TeacherAssignments ta
         WHERE IsActive = 1
		   AND (@ProgramId IS NULL OR ta.ProgramID = @ProgramId)
           AND (@ClusterId IS NULL OR ta.ClusterID = @ClusterId)
           AND (@LearningCentreId IS NULL OR ta.LearningCentreID = @LearningCentreId)
        ) AS TotalTeachers,

        (SELECT COUNT(DISTINCT TeacherID)
         FROM TeacherAssignments ta
         WHERE IsActive = 1 AND Role = 'main'
		   AND (@ProgramId IS NULL OR ta.ProgramID = @ProgramId)
           AND (@ClusterId IS NULL OR ta.ClusterID = @ClusterId)
           AND (@LearningCentreId IS NULL OR ta.LearningCentreID = @LearningCentreId)
        ) AS MainTeachers,

        (SELECT COUNT(DISTINCT TeacherID)
         FROM TeacherAssignments ta
         WHERE IsActive = 1 AND Role = 'backup'
		   AND (@ProgramId IS NULL OR ta.ProgramID = @ProgramId)
           AND (@ClusterId IS NULL OR ta.ClusterID = @ClusterId)
           AND (@LearningCentreId IS NULL OR ta.LearningCentreID = @LearningCentreId)
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
    @ClusterId INT = NULL,
	@LearningCentreId INT = NULL
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
        AND (@ClusterId IS NULL OR ar.ClusterID = @ClusterId)
		AND (@LearningCentreId IS NULL OR ar.LearningCentreID = @LearningCentreId);

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
        AND (@LearningCentreId IS NULL OR ar.LearningCentreID = @LearningCentreId)
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
    @ClusterId INT = NULL,
	@LearningCentreId INT = NULL
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
			lc.Name AS LearningCentreName,
            ta_backup.TeacherID AS BackupTeacherId,
            t_backup.Name AS BackupTeacherName
        FROM TeacherAssignments ta_main
        INNER JOIN TeacherAssignments ta_backup ON ta_main.ProgramID = ta_backup.ProgramID 
            AND ta_main.ClusterID = ta_backup.ClusterID
        INNER JOIN Teachers t_main ON ta_main.TeacherID = t_main.TeacherID
        INNER JOIN Teachers t_backup ON ta_backup.TeacherID = t_backup.TeacherID
        INNER JOIN Programs p ON ta_main.ProgramID = p.ProgramID
        INNER JOIN Clusters c ON ta_main.ClusterID = c.ClusterID
        INNER JOIN LearningCentres lc ON ta_main.LearningCentreID = lc.LearningCentreID
        WHERE ta_main.Role = 'main' 
            AND ta_backup.Role = 'backup'
            AND ta_main.IsActive = 1 
            AND ta_backup.IsActive = 1
            AND (@ProgramId IS NULL OR ta_main.ProgramID = @ProgramId)
            AND (@ClusterId IS NULL OR ta_main.ClusterID = @ClusterId)
            AND (@LearningCentreId IS NULL OR ta_main.LearningCentreID = @LearningCentreId)
    ),
    UnavailableDays AS (
        SELECT 
            mbt.MainTeacherId,
            mbt.MainTeacherName,
            mbt.ProgramName,
            mbt.ClusterName,
			mbt.LearningCentreName,
            mbt.BackupTeacherName,
            COUNT(DISTINCT ar.AttendanceDate) AS MissedDays
        FROM MainBackupTeachers mbt
        INNER JOIN AttendanceRecords ar ON mbt.ProgramID = ar.ProgramID 
            AND mbt.ClusterID = ar.ClusterID
        WHERE ar.MarkedByTeacherId = mbt.BackupTeacherId
            AND ar.AttendanceDate >= @StartDate 
            AND ar.AttendanceDate <= @EndDate
        GROUP BY mbt.MainTeacherId, mbt.MainTeacherName, mbt.ProgramName, 
                 mbt.ClusterName, mbt.BackupTeacherName, mbt.LearningCentreName
    )
    SELECT * FROM UnavailableDays
    ORDER BY MissedDays DESC;
END;
GO

-- =============================================
-- 4. GET CLUSTERS NEEDING ATTENTION
-- Returns: Clusters with missed updates or poor attendance
-- =============================================
IF EXISTS(SELECT 1 FROM SYS.PROCEDURES WHERE NAME='spDashboard_GetLearningCentresNeedingAttention')
DROP PROCEDURE spDashboard_GetLearningCentresNeedingAttention
GO

CREATE PROCEDURE spDashboard_GetLearningCentresNeedingAttention
    @StartDate DATE,
    @EndDate DATE,
    @ProgramId INT = NULL,
    @ClusterId INT = NULL,
	@LearningCentreId INT = NULL,
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
			ta.LearningCentreID,
            p.Name AS ProgramName,
            c.Name AS ClusterName,
			lc.Name AS LearningCentreName,
            COUNT(DISTINCT ar.AttendanceDate) AS DatesWithAttendance,
            CAST(ROUND(CAST(SUM(CASE WHEN ar.StatusID = @PresentStatusId THEN 1 ELSE 0 END) AS FLOAT) /
                       NULLIF(COUNT(ar.AttendanceRecordID), 0) * 100, 0) AS INT) AS AttendancePercentage
        FROM TeacherAssignments ta
        INNER JOIN Teachers t ON ta.TeacherID = t.TeacherID
        INNER JOIN Programs p ON ta.ProgramID = p.ProgramID
        INNER JOIN Clusters c ON ta.ClusterID = c.ClusterID
        INNER JOIN LearningCentres lc ON ta.LearningCentreID = lc.LearningCentreID
        LEFT JOIN AttendanceRecords ar ON ta.ProgramID = ar.ProgramID 
            AND ta.ClusterID = ar.ClusterID
			AND ta.LearningCentreID = ar.LearningCentreID
            AND ar.AttendanceDate >= @StartDate 
            AND ar.AttendanceDate <= @EndDate
        WHERE ta.Role = 'main'
            AND ta.IsActive = 1
            AND (@ProgramId IS NULL OR ta.ProgramID = @ProgramId)
            AND (@ClusterId IS NULL OR ta.ClusterID = @ClusterId)
            AND (@LearningCentreId IS NULL OR ta.LearningCentreID = @LearningCentreId)
        GROUP BY ta.TeacherID, t.Name, ta.ProgramID, ta.ClusterID, ta.LearningCentreID, p.Name, c.Name, lc.Name
    )
    SELECT 
        TeacherName,
        ProgramName,
        ClusterName,
		LearningCentreName,
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
	@LearningCentreId INT = NULL,
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
		lc.Name AS LearningCentreName,
        SUM(CASE WHEN ar.StatusID = @PresentStatusId THEN 1 ELSE 0 END) AS PresentCount,
        SUM(CASE WHEN ar.StatusID = @AbsentStatusId THEN 1 ELSE 0 END) AS AbsentCount
    FROM AttendanceRecords ar
    INNER JOIN Students s ON ar.StudentID = s.StudentID
    INNER JOIN Programs p ON ar.ProgramID = p.ProgramID
    INNER JOIN Clusters c ON ar.ClusterID = c.ClusterID
	INNER JOIN LearningCentres lc ON ar.LearningCentreID = lc.LearningCentreID
    WHERE ar.AttendanceDate >= @StartDate 
        AND ar.AttendanceDate <= @EndDate
        AND (@ProgramId IS NULL OR ar.ProgramID = @ProgramId)
        AND (@ClusterId IS NULL OR ar.ClusterID = @ClusterId)
        AND (@LearningCentreId IS NULL OR ar.LearningCentreID = @LearningCentreId)
    GROUP BY ar.StudentID, s.Name, p.Name, c.Name, lc.Name
    ORDER BY AbsentCount DESC;
END;
GO

-- =============================================
-- 6. GET CLUSTER PERFORMANCE
-- Returns: Best and worst performing clusters
-- =============================================
IF EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'spDashboard_GetLearningCentrePerformance')
DROP PROCEDURE spDashboard_GetLearningCentrePerformance
GO

CREATE PROCEDURE spDashboard_GetLearningCentrePerformance
    @StartDate DATE,
    @EndDate DATE,
    @ProgramId INT = NULL,
    @ClusterId INT = NULL,
	@LearningCentreId INT = NULL,
    @Limit INT = 5
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @PresentStatusId INT;

    SELECT @PresentStatusId = AttendanceStatusTypeID
    FROM AttendanceStatusTypes
    WHERE Code = 'P' AND IsActive = 1;

    WITH LearningCentreStats AS (
        SELECT
            lc.LearningCentreID,
            lc.Name AS learningCentreName,
            COUNT(ar.AttendanceRecordID) AS TotalCount,
            SUM(CASE WHEN ar.StatusID = @PresentStatusId THEN 1 ELSE 0 END) AS PresentCount
        FROM LearningCentres lc
        INNER JOIN AttendanceRecords ar ON ar.LearningCentreID = lc.LearningCentreID
            AND ar.AttendanceDate BETWEEN @StartDate AND @EndDate
            AND (@ProgramId IS NULL OR ar.ProgramID = @ProgramId)
            AND (@ClusterId IS NULL OR ar.ClusterID = @ClusterId)
			AND (@LearningCentreId IS NULL OR ar.LearningCentreID = @LearningCentreId)
        GROUP BY lc.LearningCentreID, lc.Name
        HAVING COUNT(ar.AttendanceRecordID) > 0
    ),
    Calculated AS (
        SELECT
            learningCentreName,
            CAST(ROUND(
                (CAST(PresentCount AS FLOAT) / NULLIF(TotalCount, 0)) * 100, 0
            ) AS INT) AS AttendancePercentage
        FROM LearningCentreStats
    )
    SELECT TOP (@Limit)
        'BEST' AS PerformanceType,
        learningCentreName,
        AttendancePercentage
    FROM Calculated
    UNION ALL
    SELECT TOP (@Limit)
        'WORST' AS PerformanceType,
        learningCentreName,
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
    @ClusterId INT = NULL,
	@LearningCentreId INT = NULL
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
        AND (@LearningCentreId IS NULL OR sar.LearningCentreID = @LearningCentreId)
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


PRINT 'Part 6: Stored Procedure executed successfully';
GO



