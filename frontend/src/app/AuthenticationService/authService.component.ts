import { Injectable } from '@angular/core';
import { jwtDecode, JwtPayload } from 'jwt-decode';

interface DecodedToken extends JwtPayload {
  role: string;
}

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  constructor() { }

  getUserRole(): string {
    const token = sessionStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode<DecodedToken>(token);
      return decodedToken.role;
    }
    return '';
  }

  isLoggedIn(): boolean {
    return !!sessionStorage.getItem('token');
  }

  logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userRole');
  }

  login(token: string) {
    sessionStorage.setItem('token', token);
  }

}
