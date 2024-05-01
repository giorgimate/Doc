import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from 'src/app/_services/authentication.service';

@Component({
  selector: 'app-unauthorized-toast',
  templateUrl: './unauthorized-toast.component.html',
  styleUrls: ['./unauthorized-toast.component.css'],
})
export class UnauthorizedToastComponent {
  constructor(
    private messageService: MessageService,
    private authService: AuthenticationService
  ) {}

  showToast() {
    this.messageService.add({
      key: 'unauthorizedToast',
      summary: 'დასაჯავშნად გთხოვთ გაიაროთ',
      styleClass: 'bg-white w-20rem  border-round-lg',
      contentStyleClass:
        'flex-column align-items-center justify-content-between h-5rem',
      life: 5000,
      closable: false,
    });
  }

  openLoginDialog(): void {
    this.authService.triggerDisplayLoginDialog();
  }
}
