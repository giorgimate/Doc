using DocAppointmentAPI.Entities.DataTransferObjects;
using DocAppointmentAPI.Models;
using DocAppointmentAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DocAppointmentAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly RepositoryContext _context;

        public CategoriesController(RepositoryContext context)
        {
            _context = context;
        }

        // GET: api/Categories
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryWithDoctorsCountDto>>> GetCategoriesWithDoctorsCount(string? categoryName = null)
        {
            var categoriesQuery = _context.Categories.AsQueryable();

            if (!string.IsNullOrEmpty(categoryName))
            {
                categoriesQuery = categoriesQuery.Where(c => c.Name.Contains(categoryName));
            }

            var categoriesWithDoctorsCount = await categoriesQuery.Select(c =>
                new CategoryWithDoctorsCountDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    DoctorsCount = _context.Users.Count(u => u.CategoryId == c.Id)
                }).ToListAsync();

            return categoriesWithDoctorsCount;
        }

        // PUT: api/Categories/5
        [HttpPut("{id}"), Authorize(Roles = ("Admin"))]
        public async Task<IActionResult> PutCategory(Guid id, string categoryName)
        {
            if (string.IsNullOrWhiteSpace(categoryName))
            {
                return BadRequest("Category name cannot be null or empty.");
            }

            var category = await _context.Categories.FindAsync(id);

            if (category == null)
            {
                return NotFound();
            }

            // Check if the category with the same name already exists
            if (await _context.Categories.AnyAsync(c => c.Name == categoryName))
            {
                return BadRequest("A category with this name already exists.");
            }

            category.Name = categoryName;
            _context.Entry(category).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CategoryExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Categories
        [HttpPost, Authorize(Roles = ("Admin"))]
        public async Task<ActionResult<Category>> PostCategory(string categoryName)
        {
            if (_context.Categories == null)
            {
                return Problem("Entity set 'RepositoryContext.Categories' is null.");
            }

            // Check if the category with the same name already exists
            if (await _context.Categories.AnyAsync(c => c.Name == categoryName))
            {
                return BadRequest("A category with this name already exists.");
            }

            var category = new Category { Name = categoryName };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return StatusCode(201);
        }

        // DELETE: api/Categories/5
        [HttpDelete("{id}"), Authorize(Roles = ("Admin"))]
        public async Task<IActionResult> DeleteCategory(Guid id)
        {
            if (_context.Categories == null)
            {
                return NotFound();
            }
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound();
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CategoryExists(Guid id)
        {
            return (_context.Categories?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}
