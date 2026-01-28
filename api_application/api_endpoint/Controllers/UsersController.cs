using StudenthubAPI.Data;
using StudenthubAPI.Models;
using StudenthubAPI.BO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using Microsoft.AspNetCore.Authorization;

namespace StudenthubAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly DataContext _dataContext;

        public UsersController(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        #region Get Operations

        /// <summary>
        /// Get all users with their roles
        /// </summary>
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _dataContext.Set<UserWithRole>()
                    .FromSqlRaw("EXEC sp_GetAllUsers")
                    .AsNoTracking()
                    .ToListAsync();

                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving users", error = ex.Message });
            }
        }

        /// <summary>
        /// Get a specific user by ID
        /// </summary>
        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            try
            {
                var user = await _dataContext.Set<UserWithRole>()
                    .FromSqlRaw("EXEC sp_GetUserById @UserID",
                        new SqlParameter("@UserID", id))
                    .AsNoTracking()
                    .FirstOrDefaultAsync();

                if (user == null)
                    return NotFound(new { message = "User not found" });

                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving user", error = ex.Message });
            }
        }

        #endregion

        #region Update Operations

        /// <summary>
        /// Update user profile information
        /// </summary>
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUserProfile(int id, [FromBody] UpdateUserBO updateUserBO)
        {
            try
            {
                var outputParameter = new SqlParameter("@Output", SqlDbType.NVarChar, 50)
                {
                    Direction = ParameterDirection.Output
                };

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "EXEC sp_UpdateUserProfile @UserID, @FullName, @Phone, @RoleName, @Output OUTPUT",
                    new SqlParameter("@UserID", id),
                    new SqlParameter("@FullName", (object)updateUserBO.FullName ?? DBNull.Value),
                    new SqlParameter("@Phone", (object)updateUserBO.Phone ?? DBNull.Value),
                    new SqlParameter("@RoleName", (object)updateUserBO.Role ?? DBNull.Value),
                    outputParameter);

                var result = outputParameter.Value?.ToString();

                if (result == "Success")
                {
                    return Ok(new { message = "User profile updated successfully" });
                }

                return BadRequest(new { message = "Failed to update user profile" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating user", error = ex.Message });
            }
        }

        /// <summary>
        /// Update user role
        /// </summary>
        [Authorize]
        [HttpPut("{id}/role")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateUserRoleBO updateRoleBO)
        {
            try
            {
                var outputParameter = new SqlParameter("@Output", SqlDbType.NVarChar, 50)
                {
                    Direction = ParameterDirection.Output
                };

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "EXEC sp_UpdateUserRole @UserID, @RoleName, @Output OUTPUT",
                    new SqlParameter("@UserID", id),
                    new SqlParameter("@RoleName", updateRoleBO.Role),
                    outputParameter);

                var result = outputParameter.Value?.ToString();

                if (result == "Success")
                {
                    return Ok(new { message = "User role updated successfully" });
                }

                if (result == "InvalidRole")
                    return BadRequest(new { message = "Invalid role name" });

                return BadRequest(new { message = "Failed to update user role" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating user role", error = ex.Message });
            }
        }

        #endregion
    }
}
