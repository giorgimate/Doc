using AutoMapper;
using DocAppointmentAPI.Entities.DataTransferObjects.Account;
using DocAppointmentAPI.Entities.Models;
using DocAppointmentAPI.Models;
using DocAppointmentAPI.Repository;
using Microsoft.AspNetCore.Identity;
using Newtonsoft.Json;

namespace CompanyEmployees.Repository.Data
{
    public class DataSeeder
    {
        public static void Seed(RepositoryContext context, UserManager<User> userManager, IMapper mapper)
        {
            if (!context.Database.CanConnect())
                return;
            if (!context.Categories.Any())
                SeedCategory("Repository\\Data\\Json\\categories.json", context);
            if (!context.Users.Any())
            {
                SeedAdmin("Repository\\Data\\Json\\admins.json", userManager, mapper);
                SeedPatient("Repository\\Data\\Json\\patients.json", userManager, mapper);
                SeedDoctor("Repository\\Data\\Json\\doctors.json", userManager, mapper);
            }
        }

        private static void SeedAdmin(string jsonPath, UserManager<User> userManager, IMapper mapper)
        {
            string json = File.ReadAllText(jsonPath);
            var parsedUsers = JsonConvert.DeserializeObject<List<AdminForRegistrationDto>>(json)!;

            foreach (var userForRegistration in parsedUsers)
            {
                var user = mapper.Map<User>(userForRegistration);
                var result = userManager.CreateAsync(user, userForRegistration.Password).Result;
                if (result.Succeeded)
                {
                    userManager.AddToRoleAsync(user, "Admin").Wait();
                }
            }
        }
        private static void SeedPatient(string jsonPath, UserManager<User> userManager, IMapper mapper)
        {
            string json = File.ReadAllText(jsonPath);
            var parsedUsers = JsonConvert.DeserializeObject<List<PatientForRegistrationDto>>(json)!;

            foreach (var userForRegistration in parsedUsers)
            {
                var user = mapper.Map<User>(userForRegistration);
                var result = userManager.CreateAsync(user, userForRegistration.Password).Result;
                if (result.Succeeded)
                {
                    userManager.AddToRoleAsync(user, "Patient").Wait();
                }
            }
        }
        private static void SeedDoctor(string jsonPath, UserManager<User> userManager, IMapper mapper)
        {
            string json = File.ReadAllText(jsonPath);
            var parsedUsers = JsonConvert.DeserializeObject<List<DoctorForRegistrationDto>>(json)!;

            foreach (var userForRegistration in parsedUsers)
            {
                var user = mapper.Map<User>(userForRegistration);
                var result = userManager.CreateAsync(user, userForRegistration.Password).Result;
                if (result.Succeeded)
                {
                    userManager.AddToRoleAsync(user, "Doctor").Wait();
                }
            }
        }
        private static void SeedCategory(string jsonPath, RepositoryContext context)
        {
            string json = File.ReadAllText(jsonPath);
            var parsedCategories = JsonConvert.DeserializeObject<List<Category>>(json)!;

            foreach (var category in parsedCategories)
            {
                context.Categories.Add(category);
            }
            context.SaveChanges();
        }
    }
}

