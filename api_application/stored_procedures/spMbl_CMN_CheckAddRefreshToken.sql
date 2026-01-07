IF EXISTS(SELECT 1 FROM SYS.PROCEDURES WHERE NAME='spMbl_CMN_CheckAddRefreshToken')
DROP PROCEDURE spMbl_CMN_CheckAddRefreshToken
GO
/*****************************************************  
NAME			=>	[spMbl_CMN_CheckAddRefreshToken]
CREATED BY		=>	
CREATED ON		=>  
MODIFIED BY		=>  
MODIFIED ON		=>  

DECLARE @Output VARCHAR(100)
EXEC spMbl_CMN_CheckAddRefreshToken 'B39tr6iN46NE15FZiwLy9kMu1F6s4k9UfcRuOEImnv2ra3tQldJbjkgSgJzf+e1jMx+bBEyNfBVPSi3rD32Ndw==',377, '08-12-2025 15:26:28', 'CHECK', @Output OUTPUT
SELECT @Output
*****************************************************/
CREATE PROCEDURE spMbl_CMN_CheckAddRefreshToken
(
@RefreshToken	    NVARCHAR(200),
@LoginID			INT,
@RefreshExpiry		DATETIME NULL,
@Type				VARCHAR(100),
@Output				VARCHAR(100) OUTPUT
)	
AS
BEGIN
	BEGIN TRY  
	  BEGIN TRANSACTION
		SET NOCOUNT ON 
		SET XACT_ABORT ON 
		IF(@Type = 'CHECK')
		BEGIN
			IF EXISTS(SELECT 1 FROM Mbl_CMN_RefreshTokenDtls WITH(NOLOCK) WHERE Token = @RefreshToken AND UserId = @LoginID 
					  AND Expires > GETDATE() AND CAST(ISNULL(Revoked,0) AS BIT) <> CAST(1 AS BIT))
				SET @Output = 'Token_Valid'
			ELSE
				SET @Output = 'Invalid'
		END
		ELSE
		BEGIN
			IF EXISTS(SELECT 1 FROM Mbl_CMN_RefreshTokenDtls WITH(NOLOCK) WHERE UserId = @LoginID)
				BEGIN
					UPDATE Mbl_CMN_RefreshTokenDtls 
						SET Token = @RefreshToken,
						Expires = @RefreshExpiry
						WHERE UserId = @LoginID;
					SET @Output = 'Successfully Updated'
				END
			ELSE
				BEGIN
					INSERT INTO Mbl_CMN_RefreshTokenDtls(UserId, Token, Expires, Created)
					VALUES (@LoginID, @RefreshToken, @RefreshExpiry, GETDATE());
					SET @Output = 'Successfully Inserted'
				END
		END
		SELECT @Output
	 COMMIT TRANSACTION
	END TRY  
	BEGIN CATCH
		ROLLBACK TRANSACTION         
		DECLARE @ErrorMsg VARCHAR(100), @ErrSeverity INT, @ERRORLINE VARCHAR(200)  
		SELECT @ErrorMsg = ERROR_MESSAGE(), @ErrSeverity = ERROR_SEVERITY(), @ERRORLINE = ERROR_LINE(); 					
		INSERT INTO CMN_Exception (SPName, ErrorDesc, CreatedDate, CreatedBy) 
		VALUES(OBJECT_NAME(@@PROCID), @ErrorMsg, GETDATE(), 1) 
		RAISERROR (@ErrorMsg, @ErrSeverity, @ERRORLINE) ; 
	END CATCH 
END				

