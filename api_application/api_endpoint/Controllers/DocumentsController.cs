using StudenthubAPI.Data;
using StudenthubAPI.Models;
using StudenthubAPI.BO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.IO;
using System.Collections.Generic;
using System.Reflection.Metadata;
using System.Data;
using Microsoft.AspNetCore.Authorization;

namespace StudenthubAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentsController : ControllerBase
    {
        private readonly DataContext _dataContext;

        public DocumentsController(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        #region Get Operations

        /// <summary>
        /// Get all documents for a specific reference (Student, Teacher, etc)
        /// GET /api/Documents?referenceType=Student&referenceId=123
        /// </summary>
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetDocumentsByReference(
            [FromQuery] string referenceType,
            [FromQuery] int referenceId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(referenceType))
                    return BadRequest(new { message = "Reference type is required" });

                var documents = await _dataContext.Set<DocumentBO>()
                    .FromSqlRaw("EXEC sp_GetDocumentsByReference @ReferenceType, @ReferenceID",
                        new SqlParameter("@ReferenceType", referenceType),
                        new SqlParameter("@ReferenceID", referenceId))
                    .AsNoTracking()
                    .ToListAsync();

                return Ok(documents);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving documents", error = ex.Message });
            }
        }

        /// <summary>
        /// Get a specific document by ID
        /// GET /api/Documents/123
        /// </summary>
        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetDocumentById(int id)
        {
            try
            {
                var document = await _dataContext.Set<DocumentDetailBO>()
                    .FromSqlRaw("EXEC sp_GetDocumentByID @DocumentID",
                        new SqlParameter("@DocumentID", id))
                    .AsNoTracking()
                    .FirstOrDefaultAsync();

                if (document == null)
                    return NotFound(new { message = "Document not found" });

                return Ok(document);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving document", error = ex.Message });
            }
        }

        /// <summary>
        /// Get document statistics
        /// GET /api/Documents/Stats?referenceType=Student
        /// </summary>
        [Authorize]
        [HttpGet("Stats/ByReference")]
        public async Task<IActionResult> GetDocumentStats([FromQuery] string? referenceType = null)
        {
            try
            {
                var stats = await _dataContext.Set<DocumentStatsBO>()
                    .FromSqlRaw("EXEC sp_GetDocumentStats @ReferenceType",
                        new SqlParameter("@ReferenceType", (object?)referenceType ?? DBNull.Value))
                    .AsNoTracking()
                    .ToListAsync();

                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving document statistics", error = ex.Message });
            }
        }

        /// <summary>
        /// Search documents with pagination
        /// GET /api/Documents/Search?searchTerm=certificate&referenceType=Student&pageNumber=1&pageSize=10
        /// </summary>
        [Authorize]
        [HttpGet("Search")]
        public async Task<IActionResult> SearchDocuments(
            [FromQuery] string? searchTerm = null,
            [FromQuery] string? referenceType = null,
            [FromQuery] string? documentType = null,
            [FromQuery] bool? isVerified = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 50)
        {
            try
            {
                var documents = await _dataContext.Set<DocumentBO>()
                    .FromSqlRaw("EXEC sp_SearchDocuments @SearchTerm, @ReferenceType, @DocumentType, @IsVerified, @PageNumber, @PageSize",
                        new SqlParameter("@SearchTerm", (object?)searchTerm ?? DBNull.Value),
                        new SqlParameter("@ReferenceType", (object?)referenceType ?? DBNull.Value),
                        new SqlParameter("@DocumentType", (object?)documentType ?? DBNull.Value),
                        new SqlParameter("@IsVerified", (object?)isVerified ?? DBNull.Value),
                        new SqlParameter("@PageNumber", pageNumber),
                        new SqlParameter("@PageSize", pageSize))
                    .AsNoTracking()
                    .ToListAsync();

                return Ok(new { data = documents, page = pageNumber, pageSize = pageSize });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error searching documents", error = ex.Message });
            }
        }

        #endregion

        #region Upload/Download Operations

        /// <summary>
        /// Upload a new document
        /// POST /api/Documents/Upload
        /// Body: multipart/form-data with file, referenceType, referenceId, name, documentType
        /// </summary>
        [Authorize]
        [HttpPost("Upload")]
        public async Task<IActionResult> UploadDocument(
            [FromForm] IFormFile file,
            [FromForm] string referenceType,
            [FromForm] int referenceId,
            [FromForm] string name,
            [FromForm] string? documentType = null,
            [FromForm] string? description = null,
            [FromForm] string? tags = null)
        {
            try
            {
                // Validation
                if (file == null || file.Length == 0)
                    return BadRequest(new { message = "No file provided" });

                if (string.IsNullOrWhiteSpace(referenceType))
                    return BadRequest(new { message = "Reference type is required" });

                if (string.IsNullOrWhiteSpace(name))
                    return BadRequest(new { message = "Document name is required" });

                // Get document settings
                var docSettings = _dataContext.documentSettings;
                var maxFileSize = docSettings.MaxFileSize;
                var allowedExtensions = docSettings.AllowedExtensions;
                var storagePath = docSettings.StoragePath;

                // File size check
                if (file.Length > maxFileSize)
                    return BadRequest(new { message = $"File size exceeds maximum allowed size of {maxFileSize / (1024 * 1024)}MB" });

                // Extension check
                var fileExtension = Path.GetExtension(file.FileName).ToLower();
                if (!allowedExtensions.Contains(fileExtension))
                    return BadRequest(new { message = $"File type {fileExtension} is not allowed" });

                // Create storage directory if it doesn't exist
                if (!Directory.Exists(storagePath))
                    Directory.CreateDirectory(storagePath);

                // Generate unique filename
                var fileName = $"{referenceType}_{referenceId}_{Guid.NewGuid()}{fileExtension}";
                var filePath = Path.Combine(storagePath, fileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var documentIdParam = new SqlParameter("@DocumentID", SqlDbType.Int)
                {
                    Direction = ParameterDirection.Output
                };

                // Store in database
                var result = await _dataContext.Database.ExecuteSqlRawAsync(
                    "EXEC sp_CreateDocument @ReferenceType, @ReferenceID, @Name, @DocumentType, @FileUrl, @FileType, @FileSize, @UploadedBy, @Description, @Tags, @DocumentID OUTPUT",
                    new SqlParameter("@ReferenceType", referenceType),
                    new SqlParameter("@ReferenceID", referenceId),
                    new SqlParameter("@Name", name),
                    new SqlParameter("@DocumentType", (object?)documentType ?? DBNull.Value),
                    new SqlParameter("@FileUrl", filePath),
                    new SqlParameter("@FileType", file.ContentType ?? "application/octet-stream"),
                    new SqlParameter("@FileSize", (object?)file.Length ?? DBNull.Value),
                    new SqlParameter("@UploadedBy", (object?)null ?? DBNull.Value),
                    new SqlParameter("@Description", (object?)description ?? DBNull.Value),
                    new SqlParameter("@Tags", (object?)tags ?? DBNull.Value),
                    documentIdParam);

                var documentId = (int)documentIdParam.Value;

                return Ok(new
                {
                    message = "Document uploaded successfully",
                    documentId = documentId,
                    fileName = fileName,
                    fileSize = file.Length
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error uploading document", error = ex.Message });
            }
        }

        /// <summary>
        /// Download a document
        /// GET /api/Documents/123/Download
        /// </summary>
        [Authorize]
        [HttpGet("{id}/Download")]
        public async Task<IActionResult> DownloadDocument(int id)
        {
            try
            {
                var document = _dataContext.Set<DocumentBO>()
                    .FromSqlRaw("EXEC sp_GetDocumentByID @DocumentID",
                        new SqlParameter("@DocumentID", id))
                    .AsNoTracking()
                    .AsEnumerable()
                    .FirstOrDefault();

                if (document == null)
                    return NotFound(new { message = "Document not found" });

                if (!System.IO.File.Exists(document.FileUrl))
                    return NotFound(new { message = "Document file not found on server" });

                var fileBytes = await System.IO.File.ReadAllBytesAsync(document.FileUrl);
                var contentType = document.FileType ?? "application/octet-stream";
                var fileName = document.Name + Path.GetExtension(document.FileUrl);

                Response.Headers["Content-Disposition"] = $"inline; filename=\"{fileName}\"";

                return File(fileBytes, contentType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error downloading document", error = ex.Message });
            }
        }

        /// <summary>
        /// Get document file URL (for direct linking)
        /// GET /api/Documents/123/Url
        /// </summary>
        [Authorize]
        [HttpGet("{id}/Url")]
        public async Task<IActionResult> GetDocumentUrl(int id)
        {
            try
            {
                var document = await _dataContext.Set<DocumentBO>()
                    .FromSqlRaw("EXEC sp_GetDocumentByID @DocumentID",
                        new SqlParameter("@DocumentID", id))
                    .AsNoTracking()
                    .FirstOrDefaultAsync();

                if (document == null)
                    return NotFound(new { message = "Document not found" });

                if (!System.IO.File.Exists(document.FileUrl))
                    return NotFound(new { message = "Document file not found on server" });

                // Return file path or URL based on configuration
                var allowPublicAccess = _dataContext.documentSettings.AllowPublicAccess;
                var mainBaseUrl = _dataContext.mainBaseUrl;

                if (allowPublicAccess && !string.IsNullOrEmpty(mainBaseUrl))
                {
                    // Convert file path to URL
                    var relativePath = document.FileUrl.Replace("\\", "/");
                    var url = $"{mainBaseUrl}/documents/{Path.GetFileName(document.FileUrl)}";
                    return Ok(new { url = url, filePath = document.FileUrl });
                }

                return Ok(new { url = $"/api/Documents/{id}/Download", filePath = document.FileUrl });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving document URL", error = ex.Message });
            }
        }

        #endregion

        #region Update/Delete Operations

        /// <summary>
        /// Update document metadata
        /// PUT /api/Documents/123
        /// </summary>
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDocument(int id, [FromBody] DocumentUpdateBO updateDto)
        {
            try
            {
                var affectedRows = await _dataContext.Database.ExecuteSqlRawAsync(
                    "EXEC sp_UpdateDocument @DocumentID, @Name, @DocumentType, @Description, @Tags, @IsVerified, @VerifiedBy",
                    new SqlParameter("@DocumentID", id),
                    new SqlParameter("@Name", (object?)updateDto.Name ?? DBNull.Value),
                    new SqlParameter("@DocumentType", (object?)updateDto.DocumentType ?? DBNull.Value),
                    new SqlParameter("@Description", (object?)updateDto.Description ?? DBNull.Value),
                    new SqlParameter("@Tags", (object?)updateDto.Tags ?? DBNull.Value),
                    new SqlParameter("@IsVerified", (object?)updateDto.IsVerified ?? DBNull.Value),
                    new SqlParameter("@VerifiedBy", (object?)null ?? DBNull.Value));

                if (affectedRows == 0)
                    return NotFound(new { message = "Document not found" });

                return Ok(new { message = "Document updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating document", error = ex.Message });
            }
        }

        /// <summary>
        /// Delete document (soft delete)
        /// DELETE /api/Documents/123
        /// </summary>
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDocument(int id)
        {
            try
            {
                var affectedRows = await _dataContext.Database.ExecuteSqlRawAsync(
                    "EXEC sp_DeleteDocument @DocumentID",
                    new SqlParameter("@DocumentID", id));

                if (affectedRows == 0)
                    return NotFound(new { message = "Document not found" });

                return Ok(new { message = "Document deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting document", error = ex.Message });
            }
        }

        #endregion

        #region Document Categories
        /// <summary>
        /// Get all document categories
        /// GET /api/Documents/Categories/List
        /// </summary>
        [Authorize]
        [HttpGet("Categories/List")]
        public async Task<IActionResult> GetDocumentCategories()
        {
            try
            {
                var categories = await _dataContext.Database.SqlQueryRaw<dynamic>(
                    "SELECT DocumentCategoryID as id, Name as name, Description as description, IsActive as is_active FROM dbo.DocumentCategories WHERE IsActive = 1 ORDER BY Name")
                    .ToListAsync();

                return Ok(categories);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving document categories", error = ex.Message });
            }
        }
        #endregion
    }
}