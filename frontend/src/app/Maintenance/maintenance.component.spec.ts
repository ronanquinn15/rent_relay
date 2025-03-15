import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaintenanceComponent } from './maintenance.component';
import { WebService } from '../Services/web.service';
import { AuthService } from '../Services/authService.service';
import { of } from 'rxjs';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AsyncPipe, CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import {HttpClientModule} from '@angular/common/http';

describe('MaintenanceComponent', () => {
  let component: MaintenanceComponent;
  let fixture: ComponentFixture<MaintenanceComponent>;
  let webServiceSpy: jasmine.SpyObj<WebService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockLandlordRequests = [
    { _id: '1', title: 'Repair 1', description: 'Fix roof', status: true },
    { _id: '2', title: 'Repair 2', description: 'Fix door', status: false }
  ];

  const mockTenantRequests = [
    { _id: '3', title: 'Tenant Repair 1', description: 'Fix window', status: false },
    { _id: '4', title: 'Tenant Repair 2', description: 'Fix heating', status: true }
  ];

  beforeEach(async () => {
    webServiceSpy = jasmine.createSpyObj('WebService', [
      'getMaintenanceRequests',
      'getMaintenanceRequestsRelatedToTenant'
    ]);
    webServiceSpy.getMaintenanceRequests.and.returnValue(of(mockLandlordRequests));
    webServiceSpy.getMaintenanceRequestsRelatedToTenant.and.returnValue(of(mockTenantRequests));

    authServiceSpy = jasmine.createSpyObj('AuthService', ['getUserRole']);
    authServiceSpy.getUserRole.and.returnValue('landlord');

    await TestBed.configureTestingModule({
      imports: [
        MaintenanceComponent,
        RouterTestingModule,
        CommonModule,
        RouterOutlet,
        RouterModule,
        AsyncPipe,
        HttpClientModule
      ],
      providers: [
        { provide: WebService, useValue: webServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaintenanceComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should track items by id', () => {
    const request = { _id: '123', title: 'Test' };
    expect(component.trackById(0, request)).toBe('123');
  });

  it('should convert status correctly', () => {
    expect(component.getStatus(true)).toBe('Complete');
    expect(component.getStatus(false)).toBe('Pending');
  });

  it('should set userRole from authService', () => {
    authServiceSpy.getUserRole.and.returnValue('landlord');
    fixture.detectChanges();
    expect(component.userRole).toBe('landlord');
  });
});
