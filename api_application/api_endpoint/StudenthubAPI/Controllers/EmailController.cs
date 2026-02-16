using StudenthubAPI.Data;
using StudenthubAPI.Models;
using StudenthubAPI.BO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using Microsoft.AspNetCore.Authorization;
using System.Net.Mail;
using System.Net;
using System.Runtime;
using IOFile = System.IO.File;

namespace StudenthubAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmailController : ControllerBase
    {
        private readonly DataContext _dataContext;

        public EmailController(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        [HttpPost]
        public async Task SendEmailAsync(
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

        private async Task<string> LoadTemplateAsync(
            string templateName,
            Dictionary<string, string> placeholders)
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

    }
}
