import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../_services/user.service';
import { CategoryWithDoctorsCountDto } from '../_interfaces/user/categoryWithDoctorsCountDto';
import { CategoryService } from '../_services/category.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css'],
})
export class CategoriesComponent {
  categories: CategoryWithDoctorsCountDto[] = [];
  selectedIndex: number | null = null;
  showAll = false;

  constructor(private router: Router, private categoryService: CategoryService) {}

  ngOnInit() {
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        this.categories = res;
      },
    });
  }

  toggleCategories() {
    this.showAll = !this.showAll;
  }

  toggleSelected(index: number) {
    if (this.selectedIndex === index) {
      this.selectedIndex = null;
      this.router.navigate(['/doctors']);
    } else {
      this.selectedIndex = index;
      this.router.navigate(['/doctors'], { queryParams: { categoryId: this.categories[index].id } });
    }
  }
}
