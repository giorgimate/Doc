import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { Subscription } from 'rxjs';
import { UserDto } from 'src/app/_interfaces/user/userDto';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
})
export class MenuComponent implements OnInit {
  items!: MenuItem[];
  activeItem!: MenuItem;

  displayLogin = false;
  userLoggedIn = false;

  user?: UserDto;

  displayLoginDialogSubscription?: Subscription;
  routeSubscription?: Subscription;
  userDataSubscription?: Subscription;

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userLoggedIn = this.authService.isUserAuthenticated();

    this.userDataSubscription = this.authService.userData.subscribe(
      (userData) => {
        if (userData) {
          this.user = userData;
        }
      }
    );

    this.displayLoginDialogSubscription =
      this.authService.displayLoginDialog$.subscribe(() => {
        this.showLoginDialog();
      });

    this.routeSubscription = this.router.events.subscribe(() => {
      this.displayLogin = false;
    });

    this.items = [
      { label: 'ექიმები', routerLink: '/doctors' },
      { label: 'კლინიკები', routerLink: '/clinics' },
      { label: 'ანოტაციები', routerLink: '/annotations' },
      { label: 'აქციები', routerLink: '/actions' },
      { label: 'სერვისები', routerLink: '/services' },
      { label: 'მედიკამენტები', routerLink: '/medications' },
      { label: 'კონტაქტი', routerLink: '/contact' },
    ];
    this.activeItem = this.items[0];
  }

  ngOnDestroy() {
    if (this.displayLoginDialogSubscription) {
      this.displayLoginDialogSubscription.unsubscribe();
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }

    if (this.userDataSubscription) {
      this.userDataSubscription.unsubscribe();
    }
  }

  onActiveItemChange(event: any) {
    this.activeItem = event;
  }

  showLoginDialog() {
    this.displayLogin = true;
  }
  onLoginSuccess() {
    this.displayLogin = false;
    this.userLoggedIn = true;
  }

  logOut() {
    this.authService.logOut();
    this.userLoggedIn = false;
  }

  redirectTo() {
    let uri = '';
    if (this.authService.isUserAdmin()) {
      uri = '/admin';
    } else {
      uri = `/booking/${this.user?.id}`;
    }
    this.router
      .navigateByUrl('/', { skipLocationChange: true })
      .then(() => this.router.navigate([uri]));
  }
}
