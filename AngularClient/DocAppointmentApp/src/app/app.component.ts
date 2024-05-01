import { Component } from '@angular/core';
import { AuthenticationService } from './_services/authentication.service';
import { UserService } from './_services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [],
})
export class AppComponent {
  title = 'DocAppointmentApp';

  constructor(
    private userService: UserService,
    private authService: AuthenticationService
  ) {}

  ngOnInit() {
    if (localStorage.getItem('jwt') && !this.authService.getUserData()) {
      this.userService.GetUser().subscribe(
        (userData) => {
          sessionStorage.setItem('userData', JSON.stringify(userData));
          this.authService.setUserData(userData);
        },
        (error) => {
          // Handle error, e.g. redirect to the login page or show a notification
        }
      );
    }
  }
}
