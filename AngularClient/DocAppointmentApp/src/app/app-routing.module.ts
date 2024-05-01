import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DoctorsComponent } from './doctors/doctors.component';
import { PatientRegistrationComponent } from './authentication/patient-registration/patient-registration.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { BookAppointmentComponent } from './book-appointment/book-appointment.component';
import { ScrollToTopGuard } from './_guards/scroll-to-top.guard';
import { NotAuthenticatedGuard } from './_guards/not-authenticated.guard';
import { ForgotPasswordComponent } from './authentication/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './authentication/reset-password/reset-password.component';
import { AdminComponent } from './admin/admin.component';

const routes: Routes = [
  {
    path: 'register',
    component: PatientRegistrationComponent,
    canActivate: [NotAuthenticatedGuard],
  },
  {
    path: 'forgotpassword',
    component: ForgotPasswordComponent,
    canActivate: [NotAuthenticatedGuard],
  },
  {
    path: 'resetpassword',
    component: ResetPasswordComponent,
    canActivate: [NotAuthenticatedGuard],
  },

  { path: 'doctors', component: DoctorsComponent },
  {
    path: 'booking/:id',
    component: BookAppointmentComponent,
    data: { bookingPage: false },
  },
  {
    path: 'admin',
    component: AdminComponent,
  },
  { path: '', redirectTo: '/doctors', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
