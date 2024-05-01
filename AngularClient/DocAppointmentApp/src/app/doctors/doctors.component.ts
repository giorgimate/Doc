import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../_services/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-doctors',
  templateUrl: './doctors.component.html',
  styleUrls: ['./doctors.component.css'],
})
export class DoctorsComponent implements OnInit {
  categoryId?: string;
  name?: string;
  doctors: any[] = [];
  offset: number = 0;
  limit: number = 6; // Adjust this value based on your desired number of doctors per request
  lazyLoadingEnabled: boolean = false;
  expandButtonEnabled = true;

  constructor(
    private userService: UserService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const categoryId = params['categoryId'];
      const name = params['name'];

      if (categoryId) {
        this.categoryId = categoryId;
      }

      if (name) {
        this.name = name;
      }
      this.resetComponent();
      this.loadDoctors();
    });
  }

  loadDoctors() {
    this.userService
      .getDoctors({
        limit: this.limit,
        offset: this.offset,
        categoryId: this.categoryId,
        name: this.name,
      })
      .subscribe({
        next: (newDoctors) => {
          this.doctors = [...newDoctors];
          this.offset += this.limit;
          this.sortDoctors();
        },
      });
  }

  resetComponent() {
    this.offset = 0;
    this.lazyLoadingEnabled = false;
    this.expandButtonEnabled = true;
  }

  lazyLoadDoctors() {
    this.userService
      .getDoctors({
        limit: this.limit,
        offset: this.offset,
        categoryId: this.categoryId,
        name: this.name,
      })
      .subscribe({
        next: (newDoctors) => {
          this.doctors = [...this.doctors, ...newDoctors];
          this.offset += this.limit;
          this.sortDoctors();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status == 404) {
            this.lazyLoadingEnabled = false;
          }
        },
      });
  }

  enableLazyLoading() {
    this.lazyLoadingEnabled = true;
    this.expandButtonEnabled = false;
    this.loadMoreDoctors();
  }

  loadMoreDoctors() {
    if (!this.lazyLoadingEnabled) {
      return;
    }
    this.lazyLoadDoctors();
  }

  togglePin(doctor: any) {
    // Toggle the pinned state of the doctor
    doctor.pinned = !doctor.pinned;

    // Reorder the doctors array
    this.sortDoctors();
  }

  sortDoctors() {
    this.doctors.sort((a, b) => {
      if (a.pinned && !b.pinned) {
        return -1;
      } else if (!a.pinned && b.pinned) {
        return 1;
      } else {
        return b.viewCount - a.viewCount;
      }
    });
  }
}
