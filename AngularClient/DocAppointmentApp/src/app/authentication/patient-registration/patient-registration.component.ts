import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../_services/authentication.service';
import { EmailValidationDto } from '../../_interfaces/account/emailValidationDto';
import { EmailValidationResponseDto } from '../../_interfaces/response/emailValidationResponseDto';
import { RegistrationResponseDto } from '../../_interfaces/response/registrationResponseDto.model';
import { UserForRegistrationDto } from '../../_interfaces/account/userForRegistrationDto.model';

@Component({
  selector: 'app-patient-registration',
  templateUrl: './patient-registration.component.html',
  styleUrls: ['./patient-registration.component.css'],
})
export class PatientRegistrationComponent {
  registrationForm: FormGroup;
  submitted = false;

  validateEmailClicked = false;
  validateEmailAvailable = true;
  countdownInterval: any = null;
  remainingMinutes = 0;

  emailResponseError: string | null = null;
  emailValidationCodeResponseError: string | null = null;

  selectedFile: File | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthenticationService
  ) {
    this.registrationForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.pattern(/^[ა-ჰ]+$/)]],
      lastName: ['', [Validators.required, Validators.pattern(/^[ა-ჰ]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      personalId: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      emailValidationCode: [
        '',
        [Validators.required, Validators.pattern(/\S/)],
      ],
      password: ['', [Validators.required, this.passwordValidator()]],
      file: ['', [Validators.required]],
    });
  }

  passwordValidator(): Validators {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const password = control.value;
      const regExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
      const valid = regExp.test(password);
      return valid ? null : { invalidPassword: true };
    };
  }

  onSubmit(form: FormGroup) {
    this.submitted = true;
    if (form.valid) {
      const formValues = form.value;

      const formData: FormData = new FormData();
      formData.append("firstName", formValues.firstName);
      formData.append("lastName", formValues.lastName);
      formData.append("email", formValues.email);
      formData.append("password", formValues.password);
      formData.append("emailValidationCode", formValues.emailValidationCode);
      formData.append("personalId", formValues.personalId);
  
      if (this.selectedFile) {
        formData.append("profileImage", this.selectedFile, this.selectedFile.name);
      }

      this.authService.registerUser(formData).subscribe({
        next: () => {
          this.router.navigate(['/']);
          setTimeout(() => {
            this.authService.triggerDisplayLoginDialog();
          }, 100);
          console.log('sdsda');
        },
        error: (err: HttpErrorResponse) => {
          let errorResponse: RegistrationResponseDto = err.error;

          errorResponse.errors.forEach((error) => {
            if (error == 'Email Validation Code is expired') {
              this.emailValidationCodeResponseError =
                '*აქტივაციის კოდის მოქმედების ვადა ამოიწურა';
            }
            if (error == 'Email Validation Code is invalid') {
              this.emailValidationCodeResponseError =
                '*აქტივაციის კოდი არასწორია';
            }
            if (error == `Email '${formValues.email}' is already taken.`) {
              this.emailResponseError =
                '*მომხმარებელი ასეთი ელ-ფოსტით უკვე არსებობს';
            }
          });

          console.log(`Email '${formValues.email}' is already taken.`);
          errorResponse.errors.forEach((x) => console.log(x));
        },
      });
    }
  }

  validateEmail(email: AbstractControl) {
    this.validateEmailClicked = true;

    if (!this.validateEmailAvailable || !email.valid) {
      return;
    }

    const emailValidation: EmailValidationDto = {
      email: email.value,
    };

    this.authService.validateEmail(emailValidation).subscribe({
      next: () => {
        this.createCountDownInterval(30);
      },
      error: (err: HttpErrorResponse) => {
        let errorResponse: EmailValidationResponseDto = err.error;

        if (err.status == 409) {
          this.emailResponseError =
            '*მომხმარებელი ასეთი ელ-ფოსტით უკვე არსებობს';
        }
        if (err.status == 423) {
          this.createCountDownInterval(errorResponse.minutesLeftForToken);
        }
      },
    });
  }

  createCountDownInterval(mins: number) {
    this.validateEmailAvailable = false;
    this.remainingMinutes = Math.ceil(mins);
    console.log(this.remainingMinutes);

    // clears the existing interval if it exists
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    // creates countdown for button to disable
    this.countdownInterval = setInterval(() => {
      this.remainingMinutes -= 1;

      if (this.remainingMinutes === 25) {
        this.validateEmailAvailable = true;
      }

      if (this.remainingMinutes === 0) {
        clearInterval(this.countdownInterval);
      }
    }, 60000); // 1 minute in milliseconds
  }

  onEmailInputChange() {
    this.validateEmailAvailable = true;
    this.remainingMinutes = 0;
    this.emailResponseError = null;
  }

  onEmailValidationCodeInputChange() {
    this.emailResponseError = null;
    this.emailValidationCodeResponseError = null;
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

}
