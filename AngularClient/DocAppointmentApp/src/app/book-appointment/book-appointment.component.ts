import { Component, Input } from '@angular/core';
import { UserService } from '../_services/user.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthenticationService } from '../_services/authentication.service';
import { UserDto } from '../_interfaces/user/userDto';
import { JwtService } from '../_services/jwt.service';

@Component({
  selector: 'app-book-appointment',
  templateUrl: './book-appointment.component.html',
  styleUrls: ['./book-appointment.component.css'],
})
export class BookAppointmentComponent {
  doctor?: UserDto;
  user?: UserDto;
  generateAvailableSlots: boolean = false;
  isDoctorCalendar = true;
  initCalendar = false;

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthenticationService,
    private jwtService: JwtService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      let id = params.get('id');

      //  for non authorized users
      if (!this.authService.isUserAuthenticated()) {
        this.userService.getDoctor(id).subscribe({
          next: (res) => {
            this.doctor = res;
            this.generateAvailableSlots = true;
            this.initCalendar = true;
          },
          error: () => {
            this.router.navigate(['**']);
          },
        });
      }
      //  for authorized users but not personal calendar
      else {
        const jwtUserId = this.jwtService.getUserIdFromJwtToken();
        if (id != jwtUserId) {
          this.userService.getDoctor(id).subscribe({
            next: (res) => {
              this.doctor = res;
              if (this.authService.isUserPatient()) {
                this.generateAvailableSlots = true;
              }
              this.initCalendar = true;
            },
            error: () => {
              this.router.navigate(['**']);
            },
          });
        }
        //  for authorized users and personal calendar
        else {
          let userDataString = sessionStorage.getItem('userData');
          if (userDataString) {
            this.user = JSON.parse(userDataString);
          }
          if (this.authService.isUserDoctor())
            this.generateAvailableSlots = true;
          if (this.authService.isUserPatient()) {
            this.isDoctorCalendar = false;
          }
          this.initCalendar = true;
        }
      }
    });
  }
}
