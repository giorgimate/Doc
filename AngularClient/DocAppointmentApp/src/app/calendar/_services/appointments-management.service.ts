import { Injectable } from '@angular/core';
import { EventImpl } from '@fullcalendar/core/internal';
import { AppointmentDto } from 'src/app/_interfaces/user/appointmentDto';
import { AppointmentService } from 'src/app/_services/appointment.service';
import { JwtService } from 'src/app/_services/jwt.service';

@Injectable({
  providedIn: 'root',
})
export class AppointmentManagementService {
  constructor(
    private appointmentService: AppointmentService,
    private jwtService: JwtService
  ) {}

  postAppointment(
    event: EventImpl,
    doctorId: string,
    appointmentDescription?: string
  ) {
    const userId: string = this.jwtService.getUserIdFromJwtToken();

    const appointmentDto: AppointmentDto = {
      doctorId: doctorId,
      patientId: userId,
      startTime: this.toLocalISOString(event.start!),
      description: appointmentDescription,
    };

    return this.appointmentService.postAppointments(appointmentDto);
  }

  private toLocalISOString(date: Date): string {
    const pad = (num: number) => num.toString().padStart(2, '0');

    const yyyy = date.getFullYear();
    const MM = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    const ss = pad(date.getSeconds());

    return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}`;
  }

  putAppointments(id: string, description?: string) {
    return this.appointmentService.putAppointment(id, description);
  }

  deleteAppointment(event: EventImpl) {
    const appointmentId = event.id;
    return this.appointmentService.deleteAppointments(appointmentId);
  }

  postNotAvailableAppointment(doctorId: string, dateTimeString: Date) {
    const time = this.toLocalISOString(dateTimeString);
    return this.appointmentService.postNotAvailableAppointment(doctorId, time);
  }

  //event fetching starts here
  renderAppointments(
    id: string | null,
    generateAvailableSlots: boolean,
    isDoctorCalendar: boolean,
    isPersonalCalendar: boolean,
    callback: (events: any[]) => void,
    weekStartDate?: Date
  ): void {
    if (id == null) return;

    this.appointmentService.getDoctorAppointments(id).subscribe({
      next: (appointments: AppointmentDto[]) => {
        let events = appointments.map((appointment) => {
          let title = '';
          if (appointment.isCurrentUserAppointment) {
            if (appointment.isNonAvailableAppointment) {
              title = 'დაბლოკილია';
            } else if (isDoctorCalendar && isPersonalCalendar) {
              title = 'დაჯავშნილია';
            } else {
              title = 'ჩემი ჯავშანი';
            }
          }

          return {
            id: appointment.id,
            start: appointment.startTime,
            end: appointment.endTime,
            title: title,
            description: appointment.description,
            isCurrentUserAppointment: appointment.isCurrentUserAppointment,
            isNonAvailableAppointment: appointment.isNonAvailableAppointment,
            display: 'background',
          };
        });

        events = this.refineEvents(events);
        if (generateAvailableSlots) {
          const availableSlots = this.generateAvailableSlots(
            events,
            isDoctorCalendar,
            isPersonalCalendar,
            weekStartDate
          );
          events = [...events, ...availableSlots];
        }
        callback(events);
      },
    });
  }

  private refineEvents(events: any[]): any[] {
    // Sort events by start time
    events.sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );

    const refinedEvents = [];
    let currentDayEvents = [];
    let currentDay = -1;

    for (const event of events) {
      const eventDate = new Date(event.start);
      const eventDay = eventDate.getDate();

      // Check if we're still processing the same day
      if (eventDay === currentDay) {
        currentDayEvents.push(event);
      } else {
        // Process the previous day's events
        if (currentDayEvents.length > 0) {
          const mergedEvents =
            this.mergeEventsIfWholeDayOccupied(currentDayEvents);
          refinedEvents.push(...mergedEvents);
        }

        // Start processing the new day
        currentDay = eventDay;
        currentDayEvents = [event];
      }
    }

    // Process the last day's events
    if (currentDayEvents.length > 0) {
      const mergedEvents = this.mergeEventsIfWholeDayOccupied(currentDayEvents);
      refinedEvents.push(...mergedEvents);
    }

    return refinedEvents;
  }

  // only for non current user events
  private mergeEventsIfWholeDayOccupied(events: any[]): any[] {
    let startTime = new Date(events[0].start);
    let endTime = new Date(events[events.length - 1].end);

    const isWholeDayOccupied =
      startTime.getHours() === 9 &&
      endTime.getHours() === 17 &&
      events.length === 8 &&
      events.every((event) => event.isCurrentUserAppointment === false); // checks if all events are non curent user

    if (isWholeDayOccupied) {
      return [
        {
          start: startTime.toISOString(),
          end: endTime.toISOString(),
          title: '',
          display: 'background',
          isFullDayEvent: true,
        },
      ];
    } else {
      return events;
    }
  }

  // generates available slots for future 4 weeks
  private generateAvailableSlots(
    events: any,
    isDoctorCalendar: boolean,
    isPersonalCalendar: boolean,
    weekStartDate?: Date
  ) {
    const startHour = 9;
    const endHour = 17;
    const daysOfWeek = [1, 2, 3, 4, 5]; // Monday - Friday

    let availableSlots: any[] = [];

    let currentDate = new Date();
    if (weekStartDate) currentDate = weekStartDate;
    currentDate.setMinutes(currentDate.getMinutes() - 30);

    daysOfWeek.forEach((day) => {
      for (let hour = startHour; hour < endHour; hour++) {
        const startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() + day - currentDate.getDay());
        startDate.setHours(hour, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setHours(hour + 1, 0, 0, 0);

        // Skip slots in the past
        if (startDate < currentDate) continue;

        if (!this.isSlotOccupied(startDate, endDate, events)) {
          const title = !(isDoctorCalendar && isPersonalCalendar)
            ? '+ დაჯავშვნა'
            : '- დაბლოკვა';

          availableSlots.push({
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            display: 'background',
            title: title,
            isSlotAvailable: true,
          });
        }
      }
    });
    return availableSlots;
  }

  private isSlotOccupied(slotStart: any, slotEnd: any, events: any) {
    for (const event of events) {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);

      if (slotStart >= eventStart && slotEnd <= eventEnd) {
        return true;
      }
    }
    return false;
  }
  // events fetching ends here
}
