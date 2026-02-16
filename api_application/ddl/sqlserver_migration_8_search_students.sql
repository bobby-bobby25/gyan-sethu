-- Script to add stored procedure for searching students by code
-- This supports the sibling student code autofill feature

IF EXISTS(SELECT 1 FROM SYS.PROCEDURES WHERE NAME='spSearchStudentsByCode')
DROP PROCEDURE spSearchStudentsByCode
GO

-- EXEC spSearchStudentsByCode 'STU'
CREATE PROCEDURE spSearchStudentsByCode
    @StudentName NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        s.StudentID,
        s.Name,
        s.StudentCode,
        s.Gender,
        s.DateOfBirth as DOB,
        s.Email,
        s.Phone
    FROM Students s
    WHERE 
        (@StudentName IS NULL OR @StudentName = '' OR s.Name LIKE '%' + @StudentName + '%')
        AND s.IsActive = 1
    ORDER BY 
        s.StudentCode,
        s.Name
END;
GO

-- Create index to optimize searches
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Students_StudentCode_Active' AND object_id = OBJECT_ID('dbo.Students'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Students_StudentCode_Active
    ON dbo.Students(StudentCode, IsActive)
    INCLUDE(Name, Gender, DateOfBirth);
END
GO
