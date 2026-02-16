-- =============================================
-- SQL Server Migration 7: 
-- Teacher Subjects, Learning Centres, Parent Linking, School Type/Medium
-- =============================================

USE [gyansethu]
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'StudentAcademicRecords' AND COLUMN_NAME = 'SchoolTypeID')
BEGIN
    ALTER TABLE [dbo].[StudentAcademicRecords] ADD [SchoolTypeID] INT NULL;
    ALTER TABLE [dbo].[StudentAcademicRecords] ADD CONSTRAINT FK_StudentAcademicRecords_SchoolTypes FOREIGN KEY ([SchoolTypeID]) REFERENCES [dbo].[SchoolTypes]([SchoolTypeID]) ON DELETE SET NULL;
END
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'StudentAcademicRecords' AND COLUMN_NAME = 'MediumID')
BEGIN
    ALTER TABLE [dbo].[StudentAcademicRecords] ADD [MediumID] INT NULL;
    ALTER TABLE [dbo].[StudentAcademicRecords] ADD CONSTRAINT FK_StudentAcademicRecords_Mediums FOREIGN KEY ([MediumID]) REFERENCES [dbo].[Mediums]([MediumID]) ON DELETE SET NULL;
END
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Students' AND COLUMN_NAME = 'SiblingStudentCode')
BEGIN
    ALTER TABLE [dbo].[Students] ADD [SiblingStudentCode] NVARCHAR(20) NULL;
    ALTER TABLE [dbo].[Students] ADD CONSTRAINT FK_Students_SiblingStudentCode FOREIGN KEY ([SiblingStudentCode]) REFERENCES [dbo].[Students]([StudentCode]) ON DELETE SET NULL;
END
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'StudentAcademicRecords' AND COLUMN_NAME = 'LearningCentreID')
BEGIN
    ALTER TABLE [dbo].[StudentAcademicRecords] ADD [LearningCentreID] INT NULL;
    ALTER TABLE [dbo].[StudentAcademicRecords] ADD CONSTRAINT FK_StudentAcademicRecords_LearningCenters FOREIGN KEY ([LearningCentreID]) REFERENCES [dbo].[LearningCentres]([LearningCentreID]) ON DELETE SET NULL;
END
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'TeacherAssignments' AND COLUMN_NAME = 'LearningCentreID')
BEGIN
    ALTER TABLE [dbo].[TeacherAssignments] ADD [LearningCentreID] INT NULL;
    ALTER TABLE [dbo].[TeacherAssignments] ADD CONSTRAINT FK_TeacherAssignments_LearningCenters FOREIGN KEY ([LearningCentreID]) REFERENCES [dbo].[LearningCentres]([LearningCentreID]) ON DELETE SET NULL;
END
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Teachers' AND COLUMN_NAME = 'StudentID')
BEGIN
    ALTER TABLE [dbo].[Teachers] ADD [StudentID] INT NULL;
    ALTER TABLE [dbo].[Teachers] ADD CONSTRAINT FK_Teachers_Students FOREIGN KEY ([StudentID]) REFERENCES [dbo].[Students]([StudentID]) ON DELETE SET NULL;
END
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Teachers' AND COLUMN_NAME = 'Subjects')
BEGIN
    ALTER TABLE [dbo].[Teachers] ADD [Subjects] NVARCHAR(MAX) NULL;
END
GO


PRINT 'Migration 7 completed successfully';
