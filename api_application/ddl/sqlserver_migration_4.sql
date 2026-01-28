-- =============================================
-- PART 4: ATTENDANCE, DONORS, DONATIONS & AUDIT
-- SQL Server Migration for StudentHub Application
-- =============================================

USE [gyansethu]
GO

-- =============================================
-- ATTENDANCE RECORDS
-- =============================================
CREATE TABLE [dbo].[AttendanceRecords] (
    [AttendanceRecordID] INT IDENTITY(1,1) PRIMARY KEY,
    [StudentID] INT NOT NULL,
    [AcademicYearID] INT NOT NULL,
    [ClusterID] INT NOT NULL,
    [ProgramID] INT NOT NULL,
    [AttendanceDate] DATE NOT NULL,
    [StatusID] INT NOT NULL,
    [MarkedByTeacherID] INT NULL,
    [MarkedByUserID] INT NULL,
    [Latitude] DECIMAL(10, 8) NULL,
    [Longitude] DECIMAL(11, 8) NULL,
    [MarkedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_AttendanceRecords_Students FOREIGN KEY ([StudentID]) REFERENCES [dbo].[Students]([StudentID]) ON DELETE CASCADE,
    CONSTRAINT FK_AttendanceRecords_AcademicYears FOREIGN KEY ([AcademicYearID]) REFERENCES [dbo].[AcademicYears]([AcademicYearID]),
    CONSTRAINT FK_AttendanceRecords_Clusters FOREIGN KEY ([ClusterID]) REFERENCES [dbo].[Clusters]([ClusterID]),
    CONSTRAINT FK_AttendanceRecords_Programs FOREIGN KEY ([ProgramID]) REFERENCES [dbo].[Programs]([ProgramID]),
    CONSTRAINT FK_AttendanceRecords_StatusTypes FOREIGN KEY ([StatusID]) REFERENCES [dbo].[AttendanceStatusTypes]([AttendanceStatusTypeID]),
    CONSTRAINT FK_AttendanceRecords_Teachers FOREIGN KEY ([MarkedByTeacherID]) REFERENCES [dbo].[Teachers]([TeacherID]),
    CONSTRAINT FK_AttendanceRecords_Users FOREIGN KEY ([MarkedByUserID]) REFERENCES [dbo].[Users]([UserID]),
    CONSTRAINT UQ_AttendanceRecords_Unique UNIQUE ([StudentID], [ProgramID], [ClusterID], [AttendanceDate])
);
GO

-- =============================================
-- DONORS
-- =============================================
CREATE TABLE [dbo].[Donors] (
    [DonorID] INT IDENTITY(1,1) PRIMARY KEY,
    [DonorCode] NVARCHAR(20) UNIQUE NULL,
    [Name] NVARCHAR(255) NOT NULL,
    [DateOfBirth] DATE NULL,
    [IDProofTypeID] INT NULL,
    [IDNumber] NVARCHAR(100) NULL,
    [Address] NVARCHAR(MAX) NULL,
    [City] NVARCHAR(100) NULL,
    [State] NVARCHAR(100) NULL,
    [Company] NVARCHAR(255) NULL,
    [Phone] NVARCHAR(50) NULL,
    [Email] NVARCHAR(255) NULL,
    [DonorType] NVARCHAR(20) NULL DEFAULT 'adhoc', -- 'regular', 'csr', 'adhoc'
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Donors_IDProofTypes FOREIGN KEY ([IDProofTypeID]) REFERENCES [dbo].[IDProofTypes]([IDProofTypeID]),
    CONSTRAINT CK_Donors_Type CHECK ([DonorType] IN ('regular', 'csr', 'adhoc'))
);
GO

-- =============================================
-- DONATIONS
-- =============================================
CREATE TABLE [dbo].[Donations] (
    [DonationID] INT IDENTITY(1,1) PRIMARY KEY,
    [DonorID] INT NOT NULL,
    [DonationDate] DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    [Amount] DECIMAL(12, 2) NOT NULL,
    [Currency] NVARCHAR(10) NULL DEFAULT 'INR',
    [PaymentModeID] INT NULL,
    [ReferenceNumber] NVARCHAR(100) NULL,
    [Remarks] NVARCHAR(MAX) NULL,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Donations_Donors FOREIGN KEY ([DonorID]) REFERENCES [dbo].[Donors]([DonorID]) ON DELETE CASCADE,
    CONSTRAINT FK_Donations_PaymentModes FOREIGN KEY ([PaymentModeID]) REFERENCES [dbo].[PaymentModes]([PaymentModeID])
);
GO

-- =============================================
-- AUDIT LOGS (for tracking changes)
-- =============================================
CREATE TABLE [dbo].[AuditLogs] (
    [AuditLogID] INT IDENTITY(1,1) PRIMARY KEY,
    [TableName] NVARCHAR(100) NOT NULL,
    [RecordID] NVARCHAR(50) NOT NULL,
    [Action] NVARCHAR(20) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    [OldData] NVARCHAR(MAX) NULL, -- JSON format
    [NewData] NVARCHAR(MAX) NULL, -- JSON format
    [ChangedBy] INT NULL,
    [ChangedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_AuditLogs_Users FOREIGN KEY ([ChangedBy]) REFERENCES [dbo].[Users]([UserID]),
    CONSTRAINT CK_AuditLogs_Action CHECK ([Action] IN ('INSERT', 'UPDATE', 'DELETE'))
);
GO

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE NONCLUSTERED INDEX IX_AttendanceRecords_StudentID ON [dbo].[AttendanceRecords]([StudentID]);
CREATE NONCLUSTERED INDEX IX_AttendanceRecords_AttendanceDate ON [dbo].[AttendanceRecords]([AttendanceDate]);
CREATE NONCLUSTERED INDEX IX_AttendanceRecords_ClusterID ON [dbo].[AttendanceRecords]([ClusterID]);
CREATE NONCLUSTERED INDEX IX_AttendanceRecords_ProgramID ON [dbo].[AttendanceRecords]([ProgramID]);
CREATE NONCLUSTERED INDEX IX_AttendanceRecords_TeacherID ON [dbo].[AttendanceRecords]([MarkedByTeacherID]);

CREATE NONCLUSTERED INDEX IX_Donors_DonorCode ON [dbo].[Donors]([DonorCode]);
CREATE NONCLUSTERED INDEX IX_Donors_Email ON [dbo].[Donors]([Email]);
CREATE NONCLUSTERED INDEX IX_Donations_DonorID ON [dbo].[Donations]([DonorID]);
CREATE NONCLUSTERED INDEX IX_Donations_DonationDate ON [dbo].[Donations]([DonationDate]);

CREATE NONCLUSTERED INDEX IX_AuditLogs_TableName ON [dbo].[AuditLogs]([TableName], [RecordID]);
CREATE NONCLUSTERED INDEX IX_AuditLogs_ChangedAt ON [dbo].[AuditLogs]([ChangedAt]);
GO

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================
CREATE TRIGGER trg_AttendanceRecords_UpdatedAt
ON [dbo].[AttendanceRecords]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[AttendanceRecords]
    SET [UpdatedAt] = GETUTCDATE()
    FROM [dbo].[AttendanceRecords] ar
    INNER JOIN inserted i ON ar.[AttendanceRecordID] = i.[AttendanceRecordID];
END;
GO

CREATE TRIGGER trg_Donors_UpdatedAt
ON [dbo].[Donors]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[Donors]
    SET [UpdatedAt] = GETUTCDATE()
    FROM [dbo].[Donors] d
    INNER JOIN inserted i ON d.[DonorID] = i.[DonorID];
END;
GO

CREATE TRIGGER trg_Donations_UpdatedAt
ON [dbo].[Donations]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[Donations]
    SET [UpdatedAt] = GETUTCDATE()
    FROM [dbo].[Donations] d
    INNER JOIN inserted i ON d.[DonationID] = i.[DonationID];
END;
GO

-- =============================================
-- TRIGGER FOR AUTO-GENERATING DONOR CODE
-- =============================================
CREATE TRIGGER trg_Donors_GenerateCode
ON [dbo].[Donors]
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE [dbo].[Donors]
    SET [DonorCode] = 'DON' + RIGHT('000000' + CAST(i.[DonorID] AS NVARCHAR(10)), 6)
    FROM [dbo].[Donors] d
    INNER JOIN inserted i ON d.[DonorID] = i.[DonorID]
    WHERE d.[DonorCode] IS NULL;
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Documents')
BEGIN
    CREATE TABLE dbo.Documents (
        DocumentID INT IDENTITY(1,1) PRIMARY KEY,

        -- Reference Information
        ReferenceType NVARCHAR(50) NOT NULL,   -- Student, Teacher, Donor, etc
        ReferenceID INT NOT NULL,

        -- Document Information
        Name NVARCHAR(255) NOT NULL,
        DocumentType NVARCHAR(100) NULL,
        FileUrl NVARCHAR(MAX) NOT NULL,
        FileType NVARCHAR(50) NULL,
        FileSize BIGINT NULL,                  -- use BIGINT for files

        -- Metadata
        UploadedBy INT NULL,
        Description NVARCHAR(MAX) NULL,
        Tags NVARCHAR(500) NULL,

        -- Status & Audit
        IsActive BIT NOT NULL DEFAULT 1,
        IsVerified BIT NOT NULL DEFAULT 0,
        VerifiedBy INT NULL,
        VerifiedAt DATETIME2 NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
    );
END
GO

CREATE INDEX IX_Documents_ReferenceType
ON dbo.Documents (ReferenceType);
GO

CREATE INDEX IX_Documents_ReferenceID
ON dbo.Documents (ReferenceID);
GO

CREATE INDEX IX_Documents_ReferenceType_ReferenceID
ON dbo.Documents (ReferenceType, ReferenceID);
GO

CREATE INDEX IX_Documents_CreatedAt
ON dbo.Documents (CreatedAt);
GO

CREATE INDEX IX_Documents_IsActive
ON dbo.Documents (IsActive);
GO

---- =============================================
---- DOCUMENT CATEGORIES (For type lookup)
---- =============================================
--IF OBJECT_ID('dbo.DocumentCategories', 'U') IS NULL
--BEGIN
--    CREATE TABLE dbo.DocumentCategories (
--        DocumentCategoryID INT IDENTITY(1,1) PRIMARY KEY,
--        Name NVARCHAR(100) NOT NULL UNIQUE,
--        Description NVARCHAR(255) NULL,
--        IsActive BIT NOT NULL DEFAULT 1,
--        CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
--    );
    
--    -- Insert default categories
--    INSERT INTO dbo.DocumentCategories (Name, Description, IsActive) VALUES
--    ('ID Proof', 'Identity proof documents', 1),
--    ('Address Proof', 'Address verification documents', 1),
--    ('Educational Certificate', 'Academic certificates and transcripts', 1),
--    ('Medical', 'Medical records and health documents', 1),
--    ('Financial', 'Bank statements and financial documents', 1),
--    ('Personal', 'Personal documents and records', 1),
--    ('Administrative', 'Administrative and official documents', 1),
--    ('Other', 'Other miscellaneous documents', 1);
--END
--GO

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
CREATE OR ALTER TRIGGER TRG_Documents_UpdatedAt
ON dbo.Documents
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE d
    SET UpdatedAt = SYSDATETIME()
    FROM dbo.Documents d
    INNER JOIN inserted i ON d.DocumentID = i.DocumentID;
END
GO


PRINT 'Part 4: Attendance, Donors, Donations, Documents & Audit schema created successfully';
GO