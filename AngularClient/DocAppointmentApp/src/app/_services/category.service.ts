import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CategoryWithDoctorsCountDto } from '../_interfaces/user/categoryWithDoctorsCountDto';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  constructor(private http: HttpClient) {}

  public getCategories(categoryName?: string) {
    const baseUrl = 'https://localhost:5001/api/Categories';
    const categoryNameParam = categoryName
      ? `?categoryName=${categoryName}`
      : '';
    const url = `${baseUrl}${categoryNameParam}`;
    return this.http.get<CategoryWithDoctorsCountDto[]>(url);
  }

  public postCategory(categoryName: string) {
    return this.http.post(
      `https://localhost:5001/api/Categories/?categoryName=${categoryName}`,
      null
    );
  }

  public putCategory(id: string, categoryName: string) {
    return this.http.put(
      `https://localhost:5001/api/Categories/${id}?categoryName=${categoryName}`,
      null
    );
  }

  public deleteCategory(id: string) {
    return this.http.delete(`https://localhost:5001/api/Categories/${id}`);
  }
}
