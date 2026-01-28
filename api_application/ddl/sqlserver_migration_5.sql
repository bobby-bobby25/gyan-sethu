/* =========================================================
   ATTENDANCE UNIQUE CONSTRAINT
========================================================= */
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes 
    WHERE name = 'UQ_Attendance_Student_Program_Cluster_Date'
)
BEGIN
    ALTER TABLE AttendanceRecords
    ADD CONSTRAINT UQ_Attendance_Student_Program_Cluster_Date
    UNIQUE (StudentID, ProgramID, ClusterID, AttendanceDate);
END
GO

/* =========================================================
   STUDENTS – PROFILE FIELDS
========================================================= */
IF COL_LENGTH('Students', 'City') IS NULL
    ALTER TABLE Students ADD City NVARCHAR(100);

IF COL_LENGTH('Students', 'State') IS NULL
    ALTER TABLE Students ADD State NVARCHAR(100);

IF COL_LENGTH('Students', 'Gender') IS NULL
    ALTER TABLE Students ADD Gender NVARCHAR(20);

IF COL_LENGTH('Students', 'Phone') IS NULL
    ALTER TABLE Students ADD Phone NVARCHAR(20);

IF COL_LENGTH('Students', 'Email') IS NULL
    ALTER TABLE Students ADD Email NVARCHAR(255);

IF COL_LENGTH('Students', 'Ambition') IS NULL
    ALTER TABLE Students ADD Ambition NVARCHAR(255);

IF COL_LENGTH('Students', 'Hobbies') IS NULL
    ALTER TABLE Students ADD Hobbies NVARCHAR(MAX);

IF COL_LENGTH('Students', 'Notes') IS NULL
    ALTER TABLE Students ADD Notes NVARCHAR(MAX);

IF COL_LENGTH('Students', 'PhotoUrl') IS NULL
    ALTER TABLE Students ADD PhotoUrl NVARCHAR(MAX);
GO

IF COL_LENGTH('Students', 'PhotoDocumentID') IS NULL
    ALTER TABLE Students ADD PhotoDocumentID INT;
GO

ALTER TABLE Students
ADD CONSTRAINT FK_Student_PhotoDocument
FOREIGN KEY (PhotoDocumentId)
REFERENCES Documents(DocumentID);

/* =========================================================
   FAMILY MEMBERS
========================================================= */
IF COL_LENGTH('FamilyMembers', 'City') IS NULL
    ALTER TABLE FamilyMembers ADD City NVARCHAR(100);

IF COL_LENGTH('FamilyMembers', 'State') IS NULL
    ALTER TABLE FamilyMembers ADD State NVARCHAR(100);

IF COL_LENGTH('FamilyMembers', 'Phone') IS NULL
    ALTER TABLE FamilyMembers ADD Phone NVARCHAR(20);

IF COL_LENGTH('FamilyMembers', 'PhotoUrl') IS NULL
    ALTER TABLE FamilyMembers ADD PhotoUrl NVARCHAR(MAX);

IF COL_LENGTH('FamilyMembers', 'Gender') IS NULL
    ALTER TABLE FamilyMembers ADD Gender NVARCHAR(20);

IF COL_LENGTH('FamilyMembers', 'Notes') IS NULL
    ALTER TABLE FamilyMembers ADD Notes NVARCHAR(MAX);
GO

IF COL_LENGTH('FamilyMembers', 'PhotoDocumentID') IS NULL
    ALTER TABLE FamilyMembers ADD PhotoDocumentID INT;
GO

ALTER TABLE FamilyMembers
ADD CONSTRAINT FK_FamilyMember_PhotoDocument
FOREIGN KEY (PhotoDocumentId)
REFERENCES Documents(DocumentID);

/* =========================================================
   TEACHERS
========================================================= */
IF COL_LENGTH('Teachers', 'City') IS NULL
    ALTER TABLE Teachers ADD City NVARCHAR(100);

IF COL_LENGTH('Teachers', 'State') IS NULL
    ALTER TABLE Teachers ADD State NVARCHAR(100);

IF COL_LENGTH('Teachers', 'Gender') IS NULL
    ALTER TABLE Teachers ADD Gender NVARCHAR(20);

IF COL_LENGTH('Teachers', 'DateOfBirth') IS NULL
    ALTER TABLE Teachers ADD DateOfBirth DATE;

IF COL_LENGTH('Teachers', 'Notes') IS NULL
    ALTER TABLE Teachers ADD Notes NVARCHAR(MAX);

IF COL_LENGTH('Teachers', 'PhotoUrl') IS NULL
    ALTER TABLE Teachers ADD PhotoUrl NVARCHAR(MAX);
GO

IF COL_LENGTH('Teachers', 'PhotoDocumentID') IS NULL
    ALTER TABLE Teachers ADD PhotoDocumentID INT;
GO

ALTER TABLE Teachers
ADD CONSTRAINT FK_Teacher_PhotoDocument
FOREIGN KEY (PhotoDocumentId)
REFERENCES Documents(DocumentID);

/* =========================================================
   DONORS
========================================================= */
IF COL_LENGTH('Donors', 'City') IS NULL
    ALTER TABLE Donors ADD City NVARCHAR(100);

IF COL_LENGTH('Donors', 'State') IS NULL
    ALTER TABLE Donors ADD State NVARCHAR(100);
GO

/* =========================================================
   CLUSTERS
========================================================= */
IF COL_LENGTH('Clusters', 'Notes') IS NULL
    ALTER TABLE Clusters ADD Notes NVARCHAR(MAX);
GO

/* =========================================================
   AMBITIONS MASTER
========================================================= */
IF OBJECT_ID('Ambitions', 'U') IS NULL
BEGIN
    CREATE TABLE Ambitions (
        ID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Name NVARCHAR(255) NOT NULL,
        IsActive BIT DEFAULT 1,
        CreatedAt DATETIME2 DEFAULT SYSDATETIME()
    );
END
GO

/* =========================================================
   HOBBIES MASTER
========================================================= */
IF OBJECT_ID('Hobbies', 'U') IS NULL
BEGIN
    CREATE TABLE Hobbies (
        ID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Name NVARCHAR(255) NOT NULL,
        IsActive BIT DEFAULT 1,
        CreatedAt DATETIME2 DEFAULT SYSDATETIME()
    );
END
GO

/* =========================================================
   CITIES MASTER
========================================================= */
IF OBJECT_ID('Cities', 'U') IS NULL
BEGIN
    CREATE TABLE Cities (
        ID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Name NVARCHAR(255) NOT NULL,
        State NVARCHAR(255) NOT NULL,
        IsActive BIT DEFAULT 1,
        CreatedAt DATETIME2 DEFAULT SYSDATETIME()
    );
END
GO

/* =========================================================
   STUDENT DOCUMENTS
========================================================= */
IF OBJECT_ID('dbo.StudentDocuments', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.StudentDocuments (
        StudentDocumentID INT IDENTITY(1,1) PRIMARY KEY,

        StudentID INT NOT NULL,

        Name NVARCHAR(255) NOT NULL,
        FileUrl NVARCHAR(MAX) NOT NULL,
        FileType NVARCHAR(50),
        FileSize INT,

        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

        CONSTRAINT FK_StudentDocuments_Students
            FOREIGN KEY (StudentID)
            REFERENCES dbo.Students(StudentID)
            ON DELETE CASCADE
    );
END
GO

/* =========================================================
   UPDATED_AT TRIGGER
========================================================= */
CREATE OR ALTER TRIGGER TRG_StudentDocuments_UpdatedAt
ON StudentDocuments
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE sd
    SET UpdatedAt = SYSDATETIME()
    FROM StudentDocuments sd
    INNER JOIN inserted i ON sd.StudentDocumentID = i.StudentDocumentID;
END
GO


IF NOT EXISTS (SELECT 1 FROM Ambitions)
BEGIN
    INSERT INTO Ambitions (Name)
    VALUES
        ('Doctor'),
        ('Engineer'),
        ('Teacher'),
        ('Police Officer'),
        ('Scientist'),
        ('Artist'),
        ('Musician'),
        ('Lawyer'),
        ('Business Owner'),
        ('Government Officer'),
        ('Nurse'),
        ('Athlete'),
        ('Social Worker'),
        ('Farmer'),
        ('Other');
END
GO


IF NOT EXISTS (SELECT 1 FROM Hobbies)
BEGIN
    INSERT INTO Hobbies (Name)
    VALUES
        ('Reading'),
        ('Sports'),
        ('Music'),
        ('Dance'),
        ('Art & Drawing'),
        ('Cooking'),
        ('Gardening'),
        ('Photography'),
        ('Gaming'),
        ('Writing'),
        ('Crafts'),
        ('Swimming'),
        ('Cycling'),
        ('Yoga'),
        ('Other');
END
GO


IF NOT EXISTS (SELECT 1 FROM Cities)
BEGIN
    INSERT INTO Cities (Name, State)
    VALUES
        ('Mumbai', 'Maharashtra'),
        ('Pune', 'Maharashtra'),
        ('Nagpur', 'Maharashtra'),
        ('Thane', 'Maharashtra'),

        ('Delhi', 'Delhi'),
        ('New Delhi', 'Delhi'),

        ('Bangalore', 'Karnataka'),
        ('Mysore', 'Karnataka'),

        ('Chennai', 'Tamil Nadu'),
        ('Coimbatore', 'Tamil Nadu'),

        ('Hyderabad', 'Telangana'),

        ('Kolkata', 'West Bengal'),

        ('Ahmedabad', 'Gujarat'),
        ('Surat', 'Gujarat'),

        ('Jaipur', 'Rajasthan'),

        ('Lucknow', 'Uttar Pradesh'),
        ('Kanpur', 'Uttar Pradesh'),

        ('Patna', 'Bihar'),

        ('Bhopal', 'Madhya Pradesh'),
        ('Indore', 'Madhya Pradesh'),

        ('Chandigarh', 'Punjab'),
        ('Ludhiana', 'Punjab'),

        ('Kochi', 'Kerala'),
        ('Thiruvananthapuram', 'Kerala'),

        ('Bhubaneswar', 'Odisha'),

        ('Guwahati', 'Assam'),

        ('Ranchi', 'Jharkhand'),

        ('Raipur', 'Chhattisgarh'),

        ('Dehradun', 'Uttarakhand'),

        ('Shimla', 'Himachal Pradesh');
END
GO
