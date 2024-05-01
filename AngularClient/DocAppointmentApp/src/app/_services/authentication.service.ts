import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RegistrationResponseDto } from '../_interfaces/response/registrationResponseDto.model';
import { EmailValidationDto } from '../_interfaces/account/emailValidationDto';
import { EmailValidationResponseDto } from '../_interfaces/response/emailValidationResponseDto';
import { UserForAuthenticationDto } from '../_interfaces/account/userForAuthenticationDto.model';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { JwtService } from './jwt.service';
import { BehaviorSubject, Observable, Subject, tap } from 'rxjs';
import { AuthResponseDto } from '../_interfaces/response/authResponseDto.model';
import { UserForRegistrationDto } from '../_interfaces/account/userForRegistrationDto.model';
import { UserService } from './user.service';
import { UserDto } from '../_interfaces/user/userDto';
import { ForgotPasswordDto } from '../_interfaces/resetPassword/forgotPasswordDto.model';
import { ResetPasswordDto } from '../_interfaces/resetPassword/resetPasswordDto.model';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(
    private http: HttpClient,
    private jwtHelper: JwtHelperService,
    private router: Router,
    private jwtService: JwtService,
    private userService: UserService
  ) {
    const storedUserData = sessionStorage.getItem('userData');
    this.userDataSubject = new BehaviorSubject<any>(
      storedUserData ? JSON.parse(storedUserData) : null
    );
    this.userData = this.userDataSubject.asObservable();
  }

  private userDataSubject: BehaviorSubject<any>;
  public userData: Observable<any>;

  getUserData(): any {
    return this.userDataSubject.value;
  }

  setUserData(userData: any): void {
    this.userDataSubject.next(userData);
  }

  private displayLoginDialogSource = new Subject<void>();
  public displayLoginDialog$ = this.displayLoginDialogSource.asObservable();

  public triggerDisplayLoginDialog(): void {
    this.displayLoginDialogSource.next();
  }

  logOut() {
    localStorage.removeItem('jwt');
    sessionStorage.removeItem('userData');
    this.router.navigate(['/']);
  }

  public isUserAuthenticated(): boolean {
    const token = localStorage.getItem('jwt');
    if (token && !this.jwtHelper.isTokenExpired(token)) return true;
    else return false;
  }

  public isUserAdmin() {
    return (
      this.isUserAuthenticated() &&
      this.jwtService.getUserRoleFromJwtToken() === 'Admin'
    );
  }

  public isUserDoctor(): boolean {
    const decodedToken = this.jwtService.getDecodedToken();
    const role =
      decodedToken[
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
      ];

    return role === 'Doctor';
  }

  public isUserPatient(): boolean {
    const decodedToken = this.jwtService.getDecodedToken();
    const role =
      decodedToken[
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
      ];

    return role === 'Patient';
  }

  public registerUser(user: FormData) {
    return this.http.post<RegistrationResponseDto>(
      `https://localhost:5001/api/accounts/RegisterPatient`,
      user
    );
  }

  public validateEmail(body: EmailValidationDto) {
    return this.http.post<EmailValidationResponseDto>(
      `https://localhost:5001/api/EmailValidations`,
      body
    );
  }

  public loginUser(body: UserForAuthenticationDto) {
    return this.http
      .post<AuthResponseDto>(`https://localhost:5001/api/accounts/Login`, body)
      .pipe(
        tap((response: AuthResponseDto) => {
          localStorage.setItem('jwt', response.token);

          this.userService.GetUser().subscribe((userData) => {
            sessionStorage.setItem('userData', JSON.stringify(userData));
            this.setUserData(userData);
          });
        })
      );
  }

  public forgotPassword(body: ForgotPasswordDto) {
    return this.http.post(
      `https://localhost:5001/api/accounts/ForgotPassword`,
      body
    );
  }

  public resetPassword(body: ResetPasswordDto) {
    return this.http.post(
      `https://localhost:5001/api/accounts/ResetPassword`,
      body
    );
  }
}
