using StudenthubAPI.Data;
using StudenthubAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Text;
using System.Security.Cryptography;
using System.Net;
using Newtonsoft.Json;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;
using StudenthubAPI.Data;
using StudenthubAPI.BO;
using Newtonsoft.Json.Linq;
using BCrypt.Net;
using Microsoft.AspNetCore.SignalR;

namespace StudenthubAPI.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class LoginController : ControllerBase
    {
        private readonly DataContext _dataContext;

        public LoginController(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        #region Login
        [HttpPost("CheckLoginDetails")]
        public async Task<IActionResult> CheckLoginDetails([FromBody] LoginBO parameters)
        {
            try
            {
                var loginDetails = await _dataContext.CheckLoginDetails.FromSqlRaw("EXEC spCMNStudentHub_GetLoginDetails @Email",
                        new SqlParameter("@Email", parameters.UserName))
                    .AsNoTracking()
                    .ToListAsync();

                if (loginDetails == null || loginDetails.Count == 0)
                    return Unauthorized("Invalid username or password");

                var user = loginDetails.First();

                bool isPasswordValid = BCrypt.Net.BCrypt.Verify(
                    parameters.Password,
                    user.PasswordHash
                );

                if (!isPasswordValid)
                    return Unauthorized("Invalid username or password");

                var tokens = GenerateToken(user.Email, user.UserID, new[] { user.Role });

                var response = new LoginUserDetailsWithJWT
                {
                    AccessToken = tokens.AccessToken,
                    RefreshToken = tokens.RefreshToken,
                    ExpiresIn = tokens.ExpiresIn,
                    User = new UserDetails
                    {
                        Id = user.UserID,
                        FullName = user.FullName,
                        Email = user.Email,
                        Role = user.Role.ToLower()
                    },
                    UserProfile = new UserProfile()
                    {
                        id = user.UserID,
                        email = user.Email,
                        full_name = user.FullName
                    }
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An unexpected error occurred");
            }
        }

        [HttpPost("CheckRefreshToken")]
        public ActionResult<IEnumerable<LoginUserDetailsWithJWT>> CheckRefreshToken([FromBody] RefreshTokenParameters parameters)
        {
            try
            {
                var outputParameter = new SqlParameter("@OutPut", SqlDbType.NVarChar, 255)
                {
                    Direction = ParameterDirection.Output
                };

                var refTokenDtls = _dataContext.CheckRefreshToken.FromSqlRaw("EXEC spMbl_CMN_CheckAddRefreshToken @RefreshToken, @LoginID, @RefreshExpiry, @Type, @Output OUTPUT",
                                        new SqlParameter("@RefreshToken", parameters.RefreshToken),
                                        new SqlParameter("@LoginID", parameters.LoginId),
                                        new SqlParameter("@RefreshExpiry", parameters.RefreshExpiry ?? (object)DBNull.Value),
                                        new SqlParameter("@Type", parameters.Type),
                                        outputParameter
                                    ).ToList();

                var refreshTokenResult = new CommonOutput
                {
                    OutPut = Convert.ToString(refTokenDtls[0].OutPut)
                };

                if (refreshTokenResult.OutPut == "Token_Valid")
                {
                    var Tokens = GenerateToken(parameters.Username, 1, new[] { parameters.Role }, parameters.RefreshToken);
                    var finalResult = new LoginUserDetailsWithJWT
                    {
                        AccessToken = Tokens.AccessToken,
                        RefreshToken = Tokens.RefreshToken,
                        ExpiresIn = 0,
                        User = new UserDetails
                        {
                            Id = 0,
                            Email = "",
                            Role = ""
                        }
                    };

                    return Ok(finalResult);
                }
                else
                {
                    return Ok(new LoginUserDetailsWithJWT { });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        public static string EncryptPassword(string password)
        {
            var hasher = new SHA384CryptoServiceProvider();
            var textWithSaltBytes = Encoding.UTF8.GetBytes(string.Concat(password, "16characterslong"));
            var hashedBytes = hasher.ComputeHash(textWithSaltBytes);
            hasher.Clear();
            return Convert.ToBase64String(hashedBytes);
        }

        //JWT Generator
        private (string AccessToken, string RefreshToken, int ExpiresIn) GenerateToken(string email, int? empId, IEnumerable<string> roles = null, string existingRefreshToken = null)
        {
            if (string.IsNullOrWhiteSpace(_dataContext.jwtKey))
                throw new Exception("JWT Key is missing. Please configure 'jwtKey' in settings.");

            if (string.IsNullOrWhiteSpace(_dataContext.jwtIssuer))
                throw new Exception("JWT Issuer is missing.");

            if (string.IsNullOrWhiteSpace(_dataContext.jwtAudience))
                throw new Exception("JWT Audience is missing.");

            if (_dataContext.jwtExpMin <= 0)
                throw new Exception("JWT ExpiryMinutes must be greater than 0.");

            // ACCESS TOKEN
            var key = Encoding.UTF8.GetBytes(_dataContext.jwtKey);
            var expiresInSeconds = _dataContext.jwtExpMin * 60;

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, empId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            if (roles != null)
                claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

            var token = new JwtSecurityToken(
                issuer: _dataContext.jwtIssuer,
                audience: _dataContext.jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(Convert.ToDouble(_dataContext.jwtExpMin)),
                signingCredentials: new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256)
            );

            string accessToken = new JwtSecurityTokenHandler().WriteToken(token);

            // REFRESH TOKEN (existing or new)
            string refreshToken = existingRefreshToken ?? GenerateRefreshToken();
            var type = "Add";
            var refreshExpiry = DateTime.UtcNow.AddDays(Convert.ToDouble(_dataContext.refTokExp));

            var outputParameter = new SqlParameter("@Output", SqlDbType.NVarChar, 255)
            {
                Direction = ParameterDirection.Output
            };

            var refTokenDtls = _dataContext.CheckRefreshToken.FromSqlRaw("EXEC spMbl_CMN_CheckAddRefreshToken @RefreshToken, @LoginID, @RefreshExpiry, @Type, @Output OUTPUT",
                                    new SqlParameter("@RefreshToken", refreshToken),
                                    new SqlParameter("@LoginID", empId),
                                    new SqlParameter("@RefreshExpiry", refreshExpiry.ToString("yyyy-MM-dd HH:mm:ss")),
                                    new SqlParameter("@Type", type),
                                    outputParameter
                                ).ToList();

            var refreshTokenResult = new CommonOutput
            {
                OutPut = Convert.ToString(refTokenDtls[0].OutPut)
            };

            return (accessToken, refreshToken, expiresInSeconds);
        }

        private string GenerateRefreshToken()
        {
            var randomBytes = new byte[64];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomBytes);
                return Convert.ToBase64String(randomBytes);
            }
        }

        #endregion

        #region Register

        [HttpPost("Register")]
        public async Task<IActionResult> Register([FromBody] RegisterUserBO model)
        {
            try
            {
                string passwordHash = BCrypt.Net.BCrypt.HashPassword(model.Password);

                var outputParam = new SqlParameter("@Output", SqlDbType.NVarChar, 50)
                {
                    Direction = ParameterDirection.Output
                };

                await _dataContext.Database.ExecuteSqlRawAsync("EXEC spCMNStudentHub_RegisterUser @Email, @PasswordHash, @RoleId, @FullName, @Output OUTPUT",
                    new SqlParameter("@Email", model.Email),
                    new SqlParameter("@PasswordHash", passwordHash),
                    new SqlParameter("@RoleId", model.Role),
                    new SqlParameter("@FullName", model.FullName),
                    outputParam
                );

                string result = outputParam.Value?.ToString();

                if (result == "UserExists")
                    return Conflict("User already exists");

                return Ok("User registered successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        #endregion
    }
}
