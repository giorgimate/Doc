import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CategoryWithDoctorsCountDto } from '../_interfaces/user/categoryWithDoctorsCountDto';
import { UserDto } from '../_interfaces/user/userDto';
import { JwtService } from './jwt.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient, private jwtService: JwtService) {}

  public deleteUser(userId: string) {
    return this.http.delete(`https://localhost:5001/api/users/${userId}`);
  }

  GetUser() {
    const userId = this.jwtService.getUserIdFromJwtToken();
    return this.http.get<UserDto>(`https://localhost:5001/api/users/${userId}`);
  }

  GetUsers(role?: string) {
    const baseUrl = 'https://localhost:5001/api/users/';
    const url = role ? `${baseUrl}?role=${role}` : baseUrl;
    return this.http.get<UserDto[]>(url);
  }

  public getDoctor(id: string | null) {
    return this.http.get<UserDto>(
      `https://localhost:5001/api/Users/Doctors/${id}`
    );
  }

  public getDoctors({
    limit,
    offset,
    categoryId,
    name,
  }: {
    limit?: number;
    offset?: number;
    categoryId?: string;
    name?: string;
  }) {
    const baseUrl = 'https://localhost:5001/api/Users/Doctors';
    const queryParams: string[] = [];

    if (limit != undefined) {
      queryParams.push(`limit=${limit}`);
    }

    if (limit != undefined) {
      queryParams.push(`offset=${offset}`);
    }

    if (categoryId) {
      queryParams.push(`categoryId=${categoryId}`);
    }

    if (name) {
      queryParams.push(`name=${name}`);
    }

    const queryString =
      queryParams.length > 0 ? '?' + queryParams.join('&') : '';
    const url = `${baseUrl}${queryString}`;

    return this.http.get<UserDto[]>(url);
  }
}
