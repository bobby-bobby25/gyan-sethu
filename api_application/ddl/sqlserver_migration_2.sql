-- =============================================
-- PART 2: MASTER/REFERENCE TABLES
-- SQL Server Migration for StudentHub Application
-- =============================================

USE [gyansethu]
GO

-- =============================================
-- ACADEMIC YEARS
-- =============================================
CREATE TABLE [dbo].[AcademicYears] (
    [AcademicYearID] INT IDENTITY(1,1) PRIMARY KEY,
    [Name] NVARCHAR(100) NOT NULL UNIQUE,
    [StartDate] DATE NOT NULL,
    [EndDate] DATE NOT NULL,
    [IsCurrent] BIT NOT NULL DEFAULT 0,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
GO

-- =============================================
-- ID PROOF TYPES
-- =============================================
CREATE TABLE [dbo].[IDProofTypes] (
    [IDProofTypeID] INT IDENTITY(1,1) PRIMARY KEY,
    [Name] NVARCHAR(100) NOT NULL UNIQUE,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
GO

-- Insert default ID proof types
INSERT INTO [dbo].[IDProofTypes] ([Name]) VALUES
('Aadhar Card'),
('PAN Card'),
('Voter ID'),
('Driving License'),
('Passport'),
('Ration Card'),
('Birth Certificate');
GO

-- =============================================
-- CASTE CATEGORIES
-- =============================================
CREATE TABLE [dbo].[CasteCategories] (
    [CasteCategoryID] INT IDENTITY(1,1) PRIMARY KEY,
    [Name] NVARCHAR(100) NOT NULL UNIQUE,
    [Code] NVARCHAR(10) NOT NULL UNIQUE,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
GO

-- Insert default caste categories
INSERT INTO [dbo].[CasteCategories] ([Name], [Code]) VALUES
('General', 'GEN'),
('Other Backward Class', 'OBC'),
('Scheduled Caste', 'SC'),
('Scheduled Tribe', 'ST'),
('Economically Weaker Section', 'EWS');
GO

-- =============================================
-- ATTENDANCE STATUS TYPES
-- =============================================
CREATE TABLE [dbo].[AttendanceStatusTypes] (
    [AttendanceStatusTypeID] INT IDENTITY(1,1) PRIMARY KEY,
    [Name] NVARCHAR(50) NOT NULL UNIQUE,
    [Code] NVARCHAR(10) NOT NULL UNIQUE,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
GO

-- Insert default attendance status types
INSERT INTO [dbo].[AttendanceStatusTypes] ([Name], [Code]) VALUES
('Present', 'P'),
('Absent', 'A'),
('Late', 'L'),
('Half Day', 'HD'),
('On Leave', 'OL'),
('Holiday', 'H');
GO

-- =============================================
-- PAYMENT MODES
-- =============================================
CREATE TABLE [dbo].[PaymentModes] (
    [PaymentModeID] INT IDENTITY(1,1) PRIMARY KEY,
    [Name] NVARCHAR(50) NOT NULL UNIQUE,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
GO

-- Insert default payment modes
INSERT INTO [dbo].[PaymentModes] ([Name]) VALUES
('Cash'),
('Cheque'),
('Online Transfer'),
('UPI'),
('Card'),
('Demand Draft');
GO

-- =============================================
-- PROGRAMS
-- =============================================
CREATE TABLE [dbo].[Programs] (
    [ProgramID] INT IDENTITY(1,1) PRIMARY KEY,
    [Name] NVARCHAR(255) NOT NULL UNIQUE,
    [Description] NVARCHAR(MAX) NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
GO

-- =============================================
-- CLUSTERS (Teaching Centers)
-- =============================================
CREATE TABLE [dbo].[Clusters] (
    [ClusterID] INT IDENTITY(1,1) PRIMARY KEY,
    [Name] NVARCHAR(255) NOT NULL,
    [Address] NVARCHAR(MAX) NULL,
    [City] INT NULL,
    [State] INT NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
GO

IF NOT EXISTS (SELECT * FROM SYS.TABLES WHERE NAME = 'LearningCentres')
BEGIN
    CREATE TABLE [dbo].[LearningCentres] (
        [LearningCenterID] INT IDENTITY(1,1) PRIMARY KEY,
        [ClusterID] INT NOT NULL,
        [Name] NVARCHAR(255) NOT NULL,
        [Address] NVARCHAR(MAX) NULL,
        [City] INT NULL,
        [State] INT NULL,
        [Latitude] DECIMAL(10, 8) NULL,
        [Longitude] DECIMAL(11, 8) NULL,
        [GeoRadiusMeters] INT NULL,
		[Notes] NVARCHAR(MAX) NULL,
        [IsActive] BIT NOT NULL DEFAULT 1,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_LearningCentres_Clusters FOREIGN KEY ([ClusterID]) REFERENCES [dbo].[Clusters]([ClusterID]) ON DELETE CASCADE
    );
    
    CREATE NONCLUSTERED INDEX IX_LearningCentres_ClusterID ON [dbo].[LearningCentres]([ClusterID]);
    CREATE NONCLUSTERED INDEX IX_LearningCentres_IsActive ON [dbo].[LearningCentres]([IsActive]);
END
GO

-- =============================================
-- INDEXES
-- =============================================
CREATE NONCLUSTERED INDEX IX_AcademicYears_IsCurrent ON [dbo].[AcademicYears]([IsCurrent]) WHERE [IsCurrent] = 1;
CREATE NONCLUSTERED INDEX IX_Programs_IsActive ON [dbo].[Programs]([IsActive]) WHERE [IsActive] = 1;
CREATE NONCLUSTERED INDEX IX_Clusters_IsActive ON [dbo].[Clusters]([IsActive]) WHERE [IsActive] = 1;
GO

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================
CREATE TRIGGER trg_AcademicYears_UpdatedAt
ON [dbo].[AcademicYears]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[AcademicYears]
    SET [UpdatedAt] = GETUTCDATE()
    FROM [dbo].[AcademicYears] ay
    INNER JOIN inserted i ON ay.[AcademicYearID] = i.[AcademicYearID];
END;
GO

CREATE TRIGGER trg_Programs_UpdatedAt
ON [dbo].[Programs]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[Programs]
    SET [UpdatedAt] = GETUTCDATE()
    FROM [dbo].[Programs] p
    INNER JOIN inserted i ON p.[ProgramID] = i.[ProgramID];
END;
GO

CREATE TRIGGER trg_Clusters_UpdatedAt
ON [dbo].[Clusters]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[Clusters]
    SET [UpdatedAt] = GETUTCDATE()
    FROM [dbo].[Clusters] c
    INNER JOIN inserted i ON c.[ClusterID] = i.[ClusterID];
END;
GO


CREATE OR ALTER TRIGGER trg_LearningCentres_UpdatedAt
ON [dbo].[LearningCentres]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[LearningCentres]
    SET [UpdatedAt] = GETUTCDATE()
    FROM [dbo].[LearningCentres] lc
    INNER JOIN inserted i ON lc.[LearningCentreID] = i.[LearningCentreID];
END;
GO

-- =============================================
-- TRIGGER TO ENSURE ONLY ONE CURRENT ACADEMIC YEAR
-- =============================================
CREATE TRIGGER trg_AcademicYears_EnforceSingleCurrent
ON [dbo].[AcademicYears]
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- If any row is being set to IsCurrent = 1, set all others to 0
    IF EXISTS (SELECT 1 FROM inserted WHERE [IsCurrent] = 1)
    BEGIN
        UPDATE [dbo].[AcademicYears]
        SET [IsCurrent] = 0
        WHERE [AcademicYearID] NOT IN (SELECT [AcademicYearID] FROM inserted WHERE [IsCurrent] = 1)
            AND [IsCurrent] = 1;
    END
END;
GO

IF NOT EXISTS (SELECT * FROM SYS.TABLES WHERE NAME = 'Subjects')
BEGIN
    CREATE TABLE [dbo].[Subjects] (
        [SubjectID] INT IDENTITY(1,1) PRIMARY KEY,
        [Name] NVARCHAR(255) NOT NULL UNIQUE,
        [Code] NVARCHAR(50) NOT NULL UNIQUE,
        [Description] NVARCHAR(MAX) NULL,
        [IsActive] BIT NOT NULL DEFAULT 1,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
    
    CREATE NONCLUSTERED INDEX IX_Subjects_IsActive ON [dbo].[Subjects]([IsActive]);
END
GO

IF NOT EXISTS (SELECT * FROM SYS.TABLES WHERE NAME = 'SchoolTypes')
BEGIN
    CREATE TABLE [dbo].[SchoolTypes] (
        [SchoolTypeID] INT IDENTITY(1,1) PRIMARY KEY,
        [Name] NVARCHAR(255) NOT NULL UNIQUE,
        [Code] NVARCHAR(50) NOT NULL UNIQUE,
        [Description] NVARCHAR(MAX) NULL,
        [IsActive] BIT NOT NULL DEFAULT 1,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
    
    CREATE NONCLUSTERED INDEX IX_SchoolTypes_IsActive ON [dbo].[SchoolTypes]([IsActive]);
    
    -- Insert default school types
    INSERT INTO [dbo].[SchoolTypes] ([Name], [Code]) VALUES
    ('Government', 'GOV'),
    ('Aided', 'AIDED'),
    ('Private', 'PVT'),
    ('Unaided', 'UNAID');
END
GO

IF NOT EXISTS (SELECT * FROM SYS.TABLES WHERE NAME = 'Mediums')
BEGIN
    CREATE TABLE [dbo].[Mediums] (
        [MediumID] INT IDENTITY(1,1) PRIMARY KEY,
        [Name] NVARCHAR(255) NOT NULL UNIQUE,
        [Code] NVARCHAR(50) NOT NULL UNIQUE,
        [Description] NVARCHAR(MAX) NULL,
        [IsActive] BIT NOT NULL DEFAULT 1,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
    
    CREATE NONCLUSTERED INDEX IX_Mediums_IsActive ON [dbo].[Mediums]([IsActive]);
    
    -- Insert default mediums
    INSERT INTO [dbo].[Mediums] ([Name], [Code]) VALUES
    ('Kannada', 'KAN'),
    ('English', 'ENG'),
    ('Hindi', 'HIN'),
    ('Marathi', 'MAR');
END
GO

CREATE OR ALTER TRIGGER trg_Subjects_UpdatedAt
ON [dbo].[Subjects]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[Subjects]
    SET [UpdatedAt] = GETUTCDATE()
    FROM [dbo].[Subjects] ts
    INNER JOIN inserted i ON ts.[SubjectID] = i.[SubjectID];
END;
GO


PRINT 'Part 2: Master/Reference Tables schema created successfully';
GO