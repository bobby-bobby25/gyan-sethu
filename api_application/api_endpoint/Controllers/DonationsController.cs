using StudenthubAPI.Data;
using StudenthubAPI.Models;
using StudenthubAPI.BO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace StudenthubAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DonationsController : ControllerBase
    {
        private readonly DataContext _context;
        public DonationsController(DataContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DonationBO>>> GetAll()
        {
            var result = await _context.Donations.FromSqlRaw("EXEC sp_GetAllDonations").ToListAsync();
            return Ok(result);
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<DonationBO>> GetById(int id)
        {
            var result = await _context.Donations.FromSqlRaw("EXEC sp_GetDonationById @Id={0}", id).FirstOrDefaultAsync();
            if (result == null) return NotFound();
            return Ok(result);
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] CreateDonationBO donation)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_CreateDonation @DonorId={0}, @Amount={1}, @DonationDate={2}, @PaymentModeID={3}, @ReferenceNumber={4}, @Currency={5}, @Remarks={6}",
                donation.DonorId, donation.Amount, donation.DonationDate, donation.PaymentModeID, donation.ReferenceNumber, donation.Currency, donation.Remarks
            );
            return Ok();
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, [FromBody] UpdateDonationBO donation)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_UpdateDonation @Id={0}, @DonorId={1}, @Amount={2}, @DonationDate={3}, @PaymentModeID={4}, @ReferenceNumber={5}, @Currency={6}, @Remarks={7}",
                id, donation.DonorId, donation.Amount, donation.DonationDate, donation.PaymentModeID, donation.ReferenceNumber, donation.Currency, donation.Remarks
            );
            return Ok();
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            await _context.Database.ExecuteSqlRawAsync("EXEC sp_DeleteDonation @Id={0}", id);
            return Ok();
        }
    }
}
