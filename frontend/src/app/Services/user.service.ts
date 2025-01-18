import { Injectable } from '@angular/core';
import { AuthService } from './authService.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface DecodedToken extends JwtPayload {
  user_id: string;
  user: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private authService: AuthService,
              private http: HttpClient) {}

  getLoggedInUserId(): string {
    const token = sessionStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode<DecodedToken>(token);
      return decodedToken.user_id;
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

  getPropertiesByLandlord(): Observable<any[]> {
  const url = `http://127.0.0.1:5000/api/properties`;
  const token = sessionStorage.getItem('token');
  const headers = new HttpHeaders({
    'x-access-token': token || ''
  });
  return this.http.get<any[]>(url, { headers }).pipe(
    map(properties => properties.map(property => ({
      ...property,
      address: property.address // Ensure address is included
    })))
  );
}

  getPropertyById(propertyId: string): Observable<any> {
    const url = `http://127.0.0.1:5000/api/properties/${propertyId}`;
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'x-access-token': token || ''
    });
    return this.http.get<any>(url, { headers });
  }

  getTenantPropertyID(): Observable<string> {
    const userId = this.getLoggedInUserId();
    const url = `http://127.0.0.1:5000/api/tenant/${userId}/property`;
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'x-access-token': token || ''
    });
    return this.http.get<any>(url, { headers }).pipe(
      map((response) => {
        return response.property_id;
      })
    );
  }

}
