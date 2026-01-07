using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Collections.Generic;
using StudenthubAPI.Controllers.BO;
using StudenthubAPI.Models;
using StudenthubAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace StudenthubAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class DonationController : ControllerBase
    {
        private readonly DataContext _context;
        public DonationController(DataContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DonationBO>>> GetAll()
        {
            var result = await _context.Donations.FromSqlRaw("EXEC sp_GetAllDonations").ToListAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DonationBO>> GetById(int id)
        {
            var result = await _context.Donations.FromSqlRaw("EXEC sp_GetDonationById @Id={0}", id).FirstOrDefaultAsync();
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] CreateDonationBO donation)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_CreateDonation @DonorId={0}, @Amount={1}, @DonationDate={2}, @PaymentModeID={3}, @ReferenceNumber={4}, @Currency={5}, @Remarks={6}",
                donation.DonorId, donation.Amount, donation.DonationDate, donation.PaymentModeID, donation.ReferenceNumber, donation.Currency, donation.Remarks
            );
            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, [FromBody] UpdateDonationBO donation)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_UpdateDonation @Id={0}, @DonorId={1}, @Amount={2}, @DonationDate={3}, @PaymentModeID={4}, @ReferenceNumber={5}, @Currency={6}, @Remarks={7}",
                id, donation.DonorId, donation.Amount, donation.DonationDate, donation.PaymentModeID, donation.ReferenceNumber, donation.Currency, donation.Remarks
            );
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            await _context.Database.ExecuteSqlRawAsync("EXEC sp_DeleteDonation @Id={0}", id);
            return Ok();
        }
    }
}
