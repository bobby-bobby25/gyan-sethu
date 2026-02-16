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

namespace StudenthubAPI.Controllers
{
    /// <summary>
    /// Authentication endpoints for password reset and OTP management
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
        /// Generate and send OTP for password reset
        /// POST: /api/auth/send-reset-otp
        /// </summary>
        [HttpPost("send-reset-otp")]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<IActionResult> SendResetOtp([FromBody] SendResetOtpRequest request)
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

                var random = new Random();
                var otp = random.Next(100000, 999999).ToString();
                var expiresAt = DateTime.UtcNow.AddMinutes(15);

                var existingOtps = await _dataContext.VerificationOTPs
                    .Where(o => o.Email == request.Email)
                    .ToListAsync();

                foreach (var existingOtp in existingOtps)
                {
                    existingOtp.IsUsed = true;
                }

                var otpRecord = new VerificationOTP
                {
                    Email = request.Email,
                    OtpCode = otp,
                    ExpiresAt = expiresAt,
                    IsUsed = false,
                    CreatedAt = DateTime.UtcNow
                };

                _dataContext.VerificationOTPs.Add(otpRecord);
                await _dataContext.SaveChangesAsync();

                var userName = !string.IsNullOrWhiteSpace(user?.FullName)
                    ? user.FullName
                    : user?.Email ?? "User";

                var placeholders = new Dictionary<string, string>
                {
                    { "UserName", userName },
                    { "OTP", otp },
                    { "ExpiryMinutes", "15" },
                    { "Year", DateTime.Now.Year.ToString() }
                };

                var subject = "Password Reset OTP - GyanBridge";
                var template = "OTPTemplate";


                await SendEmailAsync(request.Email, subject, template, placeholders);

                return Ok(new
                {
                    success = true,
                    message = "OTP has been sent to your email address",
                    email = request.Email
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while processing your request" });
            }
        }

        [HttpPost("verify-reset-otp")]
        public async Task<IActionResult> VerifyResetOtp([FromBody] VerifyOTPRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request?.Email) || string.IsNullOrWhiteSpace(request?.Otp))
                {
                    return BadRequest(new { message = "Email and OTP are required" });
                }

                if (!System.Text.RegularExpressions.Regex.IsMatch(request.Otp, @"^\d{6}$"))
                {
                    return BadRequest(new { message = "OTP must be 6 digits" });
                }

                var otpRecord = await _dataContext.VerificationOTPs
                    .FirstOrDefaultAsync(o => o.Email == request.Email && o.OtpCode == request.Otp);

                if (otpRecord == null)
                {
                    return BadRequest(new { message = "Invalid or expired OTP" });
                }

                if (DateTime.UtcNow > otpRecord.ExpiresAt)
                {
                    return BadRequest(new { message = "OTP has expired" });
                }

                if (otpRecord.IsUsed)
                {
                    return BadRequest(new { message = "OTP has already been used" });
                }

                return Ok(new
                {
                    success = true,
                    message = "OTP verified successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while verifying OTP" });
            }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request?.Email) || 
                    string.IsNullOrWhiteSpace(request?.Otp) ||
                    string.IsNullOrWhiteSpace(request?.Password))
                {
                    return BadRequest(new { message = "Email, OTP, and password are required" });
                }

                var emailValidator = new EmailAddressAttribute();
                if (!emailValidator.IsValid(request.Email))
                {
                    return BadRequest(new { message = "Invalid email format" });
                }

                if (!System.Text.RegularExpressions.Regex.IsMatch(request.Otp, @"^\d{6}$"))
                {
                    return BadRequest(new { message = "OTP must be 6 digits" });
                }

                if (request.Password.Length < 8)
                {
                    return BadRequest(new { message = "Password must be at least 8 characters" });
                }

                var otpRecord = await _dataContext.VerificationOTPs
                    .FirstOrDefaultAsync(o => o.Email == request.Email && o.OtpCode == request.Otp);

                if (otpRecord == null)
                {
                    return BadRequest(new { message = "Invalid OTP" });
                }

                if (DateTime.UtcNow > otpRecord.ExpiresAt)
                {
                    return BadRequest(new { message = "OTP has expired" });
                }

                if (otpRecord.IsUsed)
                {
                    return BadRequest(new { message = "OTP has already been used" });
                }

                // Hash password with BCrypt
                string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

                // Call stored procedure to update password
                await _dataContext.Database.ExecuteSqlRawAsync(
                    "EXEC spUpdatePasswordOnReset @Email, @OtpCode, @PasswordHash",
                    new SqlParameter("@Email", request.Email),
                    new SqlParameter("@OtpCode", request.Otp),
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

        [HttpPost]
        public async Task SendResetPasswordEmailAsync(
            string email,
            string resetLink,
            string expiryMinutes = "30")
        {
            try
            {
                var placeholders = new Dictionary<string, string>
                {
                    { "UserEmail", email },
                    { "ResetLink", resetLink },
                    { "ExpiryMinutes", expiryMinutes },
                    { "Year", DateTime.Now.Year.ToString() }
                };

                var subject = "Reset Your Password - GyanBridge";
                await SendEmailAsync(email, subject, "ResetPasswordTemplate", placeholders);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending reset password email: {ex.Message}");
            }
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
                return $"<p>Your OTP is: <strong>{placeholders["OTP"]}</strong></p><p>This OTP expires in {placeholders["ExpiryMinutes"]} minutes.</p>";
            }
        }
    }
}
