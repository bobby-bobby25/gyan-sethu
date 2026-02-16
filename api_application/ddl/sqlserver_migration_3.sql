-- =============================================
-- PART 3: TEACHERS AND STUDENTS
-- SQL Server Migration for StudentHub Application
-- =============================================

USE [gyansethu]
GO

-- =============================================
-- TEACHERS
-- =============================================
CREATE TABLE [dbo].[Teachers] (
    [TeacherID] INT IDENTITY(1,1) PRIMARY KEY,
    [UserID] INT NULL,
    [Name] NVARCHAR(255) NOT NULL,
    [Email] NVARCHAR(255) NULL,
    [Phone] NVARCHAR(50) NULL,
    [Address] NVARCHAR(MAX) NULL,
    [City] INT NULL,
    [State] INT NULL,
    [IDProofTypeID] INT NULL,
    [IDNumber] NVARCHAR(100) NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Teachers_Users FOREIGN KEY ([UserID]) REFERENCES [dbo].[Users]([UserID]) ON DELETE SET NULL,
    CONSTRAINT FK_Teachers_IDProofTypes FOREIGN KEY ([IDProofTypeID]) REFERENCES [dbo].[IDProofTypes]([IDProofTypeID])
);
GO

-- =============================================
-- TEACHER ASSIGNMENTS (per academic year)
-- =============================================
CREATE TABLE [dbo].[TeacherAssignments] (
    [TeacherAssignmentID] INT IDENTITY(1,1) PRIMARY KEY,
    [TeacherID] INT NOT NULL,
    [AcademicYearID] INT NOT NULL,
    [ClusterID] INT NOT NULL,
    [ProgramID] INT NOT NULL,
    [Role] NVARCHAR(20) NOT NULL DEFAULT 'backup', -- 'main' or 'backup'
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_TeacherAssignments_Teachers FOREIGN KEY ([TeacherID]) REFERENCES [dbo].[Teachers]([TeacherID]) ON DELETE CASCADE,
    CONSTRAINT FK_TeacherAssignments_AcademicYears FOREIGN KEY ([AcademicYearID]) REFERENCES [dbo].[AcademicYears]([AcademicYearID]),
    CONSTRAINT FK_TeacherAssignments_Clusters FOREIGN KEY ([ClusterID]) REFERENCES [dbo].[Clusters]([ClusterID]),
    CONSTRAINT FK_TeacherAssignments_Programs FOREIGN KEY ([ProgramID]) REFERENCES [dbo].[Programs]([ProgramID]),
    CONSTRAINT UQ_TeacherAssignments UNIQUE ([TeacherID], [AcademicYearID], [ClusterID], [ProgramID]),
    CONSTRAINT CK_TeacherAssignments_Role CHECK ([Role] IN ('main', 'backup'))
);
GO

-- =============================================
-- STUDENTS
-- =============================================
CREATE TABLE [dbo].[Students] (
    [StudentID] INT IDENTITY(1,1) PRIMARY KEY,
    [StudentCode] NVARCHAR(20) UNIQUE NULL,
    [Name] NVARCHAR(255) NOT NULL,
    [DateOfBirth] DATE NULL,
    [IDProofTypeID] INT NULL,
    [IDNumber] NVARCHAR(100) NULL,
    [Address] NVARCHAR(MAX) NULL,
    [City] INT NULL,
    [State] INT NULL,
    [CasteID] INT NULL,
    [EnrolledAt] DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Students_IDProofTypes FOREIGN KEY ([IDProofTypeID]) REFERENCES [dbo].[IDProofTypes]([IDProofTypeID]),
    CONSTRAINT FK_Students_CasteCategories FOREIGN KEY ([CasteID]) REFERENCES [dbo].[CasteCategories]([CasteCategoryID])
);
GO

-- =============================================
-- STUDENT ACADEMIC RECORDS (yearly data)
-- =============================================
CREATE TABLE [dbo].[StudentAcademicRecords] (
    [StudentAcademicRecordID] INT IDENTITY(1,1) PRIMARY KEY,
    [StudentID] INT NOT NULL,
    [AcademicYearID] INT NOT NULL,
    [ClusterID] INT NOT NULL,
    [ProgramID] INT NOT NULL,
    [SchoolName] NVARCHAR(255) NULL,
    [ClassGrade] NVARCHAR(50) NULL,
    [AttendancePercentage] DECIMAL(5, 2) NULL,
    [ResultPercentage] DECIMAL(5, 2) NULL,
    [YearlyFees] DECIMAL(10, 2) NULL,
    [Remarks] NVARCHAR(MAX) NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_StudentAcademicRecords_Students FOREIGN KEY ([StudentID]) REFERENCES [dbo].[Students]([StudentID]) ON DELETE CASCADE,
    CONSTRAINT FK_StudentAcademicRecords_AcademicYears FOREIGN KEY ([AcademicYearID]) REFERENCES [dbo].[AcademicYears]([AcademicYearID]),
    CONSTRAINT FK_StudentAcademicRecords_Clusters FOREIGN KEY ([ClusterID]) REFERENCES [dbo].[Clusters]([ClusterID]),
    CONSTRAINT FK_StudentAcademicRecords_Programs FOREIGN KEY ([ProgramID]) REFERENCES [dbo].[Programs]([ProgramID]),
    CONSTRAINT UQ_StudentAcademicRecords UNIQUE ([StudentID], [AcademicYearID], [ProgramID])
);
GO

-- =============================================
-- FAMILY MEMBERS
-- =============================================
CREATE TABLE [dbo].[FamilyMembers] (
    [FamilyMemberID] INT IDENTITY(1,1) PRIMARY KEY,
    [StudentID] INT NOT NULL,
    [Relationship] INT NOT NULL,
    [Name] NVARCHAR(255) NOT NULL,
    [DateOfBirth] DATE NULL,
    [IDProofTypeID] INT NULL,
    [IDNumber] NVARCHAR(100) NULL,
    [Address] NVARCHAR(MAX) NULL,
    [City] INT NULL,
    [State] INT NULL,
    [Phone] NVARCHAR(50) NULL,
    [Occupation] INT NULL,
    [AnnualIncome] DECIMAL(12, 2) NULL,
    [Currency] NVARCHAR(10) NULL DEFAULT 'INR',
    [BankName] NVARCHAR(255) NULL,
    [BankAccountNumber] NVARCHAR(50) NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_FamilyMembers_Students FOREIGN KEY ([StudentID]) REFERENCES [dbo].[Students]([StudentID]) ON DELETE CASCADE,
    CONSTRAINT FK_FamilyMembers_IDProofTypes FOREIGN KEY ([IDProofTypeID]) REFERENCES [dbo].[IDProofTypes]([IDProofTypeID])
);
GO

IF NOT EXISTS (SELECT * FROM SYS.TABLES WHERE NAME = 'StudentFamilyMemberLinking')
BEGIN
    CREATE TABLE [dbo].[StudentFamilyMemberLinking] (
        [StudentFamilyMemberLinkingID] INT IDENTITY(1,1) PRIMARY KEY,
        [StudentID] INT NOT NULL,
        [FamilyMemberID] INT NOT NULL,
        [IsPrimary] BIT NOT NULL DEFAULT 1,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_StudentFamilyMemberLinking_Students FOREIGN KEY ([StudentID]) REFERENCES [dbo].[Students]([StudentID]) ON DELETE CASCADE,
        CONSTRAINT FK_StudentFamilyMemberLinking_FamilyMember FOREIGN KEY ([FamilyMemberID]) REFERENCES [dbo].[FamilyMembers]([FamilyMemberID]) ON DELETE NO ACTION,
        CONSTRAINT UQ_StudentFamilyMemberLinking UNIQUE ([StudentID], [FamilyMemberID])
    );
    
END
GO

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE NONCLUSTERED INDEX IX_Teachers_UserID ON [dbo].[Teachers]([UserID]);
CREATE NONCLUSTERED INDEX IX_Teachers_Email ON [dbo].[Teachers]([Email]);
CREATE NONCLUSTERED INDEX IX_TeacherAssignments_TeacherID ON [dbo].[TeacherAssignments]([TeacherID]);
CREATE NONCLUSTERED INDEX IX_TeacherAssignments_ClusterID ON [dbo].[TeacherAssignments]([ClusterID]);
CREATE NONCLUSTERED INDEX IX_TeacherAssignments_ProgramID ON [dbo].[TeacherAssignments]([ProgramID]);
CREATE NONCLUSTERED INDEX IX_TeacherAssignments_AcademicYearID ON [dbo].[TeacherAssignments]([AcademicYearID]);

CREATE NONCLUSTERED INDEX IX_Students_StudentCode ON [dbo].[Students]([StudentCode]);
CREATE NONCLUSTERED INDEX IX_Students_Name ON [dbo].[Students]([Name]);
CREATE NONCLUSTERED INDEX IX_StudentAcademicRecords_StudentID ON [dbo].[StudentAcademicRecords]([StudentID]);
CREATE NONCLUSTERED INDEX IX_StudentAcademicRecords_ClusterID ON [dbo].[StudentAcademicRecords]([ClusterID]);
CREATE NONCLUSTERED INDEX IX_StudentAcademicRecords_ProgramID ON [dbo].[StudentAcademicRecords]([ProgramID]);
CREATE NONCLUSTERED INDEX IX_StudentAcademicRecords_AcademicYearID ON [dbo].[StudentAcademicRecords]([AcademicYearID]);

CREATE NONCLUSTERED INDEX IX_FamilyMembers_StudentID ON [dbo].[FamilyMembers]([StudentID]);
CREATE NONCLUSTERED INDEX IX_StudentFamilyMemberLinking_StudentID ON [dbo].[StudentFamilyMemberLinking]([StudentID]);
CREATE NONCLUSTERED INDEX IX_StudentFamilyMemberLinking_FamilyMemberID ON [dbo].[StudentFamilyMemberLinking]([FamilyMemberID]);
GO

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================
CREATE TRIGGER trg_Teachers_UpdatedAt
ON [dbo].[Teachers]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[Teachers]
    SET [UpdatedAt] = GETUTCDATE()
    FROM [dbo].[Teachers] t
    INNER JOIN inserted i ON t.[TeacherID] = i.[TeacherID];
END;
GO

CREATE TRIGGER trg_TeacherAssignments_UpdatedAt
ON [dbo].[TeacherAssignments]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[TeacherAssignments]
    SET [UpdatedAt] = GETUTCDATE()
    FROM [dbo].[TeacherAssignments] ta
    INNER JOIN inserted i ON ta.[TeacherAssignmentID] = i.[TeacherAssignmentID];
END;
GO

CREATE TRIGGER trg_Students_UpdatedAt
ON [dbo].[Students]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[Students]
    SET [UpdatedAt] = GETUTCDATE()
    FROM [dbo].[Students] s
    INNER JOIN inserted i ON s.[StudentID] = i.[StudentID];
END;
GO

CREATE TRIGGER trg_StudentAcademicRecords_UpdatedAt
ON [dbo].[StudentAcademicRecords]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[StudentAcademicRecords]
    SET [UpdatedAt] = GETUTCDATE()
    FROM [dbo].[StudentAcademicRecords] sar
    INNER JOIN inserted i ON sar.[StudentAcademicRecordID] = i.[StudentAcademicRecordID];
END;
GO

CREATE TRIGGER trg_FamilyMembers_UpdatedAt
ON [dbo].[FamilyMembers]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[FamilyMembers]
    SET [UpdatedAt] = GETUTCDATE()
    FROM [dbo].[FamilyMembers] fm
    INNER JOIN inserted i ON fm.[FamilyMemberID] = i.[FamilyMemberID];
END;
GO

-- =============================================
-- TRIGGER FOR AUTO-GENERATING STUDENT CODE
-- =============================================
CREATE TRIGGER trg_Students_GenerateCode
ON [dbo].[Students]
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE [dbo].[Students]
    SET [StudentCode] = 'STU' + RIGHT('000000' + CAST(i.[StudentID] AS NVARCHAR(10)), 6)
    FROM [dbo].[Students] s
    INNER JOIN inserted i ON s.[StudentID] = i.[StudentID]
    WHERE s.[StudentCode] IS NULL;
END;
GO

PRINT 'Part 3: Teachers and Students schema created successfully';
GO