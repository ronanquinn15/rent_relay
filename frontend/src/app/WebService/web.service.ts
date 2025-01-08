import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable, tap} from 'rxjs';

@Injectable()

export class WebService {

  constructor(private http: HttpClient) { }

  getLogin(username: string, password: string): Observable<any> {
    const url = 'http://127.0.0.1:5000/api/login';
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa(username + ':' + password)
    });
    return this.http.get(url, { headers }).pipe(
      tap((response: any) => {
        if (response.token) {
          sessionStorage.setItem('token', response.token);
        }
      })
    );
  }

  getLogout(): Observable<any> {
    const url = 'http://127.0.0.1:5000/api/logout';
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'x-access-token': token || ''
    });
    return this.http.get(url, { headers });
  }

  getProperties(): Observable<any> {
    const url = 'http://127.0.0.1:5000/api/properties';
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'x-access-token': token || ''
    });
    return this.http.get(url, { headers });
  }

  getMaintenanceRequests(): Observable<any> {
    const url = 'http://127.0.0.1:5000/api/maintenance';
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'x-access-token': token || ''
    });
    return this.http.get(url, { headers });
  }

  getPropertyWithTenants(): Observable<any> {
    const url = 'http://127.0.0.1:5000/api/tenants/property';
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'x-access-token': token || ''
    });
    return this.http.get(url, { headers });
  }

}
