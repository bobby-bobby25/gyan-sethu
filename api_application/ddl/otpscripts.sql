-- =============================================
-- Password Reset Token Management Scripts
-- =============================================

-- Create PasswordResetTokens Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PasswordResetTokens]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[PasswordResetTokens] (
        [Id] INT PRIMARY KEY IDENTITY(1,1),
        [Email] NVARCHAR(255) NOT NULL,
        [Token] NVARCHAR(MAX) NOT NULL,
        [ExpiresAt] DATETIME NOT NULL,
        [IsUsed] BIT NOT NULL DEFAULT 0,
        [CreatedAt] DATETIME NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_PasswordResetTokens_Email FOREIGN KEY ([Email]) 
            REFERENCES [dbo].[Users]([Email]) ON DELETE CASCADE
    );
    
    -- Create indexes for better query performance
    CREATE INDEX IX_PasswordResetTokens_Email ON [dbo].[PasswordResetTokens]([Email]);
    CREATE INDEX IX_PasswordResetTokens_ExpiresAt ON [dbo].[PasswordResetTokens]([ExpiresAt]);
END
GO


-- =============================================
-- SP: Generate Password Reset Token
-- =============================================
-- Description: Generate a password reset token and send reset link
-- Parameters: 
--   @Email: Email address of user requesting reset
-- Returns: Generated token
-- =============================================
CREATE OR ALTER PROCEDURE [dbo].[spGeneratePasswordResetToken]
    @Email NVARCHAR(256)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Validate email exists in Users table
        IF NOT EXISTS (SELECT 1 FROM [dbo].[Users] WHERE [Email] = @Email)
        BEGIN
            RAISERROR('User not found', 16, 1);
            RETURN;
        END
        
        -- Mark previous tokens as used
        UPDATE [dbo].[PasswordResetTokens]
        SET [IsUsed] = 1
        WHERE [Email] = @Email AND [IsUsed] = 0;
        
        -- Generate UUID token
        DECLARE @Token NVARCHAR(MAX) = CONVERT(NVARCHAR(MAX), NEWID());
        
        -- Set expiry (will be consumed in C# based on app settings)
        DECLARE @ExpiresAt DATETIME = DATEADD(MINUTE, 30, GETUTCDATE());
        
        -- Insert new token
        INSERT INTO [dbo].[PasswordResetTokens] 
            ([Email], [Token], [ExpiresAt], [IsUsed], [CreatedAt])
        VALUES 
            (@Email, @Token, @ExpiresAt, 0, GETUTCDATE());
        
        -- Return the token
        SELECT @Token AS Token;
        
    END TRY
    BEGIN CATCH
        RAISERROR('Error generating password reset token', 16, 1);
    END CATCH
END
GO

-- =============================================
-- SP: Validate Password Reset Token
-- =============================================
-- Description: Verify token validity, expiry, and usage
-- Parameters:
--   @Email: Email address of user
--   @Token: Token to verify
-- Returns: 1 if valid, 0 if invalid
-- =============================================
CREATE OR ALTER PROCEDURE [dbo].[spValidatePasswordResetToken]
    @Email NVARCHAR(256),
    @Token NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Check if token exists, not used, and not expired
        IF EXISTS (
            SELECT 1 FROM [dbo].[PasswordResetTokens]
            WHERE [Email] = @Email 
              AND [Token] = @Token 
              AND [IsUsed] = 0 
              AND [ExpiresAt] > GETUTCDATE()
        )
        BEGIN
            SELECT 1 AS IsValid;
            RETURN;
        END
        
        SELECT 0 AS IsValid;
        
    END TRY
    BEGIN CATCH
        RAISERROR('Error validating password reset token', 16, 1);
    END CATCH
END
GO

-- =============================================
-- SP: Reset Password with Token
-- =============================================
-- Description: Update user password after token verification
-- Parameters:
--   @Email: Email address of user
--   @Token: Reset token
--   @PasswordHash: New password hash (BCrypt hashed from backend)
-- Returns: Success message or error
-- =============================================
CREATE OR ALTER PROCEDURE [dbo].[spResetPasswordWithToken]
    @Email NVARCHAR(256),
    @Token NVARCHAR(MAX),
    @PasswordHash NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Verify token is valid
        IF NOT EXISTS (
            SELECT 1 FROM [dbo].[PasswordResetTokens]
            WHERE [Email] = @Email 
              AND [Token] = @Token 
              AND [IsUsed] = 0 
              AND [ExpiresAt] > GETUTCDATE()
        )
        BEGIN
            RAISERROR('Invalid or expired password reset link', 16, 1);
            RETURN;
        END
        
        -- Update user password
        UPDATE [dbo].[Users]
        SET [PasswordHash] = @PasswordHash,
            [UpdatedAt] = GETUTCDATE()
        WHERE [Email] = @Email;
        
        -- Check if update was successful
        IF @@ROWCOUNT = 0
        BEGIN
            RAISERROR('User not found', 16, 1);
            RETURN;
        END
        
        -- Mark token as used
        UPDATE [dbo].[PasswordResetTokens]
        SET [IsUsed] = 1
        WHERE [Email] = @Email AND [Token] = @Token;
        
        -- Clean up old expired tokens (older than 24 hours)
        DELETE FROM [dbo].[PasswordResetTokens]
        WHERE [CreatedAt] < DATEADD(DAY, -1, GETUTCDATE());
        
        SELECT 'Password updated successfully' AS Message;
        
    END TRY
    BEGIN CATCH
        RAISERROR('Error updating password', 16, 1);
    END CATCH
END
GO
