-- =============================================
-- OTP Verification Management Scripts
-- =============================================

-- Create VerificationOTPs Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[VerificationOTPs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[VerificationOTPs] (
        [Id] INT PRIMARY KEY IDENTITY(1,1),
        [Email] NVARCHAR(255) NOT NULL,
        [OtpCode] NVARCHAR(10) NOT NULL,
        [ExpiresAt] DATETIME NOT NULL,
        [IsUsed] BIT NOT NULL DEFAULT 0,
        [CreatedAt] DATETIME NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_VerificationOTPs_Email FOREIGN KEY ([Email]) 
            REFERENCES [dbo].[Users]([Email]) ON DELETE CASCADE
    );
    
    -- Create indexes for better query performance
    CREATE INDEX IX_VerificationOTPs_Email ON [dbo].[VerificationOTPs]([Email]);
    CREATE INDEX IX_VerificationOTPs_ExpiresAt ON [dbo].[VerificationOTPs]([ExpiresAt]);
END
GO

-- =============================================
-- SP: Generate OTP
-- =============================================
-- Description: Generate a new OTP for password reset
-- Parameters: 
--   @Email: Email address of user requesting reset
-- Returns: Generated OTP code
-- =============================================
CREATE OR ALTER PROCEDURE [dbo].[spGenerateOTP]
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
        
        -- Mark previous OTPs as used
        UPDATE [dbo].[VerificationOTPs]
        SET [IsUsed] = 1
        WHERE [Email] = @Email AND [IsUsed] = 0;
        
        -- Generate 6-digit random OTP
        DECLARE @OtpCode NVARCHAR(10) = 
            CAST(CAST(RAND() * 999999 AS INT) AS NVARCHAR(10));
        
        -- Pad with leading zeros if needed
        WHILE LEN(@OtpCode) < 6
            SET @OtpCode = '0' + @OtpCode;
        
        -- Set expiry to 15 minutes from now
        DECLARE @ExpiresAt DATETIME = DATEADD(MINUTE, 15, GETUTCDATE());
        
        -- Insert new OTP
        INSERT INTO [dbo].[VerificationOTPs] 
            ([Email], [OtpCode], [ExpiresAt], [IsUsed], [CreatedAt])
        VALUES 
            (@Email, @OtpCode, @ExpiresAt, 0, GETUTCDATE());
        
        -- Return the OTP
        SELECT @OtpCode AS OtpCode;
        
    END TRY
    BEGIN CATCH
        RAISERROR('Error generating OTP', 16, 1);
    END CATCH
END
GO

-- =============================================
-- SP: Verify OTP
-- =============================================
-- Description: Verify OTP validity, expiry, and usage
-- Parameters:
--   @Email: Email address of user
--   @OtpCode: OTP code to verify
-- Returns: 1 if valid, 0 if invalid
-- =============================================
CREATE OR ALTER PROCEDURE [dbo].[spVerifyOTP]
    @Email NVARCHAR(256),
    @OtpCode NVARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Check if OTP exists, not used, and not expired
        IF EXISTS (
            SELECT 1 FROM [dbo].[VerificationOTPs]
            WHERE [Email] = @Email 
              AND [OtpCode] = @OtpCode 
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
        RAISERROR('Error verifying OTP', 16, 1);
    END CATCH
END
GO

-- =============================================
-- SP: Reset Password
-- =============================================
-- Description: Update user password after OTP verification
-- Parameters:
--   @Email: Email address of user
--   @OtpCode: OTP code for verification
--   @PasswordHash: New password hash (BCrypt hashed from backend)
-- Returns: 1 if successful, 0 if failed
-- =============================================
CREATE OR ALTER PROCEDURE [dbo].[spResetPassword]
    @Email NVARCHAR(256),
    @OtpCode NVARCHAR(10),
    @PasswordHash NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Verify OTP is valid
        IF NOT EXISTS (
            SELECT 1 FROM [dbo].[VerificationOTPs]
            WHERE [Email] = @Email 
              AND [OtpCode] = @OtpCode 
              AND [IsUsed] = 0 
              AND [ExpiresAt] > GETUTCDATE()
        )
        BEGIN
            RAISERROR('Invalid or expired OTP', 16, 1);
            RETURN;
        END
        
        -- Update user password
        UPDATE [dbo].[Users]
        SET [PasswordHash] = @PasswordHash,
            [UpdatedAt] = GETUTCDATE()
        WHERE [Email] = @Email;
        
        -- Mark OTP as used
        UPDATE [dbo].[VerificationOTPs]
        SET [IsUsed] = 1
        WHERE [Email] = @Email AND [OtpCode] = @OtpCode;
        
        -- Clean up old expired OTPs (older than 24 hours)
        DELETE FROM [dbo].[VerificationOTPs]
        WHERE [CreatedAt] < DATEADD(DAY, -1, GETUTCDATE());
        
        SELECT 1 AS IsSuccess;
        
    END TRY
    BEGIN CATCH
        RAISERROR('Error resetting password', 16, 1);
    END CATCH
END
GO

-- =============================================
-- SP: Update Password on Password Reset
-- =============================================
-- Description: Update user password and mark OTP as used
-- Parameters:
--   @Email: Email address of user
--   @OtpCode: OTP code for verification
--   @PasswordHash: New password hash (BCrypt hashed from backend)
-- Returns: Success message or error
-- =============================================
CREATE OR ALTER PROCEDURE [dbo].[spUpdatePasswordOnReset]
    @Email NVARCHAR(256),
    @OtpCode NVARCHAR(10),
    @PasswordHash NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Verify OTP is valid
        IF NOT EXISTS (
            SELECT 1 FROM [dbo].[VerificationOTPs]
            WHERE [Email] = @Email 
              AND [OtpCode] = @OtpCode 
              AND [IsUsed] = 0 
              AND [ExpiresAt] > GETUTCDATE()
        )
        BEGIN
            RAISERROR('Invalid or expired OTP', 16, 1);
            RETURN;
        END
        
        -- Update user password
        UPDATE [dbo].[Users]
        SET [PasswordHash] = @PasswordHash,
            [UpdatedAt] = GETUTCDATE()
        WHERE [Email] = @Email OR [Email] = @Email;
        
        -- Check if update was successful
        IF @@ROWCOUNT = 0
        BEGIN
            RAISERROR('User not found', 16, 1);
            RETURN;
        END
        
        -- Mark OTP as used
        UPDATE [dbo].[VerificationOTPs]
        SET [IsUsed] = 1
        WHERE [Email] = @Email AND [OtpCode] = @OtpCode;
        
        -- Clean up old expired OTPs (older than 24 hours)
        DELETE FROM [dbo].[VerificationOTPs]
        WHERE [CreatedAt] < DATEADD(DAY, -1, GETUTCDATE());
        
        SELECT 'Password updated successfully' AS Message;
        
    END TRY
    BEGIN CATCH
        RAISERROR('Error updating password', 16, 1);
    END CATCH
END
GO