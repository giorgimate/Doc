import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { SearchComponent } from './header/search/search.component';
import { MenuComponent } from './header/menu/menu.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TabMenuModule } from 'primeng/tabmenu';
import { ButtonModule } from 'primeng/button';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TableModule } from 'primeng/table';
import { PatientRegistrationComponent } from './authentication/patient-registration/patient-registration.component';
import { InputTextModule } from 'primeng/inputtext';
import { HttpClientModule } from '@angular/common/http';
import { DialogModule } from 'primeng/dialog';
import { LoginComponent } from './authentication/login/login.component';
import { DoctorsComponent } from './doctors/doctors.component';
import { CategoriesComponent } from './categories/categories.component';
import { OrderListModule } from 'primeng/orderlist';
import { DoctorCardComponent } from './doctors/doctor-card/doctor-card.component';
import { NumberFormatPipe } from './_pipes/number-format.pipe';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NotFoundComponent } from './not-found/not-found.component';
import { BookAppointmentComponent } from './book-appointment/book-appointment.component';
import { DoctorInfoCardComponent } from './book-appointment/doctor-info-card/doctor-info-card.component';
import { CalendarComponent } from './calendar/calendar.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { UnauthorizedToastComponent } from './calendar/unauthorized-toast/unauthorized-toast.component';
import { JwtModule } from '@auth0/angular-jwt';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuthGuard } from './_guards/auth.guard';
import { UserInfoCardComponent } from './book-appointment/user-info-card/user-info-card.component';
import { ForgotPasswordComponent } from './authentication/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './authentication/reset-password/reset-password.component';
import { AdminComponent } from './admin/admin.component';
import { AdminHeaderComponent } from './admin/admin-header/admin-header.component';
import { AdminTableComponent } from './admin/admin-table/admin-table.component';
import { ToolbarModule } from 'primeng/toolbar';

export function tokenGetter() {
  return localStorage.getItem('jwt');
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    SearchComponent,
    MenuComponent,
    PatientRegistrationComponent,
    LoginComponent,
    DoctorsComponent,
    CategoriesComponent,
    DoctorCardComponent,
    NumberFormatPipe,
    NotFoundComponent,
    BookAppointmentComponent,
    DoctorInfoCardComponent,
    CalendarComponent,
    UnauthorizedToastComponent,
    UserInfoCardComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    AdminComponent,
    AdminHeaderComponent,
    AdminTableComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    TabMenuModule,
    ButtonModule,
    AutoCompleteModule,
    FormsModule,
    TableModule,
    ReactiveFormsModule,
    InputTextModule,
    HttpClientModule,
    DialogModule,
    OrderListModule,
    InfiniteScrollModule,
    FullCalendarModule,
    ConfirmDialogModule,
    ToastModule,
    DialogModule,
    InputTextareaModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: ['localhost:5001'],
        disallowedRoutes: [],
      },
    }),
    ToolbarModule,
  ],
  providers: [AuthGuard, MessageService, ConfirmationService],
  bootstrap: [AppComponent],
})
export class AppModule {}
