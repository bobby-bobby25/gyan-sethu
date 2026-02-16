IF EXISTS(SELECT 1 FROM SYS.PROCEDURES WHERE NAME='spCMNStudentHub_RegisterUser')
DROP PROCEDURE spCMNStudentHub_RegisterUser
GO
CREATE PROCEDURE spCMNStudentHub_RegisterUser
(
    @Email NVARCHAR(255),
    @PasswordHash NVARCHAR(255),
	@RoleId INT,
    @FullName NVARCHAR(150) = NULL,
    @Output NVARCHAR(50) OUTPUT
)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF EXISTS (SELECT 1 FROM Users WHERE Email = @Email)
        BEGIN
            SET @Output = 'UserExists';
            ROLLBACK;
            RETURN;
        END

        INSERT INTO Users (Email, PasswordHash)
        VALUES (@Email, @PasswordHash);

        DECLARE @UserId INT = SCOPE_IDENTITY();

        -- Profile
        INSERT INTO UserProfiles (UserID, FullName)
        VALUES (@UserId, ISNULL(@FullName, @Email));

        INSERT INTO UserRoles (UserID, RoleID)
        VALUES (@UserId, @RoleId);

        COMMIT;

        SET @Output = 'Success';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        SET @Output = 'Error';
    END CATCH
END;
GO
