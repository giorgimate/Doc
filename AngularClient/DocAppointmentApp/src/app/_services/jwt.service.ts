import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class JwtService {
  getDecodedToken() {
    var token = localStorage.getItem('jwt');
    if (token == null) return null;

    const helper = new JwtHelperService();
    const decodedToken = helper.decodeToken(token);
    return decodedToken;
  }

  getUserIdFromJwtToken() {
    const decodedToken = this.getDecodedToken();
    const userId =
      decodedToken[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ];
    return userId;
  }

  getUserRoleFromJwtToken() {
    const decodedToken = this.getDecodedToken();
    const userId =
      decodedToken[
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
      ];
    return userId;
  }
}
