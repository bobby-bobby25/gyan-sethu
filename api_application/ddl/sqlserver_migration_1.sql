-- =============================================
-- PART 1: USERS, ROLES AND PROFILES
-- SQL Server Migration for StudentHub Application
-- =============================================

USE [P2_PROD_IGB_Replica]
GO

-- =============================================
-- USERS TABLE (Replacing Supabase auth.users)
-- =============================================
CREATE TABLE [dbo].[Users] (
    [UserID] INT IDENTITY(1,1) PRIMARY KEY,
    [Email] NVARCHAR(255) NOT NULL UNIQUE,
    [PasswordHash] NVARCHAR(500) NOT NULL,
    [FullName] NVARCHAR(255) NULL,
    [Phone] NVARCHAR(50) NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
GO

-- =============================================
-- USER PROFILES (Supabase-style)
-- Stores additional profile data separate from auth Users
-- =============================================
CREATE TABLE [dbo].[UserProfiles] (
    [UserProfileID] INT IDENTITY(1,1) PRIMARY KEY,
    [UserID] INT NULL,
    [SupabaseUserId] UNIQUEIDENTIFIER NULL,
    [Email] NVARCHAR(255) NULL,
    [FullName] NVARCHAR(255) NULL,
    [Phone] NVARCHAR(50) NULL,
    [AvatarUrl] NVARCHAR(2048) NULL,
    [Metadata] NVARCHAR(MAX) NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_UserProfiles_Users FOREIGN KEY ([UserID]) REFERENCES [dbo].[Users]([UserID]) ON DELETE SET NULL
);
GO

CREATE NONCLUSTERED INDEX IX_UserProfiles_UserID ON [dbo].[UserProfiles]([UserID]);
CREATE NONCLUSTERED INDEX IX_UserProfiles_SupabaseUserId ON [dbo].[UserProfiles]([SupabaseUserId]);
GO

-- Trigger to keep UpdatedAt current
CREATE TRIGGER trg_UserProfiles_UpdatedAt
ON [dbo].[UserProfiles]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[UserProfiles]
    SET [UpdatedAt] = GETUTCDATE()
    FROM [dbo].[UserProfiles] up
    INNER JOIN inserted i ON up.[UserProfileID] = i.[UserProfileID];
END;
GO

-- =============================================
-- ROLES TABLE
-- =============================================
CREATE TABLE [dbo].[Roles] (
    [RoleID] INT IDENTITY(1,1) PRIMARY KEY,
    [RoleName] NVARCHAR(50) NOT NULL UNIQUE, -- 'admin', 'management', 'teacher'
    [Description] NVARCHAR(255) NULL,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
GO

-- Insert default roles
INSERT INTO [dbo].[Roles] ([RoleName], [Description]) VALUES
('admin', 'Administrator with full access'),
('management', 'Management with view and report access'),
('teacher', 'Teacher with limited access to assigned students');
GO

-- =============================================
-- USER ROLES MAPPING TABLE
-- =============================================
CREATE TABLE [dbo].[UserRoles] (
    [UserRoleID] INT IDENTITY(1,1) PRIMARY KEY,
    [UserID] INT NOT NULL,
    [RoleID] INT NOT NULL,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_UserRoles_Users FOREIGN KEY ([UserID]) REFERENCES [dbo].[Users]([UserID]) ON DELETE CASCADE,
    CONSTRAINT FK_UserRoles_Roles FOREIGN KEY ([RoleID]) REFERENCES [dbo].[Roles]([RoleID]) ON DELETE CASCADE,
    CONSTRAINT UQ_UserRoles UNIQUE ([UserID], [RoleID])
);
GO

-- =============================================
-- REFRESH TOKENS TABLE
-- =============================================
CREATE TABLE [dbo].[RefreshTokens] (
    [RefreshTokenID] INT IDENTITY(1,1) PRIMARY KEY,
    [UserID] INT NOT NULL,
    [RefreshToken] NVARCHAR(500) NOT NULL,
    [RefreshExpiry] DATETIME2 NOT NULL,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [IsRevoked] BIT NOT NULL DEFAULT 0,
    CONSTRAINT FK_RefreshTokens_Users FOREIGN KEY ([UserID]) REFERENCES [dbo].[Users]([UserID]) ON DELETE CASCADE
);
GO

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE NONCLUSTERED INDEX IX_Users_Email ON [dbo].[Users]([Email]);
CREATE NONCLUSTERED INDEX IX_UserRoles_UserID ON [dbo].[UserRoles]([UserID]);
CREATE NONCLUSTERED INDEX IX_UserRoles_RoleID ON [dbo].[UserRoles]([RoleID]);
CREATE NONCLUSTERED INDEX IX_RefreshTokens_UserID ON [dbo].[RefreshTokens]([UserID]);
CREATE NONCLUSTERED INDEX IX_RefreshTokens_Token ON [dbo].[RefreshTokens]([RefreshToken]);
GO

-- =============================================
-- TRIGGER: Auto-update UpdatedAt timestamp
-- =============================================
CREATE TRIGGER trg_Users_UpdatedAt
ON [dbo].[Users]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[Users]
    SET [UpdatedAt] = GETUTCDATE()
    FROM [dbo].[Users] u
    INNER JOIN inserted i ON u.[UserID] = i.[UserID];
END;
GO

-- =============================================
-- STORED PROCEDURES
-- =============================================

-- Get Login Details (used by LoginController)
CREATE OR ALTER PROCEDURE [dbo].[spCMNStudentHub_GetLoginDetails]
    @Email NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        u.[UserID],
        u.[FullName],
        u.[Email],
        u.[PasswordHash],
        r.[RoleName] AS [Role]
    FROM [dbo].[Users] u
    INNER JOIN [dbo].[UserRoles] ur ON u.[UserID] = ur.[UserID]
    INNER JOIN [dbo].[Roles] r ON ur.[RoleID] = r.[RoleID]
    WHERE u.[Email] = @Email 
        AND u.[IsActive] = 1;
END;
GO

-- Register User
CREATE OR ALTER PROCEDURE [dbo].[spCMNStudentHub_RegisterUser]
    @Email NVARCHAR(255),
    @PasswordHash NVARCHAR(500),
    @RoleId INT,
    @FullName NVARCHAR(255),
    @Output NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Check if user already exists
        IF EXISTS (SELECT 1 FROM [dbo].[Users] WHERE [Email] = @Email)
        BEGIN
            SET @Output = 'UserExists';
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Insert user
        DECLARE @NewUserID INT;
        
        INSERT INTO [dbo].[Users] ([Email], [PasswordHash], [FullName])
        VALUES (@Email, @PasswordHash, @FullName);
        
        SET @NewUserID = SCOPE_IDENTITY();
        
        -- Assign role (default to teacher if not specified)
        IF @RoleId IS NULL OR @RoleId = 0
        BEGIN
            SELECT @RoleId = [RoleID] FROM [dbo].[Roles] WHERE [RoleName] = 'teacher';
        END
        
        INSERT INTO [dbo].[UserRoles] ([UserID], [RoleID])
        VALUES (@NewUserID, @RoleId);
        
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

-- Check/Add Refresh Token
CREATE OR ALTER PROCEDURE [dbo].[spMbl_CMN_CheckAddRefreshToken]
    @RefreshToken NVARCHAR(500),
    @LoginID INT,
    @RefreshExpiry DATETIME2,
    @Type NVARCHAR(10), -- 'Add' or 'Check'
    @Output NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @Type = 'Check'
    BEGIN
        -- Check if refresh token is valid
        IF EXISTS (
            SELECT 1 
            FROM [dbo].[RefreshTokens] 
            WHERE [RefreshToken] = @RefreshToken 
                AND [UserID] = @LoginID
                AND [RefreshExpiry] > GETUTCDATE()
                AND [IsRevoked] = 0
        )
        BEGIN
            SET @Output = 'Token_Valid';
        END
        ELSE
        BEGIN
            SET @Output = 'Token_Invalid';
        END
    END
    ELSE IF @Type = 'Add'
    BEGIN
        -- Add or update refresh token
        IF EXISTS (SELECT 1 FROM [dbo].[RefreshTokens] WHERE [UserID] = @LoginID AND [IsRevoked] = 0)
        BEGIN
            -- Update existing token
            UPDATE [dbo].[RefreshTokens]
            SET [RefreshToken] = @RefreshToken,
                [RefreshExpiry] = @RefreshExpiry
            WHERE [UserID] = @LoginID AND [IsRevoked] = 0;
        END
        ELSE
        BEGIN
            -- Insert new token
            INSERT INTO [dbo].[RefreshTokens] ([UserID], [RefreshToken], [RefreshExpiry])
            VALUES (@LoginID, @RefreshToken, @RefreshExpiry);
        END
        
        SET @Output = 'Token_Added';
    END
END;
GO

-- Helper function to check user role
CREATE OR ALTER FUNCTION [dbo].[fn_HasRole]
(
    @UserID INT,
    @RoleName NVARCHAR(50)
)
RETURNS BIT
AS
BEGIN
    DECLARE @HasRole BIT = 0;
    
    IF EXISTS (
        SELECT 1 
        FROM [dbo].[UserRoles] ur
        INNER JOIN [dbo].[Roles] r ON ur.[RoleID] = r.[RoleID]
        WHERE ur.[UserID] = @UserID 
            AND r.[RoleName] = @RoleName
    )
    BEGIN
        SET @HasRole = 1;
    END
    
    RETURN @HasRole;
END;
GO

-- Get User Role
CREATE OR ALTER FUNCTION [dbo].[fn_GetUserRole]
(
    @UserID INT
)
RETURNS NVARCHAR(50)
AS
BEGIN
    DECLARE @RoleName NVARCHAR(50);
    
    SELECT TOP 1 @RoleName = r.[RoleName]
    FROM [dbo].[UserRoles] ur
    INNER JOIN [dbo].[Roles] r ON ur.[RoleID] = r.[RoleID]
    WHERE ur.[UserID] = @UserID;
    
    RETURN @RoleName;
END;
GO

PRINT 'Part 1: Users, Roles and Profiles schema created successfully';
GO