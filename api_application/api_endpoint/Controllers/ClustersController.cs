using StudenthubAPI.Data;
using StudenthubAPI.Models;
using StudenthubAPI.BO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace StudenthubAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClustersController : ControllerBase
    {
        private readonly DataContext _dataContext;

        public ClustersController(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        #region Get Operations

        /// <summary>
        /// Get all clusters
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllClusters([FromQuery] bool isActive = true)
        {
            try
            {
                var clusters = await _dataContext.Set<ClusterBO>()
                    .FromSqlRaw("EXEC sp_GetAllClusters @IsActive",
                        new SqlParameter("@IsActive", isActive))
                    .AsNoTracking()
                    .ToListAsync();

                return Ok(clusters);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving clusters", error = ex.Message });
            }
        }

        /// <summary>
        /// Get a specific cluster by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetClusterById(int id)
        {
            try
            {
                var cluster = await _dataContext.Set<ClusterBO>()
                    .FromSqlRaw("EXEC sp_GetClusterById @ClusterID",
                        new SqlParameter("@ClusterID", id))
                    .AsNoTracking()
                    .FirstOrDefaultAsync();

                if (cluster == null)
                    return NotFound(new { message = "Cluster not found" });

                return Ok(cluster);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving cluster", error = ex.Message });
            }
        }

        /// <summary>
        /// Get cluster statistics (students and teachers count)
        /// </summary>
        [HttpGet("Stats")]
        public async Task<IActionResult> GetClusterStats()
        {
            try
            {
                var clusters = await GetAllClusters();
                return clusters;
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving cluster statistics", error = ex.Message });
            }
        }

        #endregion

        #region Create Operation

        /// <summary>
        /// Create a new cluster
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateCluster([FromBody] CreateClusterBO createClusterBO)
        {
            try
            {
                var outputParameter = new SqlParameter("@Output", SqlDbType.NVarChar, 50)
                {
                    Direction = ParameterDirection.Output
                };

                var clusterIdParameter = new SqlParameter("@ClusterID", SqlDbType.Int)
                {
                    Direction = ParameterDirection.Output
                };

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "EXEC sp_InsertCluster @Name, @Address, @City, @State, " +
                    "@Latitude, @Longitude, @GeoRadiusMeters, @Output OUTPUT",
                    new SqlParameter("@Name", createClusterBO.Name),
                    new SqlParameter("@Address", (object)createClusterBO.Address ?? DBNull.Value),
                    new SqlParameter("@City", (object)createClusterBO.City ?? DBNull.Value),
                    new SqlParameter("@State", (object)createClusterBO.State ?? DBNull.Value),
                    new SqlParameter("@Latitude", (object)createClusterBO.Latitude ?? DBNull.Value),
                    new SqlParameter("@Longitude", (object)createClusterBO.Longitude ?? DBNull.Value),
                    new SqlParameter("@GeoRadiusMeters", (object)createClusterBO.GeoRadiusMeters ?? 200),
                    outputParameter);

                var result = outputParameter.Value?.ToString();

                if (result == "Success")
                {
                    return CreatedAtAction(nameof(GetClusterById), new { id = clusterIdParameter.Value },
                        new { message = "Cluster created successfully", clusterId = clusterIdParameter.Value });
                }

                return BadRequest(new { message = "Failed to create cluster" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating cluster", error = ex.Message });
            }
        }

        #endregion

        #region Update Operation

        /// <summary>
        /// Update an existing cluster
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCluster(int id, [FromBody] UpdateClusterBO updateClusterBO)
        {
            try
            {
                var outputParameter = new SqlParameter("@Output", SqlDbType.NVarChar, 50)
                {
                    Direction = ParameterDirection.Output
                };

                await _dataContext.Database.ExecuteSqlRawAsync(
                    "EXEC sp_UpdateCluster @ClusterID, @Name, @Address, @City, @State, " +
                    "@Latitude, @Longitude, @GeoRadiusMeters, @Output OUTPUT",
                    new SqlParameter("@ClusterID", id),
                    new SqlParameter("@Name", (object)updateClusterBO.Name ?? DBNull.Value),
                    new SqlParameter("@Address", (object)updateClusterBO.Address ?? DBNull.Value),
                    new SqlParameter("@City", (object)updateClusterBO.City ?? DBNull.Value),
                    new SqlParameter("@State", (object)updateClusterBO.State ?? DBNull.Value),
                    new SqlParameter("@Latitude", (object)updateClusterBO.Latitude ?? DBNull.Value),
                    new SqlParameter("@Longitude", (object)updateClusterBO.Longitude ?? DBNull.Value),
                    new SqlParameter("@GeoRadiusMeters", (object)updateClusterBO.GeoRadiusMeters ?? DBNull.Value),
                    outputParameter);

                var result = outputParameter.Value?.ToString();

                if (result == "Success")
                {
                    return Ok(new { message = "Cluster updated successfully" });
                }

                return BadRequest(new { message = "Failed to update cluster" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating cluster", error = ex.Message });
            }
        }

        #endregion
    }
}
