import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable, tap} from 'rxjs';

@Injectable()

export class WebService {

  constructor(private http: HttpClient) { }

  // Login endpoint which sends a GET request to the server
  getLogin(username: string, password: string): Observable<any> {
    const url = 'http://127.0.0.1:5000/api/login';
    // Basic authentication
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa(username + ':' + password)
    });
    // Return the token from the server
    return this.http.get(url, { headers }).pipe(
      tap((response: any) => {
        if (response.token) {
          sessionStorage.setItem('token', response.token);
        }
      })
    );
  }

  // Logout endpoint which sends a GET request to the server
  getLogout(): Observable<any> {
    const url = 'http://127.0.0.1:5000/api/logout';
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'x-access-token': token || ''
    });
    // Return the response from the server
    return this.http.get(url, { headers });
  }

  // GET all properties uploaded by a landlord - Used for AG-Grid
  // Landlord endpoint
  getProperties(): Observable<any> {
    const url = 'http://127.0.0.1:5000/api/properties';
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'x-access-token': token || ''
    });
    return this.http.get(url, { headers });
  }

  // GET all properties details uploaded by a landlord
  // Landlord endpoint
  getPropertyWithTenants(): Observable<any> {
    const url = 'http://127.0.0.1:5000/api/tenants/property';
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'x-access-token': token || ''
    });
    return this.http.get(url, { headers });
  }

  // GET one property uploaded by a landlord
  // Landlord endpoint
  getOneProperty(propertyId: string): Observable<any> {
    const url = 'http://127.0.0.1:5000/api/tenants/property/' + propertyId;
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'x-access-token': token || ''
    });
    return this.http.get(url, { headers });
  }

  // POST a new property uploaded by a landlord
  // Landlord endpoint
  addProperty(property: any): Observable<any> {
    let postData = new FormData();
    postData.append('address', property.address);
    postData.append('postcode', property.postcode);
    postData.append('city', property.city);
    postData.append('number_of_bedrooms', property.number_of_bedrooms);
    postData.append('number_of_bathrooms', property.number_of_bathrooms);
    postData.append('rent', property.rent);
    postData.append('purchase_date', property.purchase_date);
    postData.append('tenant_id', property.tenant_id);
    const url = 'http://127.0.0.1:5000/api/properties/add';
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'x-access-token': token || ''
    });
    return this.http.post(url, postData, { headers });
  }

  // PUT an updated property uploaded by a landlord
  // Landlord endpoint
  updateProperty(propertyId: string, property: any): Observable<any> {
    let postData = new FormData();
    postData.append('address', property.address);
    postData.append('postcode', property.postcode);
    postData.append('city', property.city);
    postData.append('number_of_bedrooms', property.number_of_bedrooms);
    postData.append('number_of_bathrooms', property.number_of_bathrooms);
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

  // DELETE a property uploaded by a landlord
  // Landlord endpoint
  deleteProperty(propertyId: string): Observable<any> {
    const url = 'http://127.0.0.1:5000/api/properties/' + propertyId;
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'x-access-token': token || ''
    });
    return this.http.delete(url, { headers });
  }

  // GET all maintenance requests assigned to a property related to landlord
  // Landlord endpoint
  getMaintenanceRequests(): Observable<any> {
    const url = 'http://127.0.0.1:5000/api/maintenance';
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'x-access-token': token || ''
    });
    return this.http.get(url, { headers });
  }

  // GET one maintenance requests assigned to a property related to landlord
  // Landlord endpoint
  getOneMaintenanceRequest(maintenanceId: string): Observable<any> {
    const url = 'http://127.0.0.1:5000/api/maintenance/details/' + maintenanceId;
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'x-access-token': token || ''
    });
    return this.http.get(url, {headers});
  }

  // PUT an updated maintenance request assigned to a property related to landlord
  // Landlord endpoint
  updateMaintenanceRequest(maintenanceId: string, maintenance: any): Observable<any> {
    let postData = new FormData();
    postData.append('status', maintenance.status);
    const url = 'http://127.0.0.1:5000/api/maintenance/' + maintenanceId;
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'x-access-token': token || ''
    });
    return this.http.put(url, postData, { headers });
  }

  // GET tenant details based on logged in user
  // Tenant endpoint
  getTenantInfo(): Observable<any> {
    const url = 'http://127.0.0.1:5000/api/tenant/info';
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'x-access-token': token || ''
    });
    return this.http.get(url, { headers });
  }

  // GET property and landlord details related to Tenant ID
  // Tenant endpoint
  getPropertyRelatedToTenant(): Observable<any> {
    const url = 'http://127.0.0.1:5000/api/tenant/property/details';
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'x-access-token': token || ''
    });
    return this.http.get(url, { headers });
  }

  // GET all maintenance requests assigned to a property related to tenant
  // Tenant endpoint
  getMaintenanceRequestsRelatedToTenant(): Observable<any> {
    const url = 'http://127.0.0.1:5000/api/maintenance/submitted';
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'x-access-token': token || ''
    });
    return this.http.get(url, { headers });
  }

  // GET one maintenance request assigned to a property related to tenant
  // Tenant endpoint
  getOneMaintenanceRequestRelatedToTenant(maintenanceId: string): Observable<any> {
    const url = 'http://127.0.0.1:5000/api/maintenance/submitted/' + maintenanceId;
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'x-access-token': token || ''
    });
    return this.http.get(url, {headers});
  }

  // POST a new maintenance request assigned to a property related to tenant
  // Tenant endpoint
  addMaintenanceRequest(maintenance: any): Observable<any> {
    let postData = new FormData();
    postData.append('urgency', maintenance.urgency);
    postData.append('description', maintenance.description);
    const url = 'http://127.0.0.1:5000/api/maintenance/submit';
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'x-access-token': token || ''
    });
    return this.http.post(url, postData, {headers});
  }

  // DELETE a maintenance request assigned to a property related to tenant
  // Tenant endpoint
  deleteMaintenanceRequest(maintenanceId: string): Observable<any> {
    const url = 'http://127.0.0.1:5000/api/maintenance/' + maintenanceId;
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'x-access-token': token || ''
    });
    return this.http.delete(url, {headers});
  }

  // PUT for updating tenant information
  // Tenant endpoint
  updateTenantInfo(tenant_id: string, tenant: any): Observable<any> {
    let postData = new FormData();
    postData.append('name', tenant.name);
    postData.append('email', tenant.email);
    postData.append('username', tenant.username);
    postData.append('password', tenant.password);
    const url = 'http://127.0.0.1:5000/api/tenants/' + tenant_id;
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'x-access-token': token || ''
    });
    return this.http.put(url, postData, {headers});
  }

}
