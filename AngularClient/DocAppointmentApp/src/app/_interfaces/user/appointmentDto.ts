export interface AppointmentDto {
  id?: string;
  doctorId?: string;
  patientId?: string;
  startTime?: string;
  endTime?: string;
  description?: string;
  isCurrentUserAppointment?: boolean;
  isNonAvailableAppointment?: boolean;
}
