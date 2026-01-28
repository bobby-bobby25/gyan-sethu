-- =============================================
-- PART 1: USERS, ROLES AND PROFILES
-- SQL Server Migration for StudentHub Application
-- =============================================

USE [gyansethu]
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
IF NOT EXISTS(SELECT * FROM SYS.tables WHERE name = 'Mbl_CMN_RefreshTokenDtls')
BEGIN
	CREATE TABLE Mbl_CMN_RefreshTokenDtls
	(
		Id INT IDENTITY PRIMARY KEY,
		UserId INT NOT NULL,
		Token NVARCHAR(200) NOT NULL,
		Expires DATETIME NOT NULL,
		Created DATETIME NOT NULL DEFAULT GETDATE(),
		Revoked DATETIME NULL
	 )
END

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE NONCLUSTERED INDEX IX_Users_Email ON [dbo].[Users]([Email]);
CREATE NONCLUSTERED INDEX IX_UserRoles_UserID ON [dbo].[UserRoles]([UserID]);
CREATE NONCLUSTERED INDEX IX_UserRoles_RoleID ON [dbo].[UserRoles]([RoleID]);
--CREATE NONCLUSTERED INDEX IX_RefreshTokens_UserID ON [dbo].[RefreshTokens]([UserID]);
--CREATE NONCLUSTERED INDEX IX_RefreshTokens_Token ON [dbo].[RefreshTokens]([RefreshToken]);
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