import { Component, OnInit, ViewChild } from '@angular/core';
import { dA } from '@fullcalendar/core/internal-common';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { CategoryWithDoctorsCountDto } from 'src/app/_interfaces/user/categoryWithDoctorsCountDto';
import { UserDto } from 'src/app/_interfaces/user/userDto';
import { CategoryService } from 'src/app/_services/category.service';
import { UserService } from 'src/app/_services/user.service';

@Component({
  selector: 'app-admin-table',
  templateUrl: './admin-table.component.html',
  styleUrls: ['./admin-table.component.css'],
  providers: [ConfirmationService], // Add this line
})
export class AdminTableComponent {
  @ViewChild('dt') dt!: Table;

  // submitted!: boolean;
  editCategoryDialog!: boolean;
  addCategoryDialog!: boolean;

  isUserTable?: boolean;
  isCategoryTable?: boolean;
  users?: UserDto[];
  user?: UserDto;
  isDoctor?: boolean = true;
  categories?: CategoryWithDoctorsCountDto[];
  category?: CategoryWithDoctorsCountDto;
  categoryName?: string;

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private categoryService: CategoryService
  ) {}

  loadTable(query: string) {
    if (query === 'Category') {
      this.loadCategories();
      this.isCategoryTable = true;
      this.isUserTable = false;
    } else {
      this.loadUsersByRole(query);
      this.isUserTable = true;
      this.isCategoryTable = false;
    }
  }

  loadUsersByRole(query: string) {
    this.userService.GetUsers(query).subscribe((data) => (this.users = data));
  }

  loadCategories() {
    this.categoryService
      .getCategories()
      .subscribe((data) => (this.categories = data));
  }

  addUserButtonClick() {
    this.user = {} as UserDto;
    // this.submitted = false;
  }

  deleteUser(user: UserDto) {
    this.confirmationService.confirm({
      message:
        'გსურთ წაშალოთ მომხმარებელი ' +
        user.firstName +
        ' ' +
        user.lastName +
        '?',
      header: 'დაადასტურეთ',
      acceptLabel: 'დიახ',
      rejectLabel: 'არა',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.users = this.users!.filter((val) => val.id !== user.id);
            this.user = {} as UserDto;
            this.messageService.add({
              severity: 'success',
              detail: 'მომხმარებელი წაშლილია',
              life: 3000,
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              detail: 'დაფიქსირდა შეცდომა',
            });
          },
        });
      },
    });
  }

  editUser(user: UserDto) {}

  deleteCategory(category: CategoryWithDoctorsCountDto) {
    this.confirmationService.confirm({
      message: 'გსურთ წაშალოთ კატეგორია ' + category.name + ' ?',
      header: 'დაადასტურეთ',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'დიახ',
      rejectLabel: 'არა',
      accept: () => {
        this.categoryService.deleteCategory(category.id).subscribe({
          next: () => {
            this.categories = this.categories!.filter(
              (val) => val.id !== category.id
            );
            this.category = {} as CategoryWithDoctorsCountDto;

            this.messageService.add({
              severity: 'success',
              detail: 'კატეგორია წაშლილია',
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              detail: 'დაფიქსირდა შეცდომა',
            });
          },
        });
      },
    });
  }

  editCategoryButtonClick(category: CategoryWithDoctorsCountDto) {
    this.category = category;
    this.categoryName = category.name;
    this.editCategoryDialog = true;
  }
  editCategory() {
    this.hideDialog();
    this.categoryService
      .putCategory(this.category!.id, this.categoryName!)
      .subscribe({
        next: () => {
          this.loadCategories();
          this.category = {} as CategoryWithDoctorsCountDto;

          this.messageService.add({
            severity: 'success',
            detail: 'კატეგორია რედაქტირებულია',
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            detail: 'დაფიქსირდა შეცდომა',
          });
        },
      });
  }

  addCategoryButtonClick() {
    this.categoryName = '';
    this.addCategoryDialog = true;
  }

  addCategory() {
    this.hideDialog();
    this.categoryService.postCategory(this.categoryName!).subscribe({
      next: () => {
        this.loadCategories();
        this.category = {} as CategoryWithDoctorsCountDto;

        this.messageService.add({
          severity: 'success',
          detail: 'კატეგორია დამატებულია',
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          detail: 'დაფიქსირდა შეცდომა',
        });
      },
    });
  }

  hideDialog() {
    this.editCategoryDialog = false;
    this.addCategoryDialog = false;
  }

  filterGlobal(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.dt.filterGlobal(inputElement.value, 'contains');
  }
}
