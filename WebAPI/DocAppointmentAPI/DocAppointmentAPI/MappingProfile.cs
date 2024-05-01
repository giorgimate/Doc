using AutoMapper;
using DocAppointmentAPI.Entities.DataTransferObjects.Account;
using DocAppointmentAPI.Entities.Models;

namespace DocAppointmentAPI
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<AdminForRegistrationDto, User>()
                .ForMember(u => u.Email, opt => opt.MapFrom(x => x.Email.ToLower()))
                .ForMember(u => u.UserName, opt => opt.MapFrom(x => x.Email.ToLower()));

            CreateMap<PatientForRegistrationDto, User>()
                .ForMember(u => u.Email, opt => opt.MapFrom(x => x.Email.ToLower()))
                .ForMember(u => u.UserName, opt => opt.MapFrom(x => x.Email.ToLower()));

            CreateMap<DoctorForRegistrationDto, User>()
                .ForMember(u => u.Email, opt => opt.MapFrom(x => x.Email.ToLower()))
                .ForMember(u => u.UserName, opt => opt.MapFrom(x => x.Email.ToLower()));
        }
    }
}
