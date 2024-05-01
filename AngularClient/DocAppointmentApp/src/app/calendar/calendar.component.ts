import { ChangeDetectorRef, Component, Input, ViewChild } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import geLocale from '@fullcalendar/core/locales/ka';
import { EventImpl } from '@fullcalendar/core/internal';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { AppointmentManagementService } from './_services/appointments-management.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AppointmentDto } from '../_interfaces/user/appointmentDto';
import { UnauthorizedToastComponent } from './unauthorized-toast/unauthorized-toast.component';
import { AuthenticationService } from '../_services/authentication.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  providers: [],
})
export class CalendarComponent {
  @Input() isPersonalCalendar!: boolean;
  @Input() generateAvailableSlots!: boolean;
  @Input() isDoctorCalendar!: boolean;

  @ViewChild('unauthorizedToast')
  unauthorizedToast!: UnauthorizedToastComponent;

  editButtonDisabled = true;
  deleteButtonDisabled = true;
  dialogVisible = false;

  // event extendedProps : isSlotAvailable, isCurrentUserAppointment,
  // isEventSelected, isFullDayEvent, Description
  weekStartDate?: Date;
  selectedEvent?: EventImpl;
  appointmentDescription?: string;
  idOfCalendarOwner!: string;
  events!: any[];
  @ViewChild('calendarComponent') calendarComponent!: FullCalendarComponent;

  calendarOptions: CalendarOptions = {
    initialView: 'timeGridWeek',
    plugins: [interactionPlugin, timeGridPlugin],
    locale: geLocale,
    events: this.events,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: '',
    },
    titleFormat: {
      year: 'numeric',
      month: 'long',
    },
    dayHeaderContent: (args) => {
      const date = args.date;
      const day = args.date.getDate();
      const weekday = new Intl.DateTimeFormat(geLocale.code, {
        weekday: 'short',
      }).format(date);
      return `${day} ( ${weekday} )`;
    },
    allDaySlot: false,
    validRange: {
      end: this.getTwelveWeeksFromThisWeek(),
    },
    firstDay: 1, // Monday
    businessHours: {
      startTime: '09:00',
      endTime: '17:00',
      daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
    },
    slotMinTime: '09:00',
    slotMaxTime: '17:00',
    slotDuration: '01:00',
    slotLabelInterval: '01:00',
    slotLabelContent: (arg) => {
      const startTime = arg.date;
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1);
      return `${startTime.getHours()}:00 - ${endTime.getHours()}:00`;
    },
    expandRows: true,
    aspectRatio: 1.4,
    displayEventTime: false,
    eventClassNames: function (arg) {
      if (arg.event.extendedProps['isSlotAvailable']) {
        if (arg.event.extendedProps['isEventSelected'])
          return ['available-appointment event-selected'];
        return ['available-appointment'];
      }

      if (arg.event.extendedProps['isFullDayEvent']) return ['full-day-event'];

      if (arg.event.extendedProps['isCurrentUserAppointment']) {
        if (arg.event.extendedProps['isNonAvailableAppointment']) {
          if (arg.event.extendedProps['isEventSelected']) {
            return [
              'current-user-appointment non-available-event event-selected',
            ];
          }
          return ['current-user-appointment non-available-event'];
        }
        if (arg.event.extendedProps['isEventSelected']) {
          return ['current-user-appointment event-selected'];
        }
        return ['current-user-appointment'];
      } else return ['non-current-user-appointment'];
    },

    eventClick: (info) => {
      this.handleEventClick(info.event);
    },
    dateClick: (info) => {
      this.handleDateClick(info.date);
    },
    datesSet: (info) => this.handleWeekChange(info),
  };

  handleWeekChange(eventInfo: any): void {
    const startDate = eventInfo.start;
    const endDate = eventInfo.end;
    this.weekStartDate = startDate;
    console.log(
      'Week has changed. Start date:',
      startDate,
      'End date:',
      endDate
    );
    if (startDate > new Date()) this.ngOnInit();
  }

  // click handling starts here
  handleDateClick(date: Date) {
    if (!this.eventIsSelectedByClick(date)) {
      this.deselectEvents();
    }
  }

  eventIsSelectedByClick(date: Date) {
    return date.getTime() == this.selectedEvent?.start?.getTime();
  }

  handleEventClick(event: EventImpl) {
    this.deselectEvents(); // deselects all events

    if (event.extendedProps['isSlotAvailable'])
      return this.handleAvailableSlotEventClick(event);
    else if (event.extendedProps['isCurrentUserAppointment'])
      return this.handleCurrentUserAppointmentEventClick(event);
  }

  handleAvailableSlotEventClick(event: EventImpl) {
    // if non authorized
    if (!this.authService.isUserAuthenticated()) {
      this.unauthorizedToast.showToast();
    } else if (!event.extendedProps['isEventSelected']) {
      this.selectedEvent = event;
      event.setExtendedProp('isEventSelected', true);
      this.dialogVisible = true;
      if (this.isDoctorCalendar && this.isPersonalCalendar) {
        console.log(this.isDoctorCalendar, !this.isPersonalCalendar);
        this.setSlotAsUnavailable();
      }
    }
  }

  handleCurrentUserAppointmentEventClick(event: EventImpl) {
    // selects event if it was not selected earlier and enables buttons
    if (!event.extendedProps['isEventSelected']) {
      this.selectedEvent = event;
      event.setExtendedProp('isEventSelected', true);
      this.enableButtons();
    }
  }

  deselectEvents() {
    this.selectedEvent?.setExtendedProp('isEventSelected', false);
    this.disableButtons();
    this.dialogVisible = false;
    this.selectedEvent = undefined;
    this.appointmentDescription = undefined;
  }

  getCalendarEvents() {
    const calendarApi = this.calendarComponent.getApi();
    const events = calendarApi.getEvents();
    return events;
  }

  enableButtons() {
    this.editButtonDisabled = false;
    this.deleteButtonDisabled = false;
  }

  disableButtons() {
    this.editButtonDisabled = true;
    this.deleteButtonDisabled = true;
  }
  // click handling ends here

  // valid range starts here
  getStartOfWeek() {
    let date = new Date();
    const day = date.getDay();
    const startOfWeek = new Date(date);

    // Subtract the current day number to get the start of the week (Monday)
    startOfWeek.setDate(date.getDate() - day + 1);

    return startOfWeek;
  }

  getTwelveWeeksFromThisWeek() {
    const startOfWeek = this.getStartOfWeek();
    const twelveWeeksFromNow = new Date(startOfWeek);
    twelveWeeksFromNow.setDate(startOfWeek.getDate() + 83);
    return twelveWeeksFromNow;
  }
  // valid range ends here

  constructor(
    private appointmentManagementService: AppointmentManagementService,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
    private authService: AuthenticationService
  ) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.idOfCalendarOwner = params.get('id')!;
    });
  }

  ngOnInit(): void {
    this.disableButtons();
    this.appointmentManagementService.renderAppointments(
      this.idOfCalendarOwner,
      this.generateAvailableSlots,
      this.isDoctorCalendar,
      this.isPersonalCalendar,
      (allEvents) => {
        this.calendarOptions.events = allEvents;
      },
      this.weekStartDate
    );
  }

  deleteAppointment() {
    this.confirmationService.confirm({
      message: 'დარწმუნებული ხართ, რომ გსურთ ჯავშნის გაუქმება?',
      header: 'გაუქმების დადასტურება',
      icon: 'pi pi-info-circle',
      acceptLabel: 'დიახ',
      rejectLabel: 'არა',
      accept: () => {
        if (this.selectedEvent) {
          this.appointmentManagementService
            .deleteAppointment(this.selectedEvent)
            .subscribe({
              next: () => {
                this.messageService.add({
                  severity: 'success',
                  detail: 'ჯავშანი გაუქმებულია',
                });
                this.redirectTo(this.router.url);
              },
              error: () => {
                this.messageService.add({
                  severity: 'error',
                  detail: 'დაფიქსირდა შეცდომა',
                });
              },
            });
        }
      },
      reject: () => {
        this.deselectEvents();
      },
    });
  }

  editButtonClick() {
    this.dialogVisible = true;
    this.appointmentDescription =
      this.selectedEvent?.extendedProps['description'];
  }

  editAppointment() {
    if (this.selectedEvent) {
      const appointmentId = this.selectedEvent.id;
      const description = this.appointmentDescription?.trim();

      this.appointmentManagementService
        .putAppointments(appointmentId, description)
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              detail: 'აღწერა შეიცვალა',
            });
            this.redirectTo(this.router.url);
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              detail: 'დაფიქსირდა შეცდომა',
            });
          },
        });
    }
  }

  postAppointment() {
    if (this.selectedEvent) {
      this.appointmentManagementService
        .postAppointment(
          this.selectedEvent,
          this.idOfCalendarOwner,
          this.appointmentDescription
        )
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              detail: 'ვიზიტი დაჯავშნილია',
            });
            this.redirectTo(this.router.url);
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              detail: 'დაფიქსირდა შეცდომა',
            });
          },
        });
    }
  }

  dialogButtonClick() {
    if (this.selectedEvent?.extendedProps['isSlotAvailable'])
      this.postAppointment();
    else if (this.selectedEvent?.extendedProps['isCurrentUserAppointment'])
      this.editAppointment();

    this.dialogVisible = false;
    this.appointmentDescription = undefined;
  }

  dialogHeaderGenerate() {
    if (this.selectedEvent?.extendedProps['isCurrentUserAppointment'])
      return 'გსურთ ვიზიტის აღწერის რედაქტირება?';
    else return 'გსურთ ვიზიტის დაჯავნშნა?';
  }
  dialogButtonLabelGenerate() {
    if (this.selectedEvent?.extendedProps['isCurrentUserAppointment'])
      return 'რედაქტირება';
    else return 'დაჯავშვნა';
  }

  setSlotAsUnavailable() {
    this.confirmationService.confirm({
      message: 'დარწმუნებული ხართ, რომ გსურთ ინტერვალის მიუწვდომლად მონიშვნა?',
      header: 'მიუწვდომლად მონიშვნა',
      icon: 'pi pi-info-circle',
      acceptLabel: 'დიახ',
      rejectLabel: 'არა',
      accept: () => {
        if (this.selectedEvent) {
          this.appointmentManagementService
            .postNotAvailableAppointment(
              this.idOfCalendarOwner,
              this.selectedEvent.start!
            )
            .subscribe({
              next: () => {
                this.messageService.add({
                  severity: 'success',
                  detail: 'მიუწვდომლად მონიშნულია',
                });
                this.redirectTo(this.router.url);
              },
              error: () => {
                this.messageService.add({
                  severity: 'error',
                  detail: 'დაფიქსირდა შეცდომა',
                });
              },
            });
        }
      },
      reject: () => {
        this.deselectEvents();
      },
    });
  }

  redirectTo(uri: string) {
    this.router
      .navigateByUrl('/', { skipLocationChange: true })
      .then(() => this.router.navigate([uri]));
  }
}
