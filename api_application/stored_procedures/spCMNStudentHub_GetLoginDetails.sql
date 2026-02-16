IF EXISTS(SELECT 1 FROM SYS.PROCEDURES WHERE NAME='spCMNStudentHub_GetLoginDetails')
DROP PROCEDURE spCMNStudentHub_GetLoginDetails
GO
-- EXEC spCMNStudentHub_GetLoginDetails 'Testadmin@yahoo.com'
CREATE PROCEDURE spCMNStudentHub_GetLoginDetails
    @Email NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        U.UserID,
		UP.FullName,
        U.Email,
        U.PasswordHash,
        STRING_AGG(R.RoleName, ',') AS Role
    FROM Users U
    INNER JOIN UserRoles UR ON U.UserID = UR.UserID
	INNER JOIN UserProfiles UP ON U.UserID = UP.UserID
    INNER JOIN Roles R ON UR.RoleID = R.RoleID
    WHERE 
        U.Email = @Email
        AND U.IsActive = 1
    GROUP BY 
        U.UserID, UP.FullName, U.Email, U.PasswordHash;
END;
GO