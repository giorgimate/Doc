import { Component, OnInit } from '@angular/core';
import {
  Form,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthenticationService } from '../../_services/authentication.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ForgotPasswordDto } from '../../_interfaces/resetPassword/forgotPasswordDto.model';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  successMessage?: string;
  errorMessage?: string;
  showSuccess?: boolean;
  showError?: boolean;
  submitted?: boolean;

  constructor(
    private _authService: AuthenticationService,
    private formBuilder: FormBuilder
  ) {
    this.forgotPasswordForm = this.formBuilder.group({
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  ngOnInit() {}

  public validateControl(controlName: string) {
    return this.forgotPasswordForm.get(controlName)?.errors && this.submitted;
  }

  public forgotPassword(forgotPasswordForm: FormGroup) {
    this.submitted = true;
    if (!forgotPasswordForm.valid) return;

    const forgotPasswordFormValue = forgotPasswordForm.value;
    this.showError = this.showSuccess = false;
    const forgotPass = { ...forgotPasswordFormValue };
    const forgotPassDto: ForgotPasswordDto = {
      email: forgotPass.email,
      clientURI: 'http://localhost:4200/resetpassword',
    };
    this._authService.forgotPassword(forgotPassDto).subscribe({
      next: (_) => {
        this.showSuccess = true;
        this.successMessage =
          'ბმული გამოიგზავნა, პაროლის აღსადგენად შეამოწმოთ ელ-ფოსტა.';
      },
      error: (err: HttpErrorResponse) => {
        if (err.status == 404) {
          this.showError = true;
          this.errorMessage = 'მომხმარებელი ასეთი ელ-ფოსტით არ არსებობს';
        }
      },
    });
  }
}
