import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppointmentDto } from '../_interfaces/user/appointmentDto';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  constructor(private http: HttpClient) {}

  getDoctorAppointments(id: string) {
    return this.http.get<AppointmentDto[]>(
      `https://localhost:5001/api/Appointments/${id}`
    );
  }

  deleteAppointments(id: string) {
    return this.http.delete(`https://localhost:5001/api/Appointments/${id}`);
  }

  postAppointments(body: any) {
    return this.http.post(`https://localhost:5001/api/Appointments`, body);
  }

  postNotAvailableAppointment(doctorId: string, time: string) {
    return this.http.post(
      `https://localhost:5001/api/Appointments/NotAvailable?doctorId=${doctorId}&time=${time}`,
      null
    );
  }

  putAppointment(id: string, description?: string) {
    return this.http.put(
      `https://localhost:5001/api/Appointments/${id}?description=${description}`,
      null
    );
  }
}
