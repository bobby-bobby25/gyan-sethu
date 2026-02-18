using Microsoft.AspNetCore.Mvc;
using StudenthubAPI.Data;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using StudenthubAPI.BO;
using System.Net.Mail;
using System.Net;
using IOFile = System.IO.File;
using Microsoft.Data.SqlClient;
using StudenthubAPI.Models;
using Microsoft.Extensions.Configuration;

namespace StudenthubAPI.Controllers
{
    /// <summary>
    /// Authentication endpoints for password reset and token management
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly DataContext _dataContext;

        public AuthController(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        /// <summary>
        /// Send password reset link via email
        /// POST: /api/auth/send-reset-link
        /// </summary>
        [HttpPost("send-reset-link")]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<IActionResult> SendResetLink([FromBody] SendResetLinkRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request?.Email))
                {
                    return BadRequest(new { message = "Email is required" });
                }

                var emailValidator = new EmailAddressAttribute();
                if (!emailValidator.IsValid(request.Email))
                {
                    return BadRequest(new { message = "Invalid email format" });
                }

                var user = _dataContext.Set<UserWithRole>().FromSqlRaw("EXEC sp_GetUserByEmail @Email",
                                    new SqlParameter("@Email", request.Email))
                                .AsNoTracking()
                                .AsEnumerable()
                                .FirstOrDefault();

                if (user == null)
                {
                    return BadRequest(new { message = "Unable to process request. Please check the email address." });
                }

                var _settings = _dataContext.emailSettings;

                // Generate UUID token
                var token = Guid.NewGuid().ToString();
                var expiresAt = DateTime.UtcNow.AddMinutes(_settings.OtpExpiryMinutes);

                var existingTokens = await _dataContext.PasswordResetTokens
                    .Where(t => t.Email == request.Email)
                    .ToListAsync();

                foreach (var existingToken in existingTokens)
                {
                    existingToken.IsUsed = true;
                }

                var resetToken = new PasswordResetToken
                {
                    Email = request.Email,
                    Token = token,
                    ExpiresAt = expiresAt,
                    IsUsed = false,
                    CreatedAt = DateTime.UtcNow
                };

                _dataContext.PasswordResetTokens.Add(resetToken);
                await _dataContext.SaveChangesAsync();

                var userName = !string.IsNullOrWhiteSpace(user?.FullName)
                    ? user.FullName
                    : user?.Email ?? "User";


                // Generate reset link
                var resetLink = $"{_dataContext.jwtAudience}/reset-password?token={token}&email={Uri.EscapeDataString(request.Email)}";
                var expiryMinutes = _settings.OtpExpiryMinutes.ToString();

                var placeholders = new Dictionary<string, string>
                {
                    { "UserName", userName },
                    { "ResetLink", resetLink },
                    { "ExpiryMinutes", expiryMinutes },
                    { "Year", DateTime.Now.Year.ToString() }
                };

                var subject = "Reset Your Password - GyanBridge";
                var template = "ResetPasswordTemplate";

                await SendEmailAsync(request.Email, subject, template, placeholders);

                return Ok(new
                {
                    success = true,
                    message = "Password reset link has been sent to your email address",
                    email = request.Email
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while processing your request" });
            }
        }

        /// <summary>
        /// Validate password reset token
        /// POST: /api/auth/validate-reset-token
        /// </summary>
        [HttpPost("validate-reset-token")]
        public async Task<IActionResult> ValidateResetToken([FromBody] ValidateResetTokenRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request?.Email) || string.IsNullOrWhiteSpace(request?.Token))
                {
                    return BadRequest(new { message = "Email and token are required" });
                }

                var resetToken = await _dataContext.PasswordResetTokens
                    .FirstOrDefaultAsync(t => t.Email == request.Email && t.Token == request.Token);

                if (resetToken == null)
                {
                    return BadRequest(new { message = "Invalid reset link" });
                }

                if (DateTime.UtcNow > resetToken.ExpiresAt)
                {
                    return BadRequest(new { message = "Password reset link has expired" });
                }

                if (resetToken.IsUsed)
                {
                    return BadRequest(new { message = "Password reset link has already been used" });
                }

                return Ok(new
                {
                    success = true,
                    message = "Reset token is valid"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while validating the reset link" });
            }
        }

        /// <summary>
        /// Reset password with valid token
        /// POST: /api/auth/reset-password
        /// </summary>
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordWithTokenRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request?.Email) || 
                    string.IsNullOrWhiteSpace(request?.Token) ||
                    string.IsNullOrWhiteSpace(request?.Password))
                {
                    return BadRequest(new { message = "Email, token, and password are required" });
                }

                var emailValidator = new EmailAddressAttribute();
                if (!emailValidator.IsValid(request.Email))
                {
                    return BadRequest(new { message = "Invalid email format" });
                }

                if (request.Password.Length < 8)
                {
                    return BadRequest(new { message = "Password must be at least 8 characters" });
                }

                var resetToken = await _dataContext.PasswordResetTokens
                    .FirstOrDefaultAsync(t => t.Email == request.Email && t.Token == request.Token);

                if (resetToken == null)
                {
                    return BadRequest(new { message = "Invalid reset link" });
                }

                if (DateTime.UtcNow > resetToken.ExpiresAt)
                {
                    return BadRequest(new { message = "Password reset link has expired" });
                }

                if (resetToken.IsUsed)
                {
                    return BadRequest(new { message = "Password reset link has already been used" });
                }

                // Hash password with BCrypt
                string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

                // Call stored procedure to update password
                await _dataContext.Database.ExecuteSqlRawAsync(
                    "EXEC spResetPasswordWithToken @Email, @Token, @PasswordHash",
                    new SqlParameter("@Email", request.Email),
                    new SqlParameter("@Token", request.Token),
                    new SqlParameter("@PasswordHash", passwordHash)
                );

                return Ok(new
                {
                    success = true,
                    message = "Password reset successfully. Please login with your new password."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while resetting password" });
            }
        }

        private async Task SendEmailAsync(
            string toEmail,
            string subject,
            string templateName,
            Dictionary<string, string> placeholders)
        {
            var body = await LoadTemplateAsync(templateName, placeholders);
            var _settings = _dataContext.emailSettings;

            var message = new MailMessage
            {
                From = new MailAddress(_settings.SenderEmail, _settings.SenderName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            message.To.Add(toEmail);

            using var client = new SmtpClient(_settings.SmtpServer, _settings.Port)
            {
                Credentials = new NetworkCredential(
                    _settings.Username,
                    _settings.Password),
                EnableSsl = true
            };

            await client.SendMailAsync(message);
        }

        private async Task<string> LoadTemplateAsync(string templateName, Dictionary<string, string> placeholders)
        {
            try
            {
                var path = Path.Combine(
                    _dataContext.templatePath,
                    "EmailTemplates",
                    $"{templateName}.html"
                );

                var template = await IOFile.ReadAllTextAsync(path);

                foreach (var item in placeholders)
                {
                    template = template.Replace(
                        $"{{{{{item.Key}}}}}",
                        item.Value ?? string.Empty);
                }

                return template;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading template: {ex.Message}");
                return $"<p>Click the link below to reset your password:</p><p><a href='{placeholders["ResetLink"]}'>Reset Password</a></p><p>This link expires in {placeholders["ExpiryMinutes"]} minutes.</p>";
            }
        }
    }
}
