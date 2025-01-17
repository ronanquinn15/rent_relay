import { Injectable } from '@angular/core';
import { AuthService } from './authService.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface DecodedToken extends JwtPayload {
  user: string;
  property_id: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private authService: AuthService,
              private http: HttpClient) {}

  getPropertyId(): string {
    const token = sessionStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode<DecodedToken>(token);
      return decodedToken.property_id;
    }
    return '';
  }

  getLoggedInUser(): string {
    const token = sessionStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode<DecodedToken>(token);
      return decodedToken.user;
    }
    return '';
  }

  getAssociatedUser(): Observable<string> {
    const propertyId = this.getPropertyId();
    const url = `http://127.0.0.1:5000/api/properties/${propertyId}`;
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'x-access-token': token || ''
    });
    return this.http.get<any>(url, { headers }).pipe(
      map((property: any) => {
        const loggedInUser = this.getLoggedInUser();
        if (this.authService.getUserRole() === 'landlord') {
          return property.tenant_id.$oid;
        } else {
          return property.landlord_id.$oid;
        }
      })
    );
  }

  isLandlord(): boolean {
    return this.authService.getUserRole() === 'landlord';
  }

  getPropertiesByLandlord(): Observable<any[]> {
    const url = `http://127.0.0.1:5000/api/properties`;
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'x-access-token': token || ''
    });
    return this.http.get<any[]>(url, { headers });
  }

  getPropertyById(propertyId: string): Observable<any> {
    const url = `http://127.0.0.1:5000/api/properties/${propertyId}`;
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'x-access-token': token || ''
    });
    return this.http.get<any>(url, { headers });
  }
}
