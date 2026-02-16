-- =============================================
-- COMMON DOCUMENTS API - SQL SERVER MIGRATION
-- Table structures and Stored Procedures for Document Management
-- =============================================

USE [gyansethu]
GO

-- =============================================
-- COMMON DOCUMENTS TABLE
-- Stores all documents (student, teacher, donor, etc)
-- =============================================
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

GO
