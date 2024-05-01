import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  AbstractControl,
  ValidatorFn,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../_services/authentication.service';
import { ResetPasswordDto } from 'src/app/_interfaces/resetPassword/resetPasswordDto.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  showSuccess?: boolean;
  showError?: boolean;
  errorMessage?: string;
  submitted?: boolean;

  private token: string;
  private email: string;

  constructor(
    private authService: AuthenticationService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.resetPasswordForm = this.formBuilder.group({
      password: ['', [Validators.required, this.passwordValidator()]],
      confirm: [''],
    });

    this.resetPasswordForm
      .get('confirm')!
      .setValidators([
        Validators.required,
        this.validateConfirmPassword(this.resetPasswordForm.get('password')!),
      ]);

    this.token = this.route.snapshot.queryParams['token'];
    this.email = this.route.snapshot.queryParams['email'];
  }

  ngOnInit(): void {}

  public validateControl(controlName: string) {
    return this.resetPasswordForm.get(controlName)?.errors && this.submitted;
  }

  public hasError(controlName: string, errorName: string) {
    return this.resetPasswordForm.get(controlName)?.hasError(errorName);
  }

  public resetPassword(resetPasswordForm: FormGroup) {
    this.submitted = true;
    if (!resetPasswordForm.valid) return;

    const resetPasswordFormValue = resetPasswordForm.value;
    this.showError = this.showSuccess = false;
    const resetPass = { ...resetPasswordFormValue };

    const resetPassDto: ResetPasswordDto = {
      password: resetPass.password,
      confirmPassword: resetPass.confirm,
      token: this.token,
      email: this.email,
    };

    this.authService.resetPassword(resetPassDto).subscribe({
      next: (_) => (this.showSuccess = true),
      error: (err: HttpErrorResponse) => {
        this.showError = true;
        // this.errorMessage = err.message;
        this.errorMessage = 'დაფიქსირდა შეცდომა';
      },
    });
  }

  validateConfirmPassword(passwordControl: AbstractControl): ValidatorFn {
    return (
      confirmationControl: AbstractControl
    ): { [key: string]: boolean } | null => {
      const confirmValue = confirmationControl.value;
      const passwordValue = passwordControl.value;

      if (confirmValue !== passwordValue) {
        return { mustMatch: true };
      }

      return null;
    };
  }

  passwordValidator(): Validators {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const password = control.value;
      const regExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
      const valid = regExp.test(password);
      return valid ? null : { invalidPassword: true };
    };
  }

  navigateToLogin(): void {
    this.authService.triggerDisplayLoginDialog();
  }
}
