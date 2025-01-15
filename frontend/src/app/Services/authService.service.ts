import { Injectable } from '@angular/core';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { Router } from '@angular/router';

interface DecodedToken extends JwtPayload {
  role: string;
}

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  constructor(private router: Router) { }

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
    sessionStorage.clear()
    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }

  login(token: string) {
    sessionStorage.setItem('token', token);
  }

}
