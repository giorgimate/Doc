import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthResponseDto } from 'src/app/_interfaces/response/authResponseDto.model';
import { UserForAuthenticationDto } from 'src/app/_interfaces/account/userForAuthenticationDto.model';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { UserService } from 'src/app/_services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  @Output() loginSuccess = new EventEmitter<void>();

  loginForm: FormGroup;
  submitted = false;
  errorMessage: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthenticationService,
    private userService: UserService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit(form: FormGroup) {
    this.submitted = true;
    if (!form.valid) return;

    const login = form.value;

    const userForAuth: UserForAuthenticationDto = {
      email: login.email,
      password: login.password,
    };

    this.authService.loginUser(userForAuth).subscribe({
      next: (res: AuthResponseDto) => {
        this.router.navigate(['/']);
        this.loginSuccess.emit();
      },
      error: (err: HttpErrorResponse) => {
        if (err.status == 401) {
          this.errorMessage = '*გთხოვთ შეამოწმეთ ელ-ფოსტა და პაროლი';
        }
      },
    });
  }

  onInputChange() {
    this.errorMessage = null;
  }
}
