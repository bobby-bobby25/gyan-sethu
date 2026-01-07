-- =============================================
-- PART 4: ATTENDANCE, DONORS, DONATIONS & AUDIT
-- SQL Server Migration for StudentHub Application
-- =============================================

USE [P2_PROD_IGB_Replica]
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

-- =============================================
-- HELPER STORED PROCEDURES
-- =============================================

-- Get Attendance Records with Details
CREATE OR ALTER PROCEDURE [dbo].[sp_GetAttendanceRecords]
    @StudentID INT = NULL,
    @ClusterID INT = NULL,
    @ProgramID INT = NULL,
    @AcademicYearID INT = NULL,
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
        ast.[Name] AS [Status],
        ast.[Code] AS [StatusCode],
        c.[Name] AS [ClusterName],
        p.[Name] AS [ProgramName],
        ay.[Name] AS [AcademicYear],
        t.[Name] AS [MarkedByTeacher],
        ar.[Latitude],
        ar.[Longitude],
        ar.[MarkedAt]
    FROM [dbo].[AttendanceRecords] ar
    INNER JOIN [dbo].[Students] s ON ar.[StudentID] = s.[StudentID]
    INNER JOIN [dbo].[AttendanceStatusTypes] ast ON ar.[StatusID] = ast.[AttendanceStatusTypeID]
    INNER JOIN [dbo].[Clusters] c ON ar.[ClusterID] = c.[ClusterID]
    INNER JOIN [dbo].[Programs] p ON ar.[ProgramID] = p.[ProgramID]
    INNER JOIN [dbo].[AcademicYears] ay ON ar.[AcademicYearID] = ay.[AcademicYearID]
    LEFT JOIN [dbo].[Teachers] t ON ar.[MarkedByTeacherID] = t.[TeacherID]
    WHERE (@StudentID IS NULL OR ar.[StudentID] = @StudentID)
        AND (@ClusterID IS NULL OR ar.[ClusterID] = @ClusterID)
        AND (@ProgramID IS NULL OR ar.[ProgramID] = @ProgramID)
        AND (@AcademicYearID IS NULL OR ar.[AcademicYearID] = @AcademicYearID)
        AND (@FromDate IS NULL OR ar.[AttendanceDate] >= @FromDate)
        AND (@ToDate IS NULL OR ar.[AttendanceDate] <= @ToDate)
    ORDER BY ar.[AttendanceDate] DESC, s.[Name];
END;
GO

-- Upsert Attendance Record
CREATE OR ALTER PROCEDURE [dbo].[sp_UpsertAttendanceRecord]
    @StudentID INT,
    @AcademicYearID INT,
    @ClusterID INT,
    @ProgramID INT,
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
            AND [ClusterID] = @ClusterID
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
            AND [ClusterID] = @ClusterID
            AND [AttendanceDate] = @AttendanceDate;
    END
    ELSE
    BEGIN
        -- Insert new record
        INSERT INTO [dbo].[AttendanceRecords] (
            [StudentID], [AcademicYearID], [ClusterID], [ProgramID],
            [AttendanceDate], [StatusID], [MarkedByTeacherID], 
            [MarkedByUserID], [Latitude], [Longitude]
        )
        VALUES (
            @StudentID, @AcademicYearID, @ClusterID, @ProgramID,
            @AttendanceDate, @StatusID, @MarkedByTeacherID,
            @MarkedByUserID, @Latitude, @Longitude
        );
    END
    
    SELECT SCOPE_IDENTITY() AS [AttendanceRecordID];
END;
GO

PRINT 'Part 4: Attendance, Donors, Donations & Audit schema created successfully';
GO