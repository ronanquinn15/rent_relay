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

  // Used for AG-Grid
  getProperties(): Observable<any> {
    const url = 'http://127.0.0.1:5000/api/properties';
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

  getOneProperty(propertyId: string): Observable<any> {
    const url = 'http://127.0.0.1:5000/api/tenants/property/' + propertyId;
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'x-access-token': token || ''
    });
    return this.http.get(url, { headers });
  }

  updateProperty(propertyId: string, property: any): Observable<any> {
    let postData = new FormData();
    postData.append('address', property.address);
    postData.append('postcode', property.postcode);
    postData.append('city', property.city);
    postData.append('number_of_bedrooms', property.number_of_bedrooms);
    postData.append('number_of_bathrooms', property.number_of_bathrooms);
    postData.append('number_of_tenants', property.number_of_tenants);
    postData.append('rent', property.rent);
    postData.append('tenant_id', property.tenant_id);
    postData.append('purchase_date', property.purchase_date);
    const url = 'http://127.0.0.1:5000/api/properties/' + propertyId;
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'x-access-token': token || ''
    });
    return this.http.put(url, postData, { headers });
  }

  getMaintenanceRequests(): Observable<any> {
    const url = 'http://127.0.0.1:5000/api/maintenance';
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'x-access-token': token || ''
    });
    return this.http.get(url, { headers });
  }

}
