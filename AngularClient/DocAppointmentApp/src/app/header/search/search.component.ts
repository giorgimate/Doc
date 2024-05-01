import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryService } from 'src/app/_services/category.service';
import { UserService } from 'src/app/_services/user.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent {
  items!: any[];

  selectedName: any;
  selectedCategory: any;

  suggestions: any[] = [];
  categories: any[] = [];
  doctors: any[] = [];

  constructor(
    private userService: UserService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  searchByDoctorName(event: { query: string }) {
    this.userService
      .getDoctors({ limit: 10, offset: 0, name: event.query })
      .subscribe((doctors) => {
        this.doctors = doctors;
        this.suggestions = doctors.map(
          (doctor) => `${doctor.firstName} ${doctor.lastName}`
        );
      });
  }

  searchByCategory(event: { query: string }) {
    this.categoryService.getCategories(event.query).subscribe((categories) => {
      this.categories = categories;
      this.suggestions = categories.map((item) => item.name);
    });
  }

  clearInput(input: number) {
    if (input == 1) this.selectedName = undefined;
    if (input == 2) this.selectedCategory = undefined;
  }

  onCategorySelected(event: any) {
    const categoryName = event;
    // Find the category object from the categories array by its name
    const selectedCategory = this.categories.find(
      (category) => category.name === categoryName
    );

    if (selectedCategory) {
      // Navigate to the appropriate route using the category id
      this.router.navigate(['/doctors'], {
        queryParams: { categoryId: selectedCategory.id },
      });
    }
  }

  onDoctorSelected(event: any) {
    const fullName = event;
    // Find the doctor object from the doctors array by its full name
    const selectedDoctor = this.doctors.find(
      (doctor) => `${doctor.firstName} ${doctor.lastName}` === fullName
    );

    if (selectedDoctor) {
      // Navigate to the appropriate route using the doctor id
      this.router.navigate(['/booking', selectedDoctor.id]);
    }
  }

  searchByName() {
    if (this.selectedName) {
      this.router.navigate(['/doctors'], {
        queryParams: { name: this.selectedName },
      });
    }
  }
}
