import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaintenanceViewComponent } from './maintenanceView.component';
import { WebService } from '../Services/web.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../Services/authService.service';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import {HttpClientModule} from '@angular/common/http';

describe('MaintenanceViewComponent', () => {
  let component: MaintenanceViewComponent;
  let fixture: ComponentFixture<MaintenanceViewComponent>;
  let webServiceSpy: jasmine.SpyObj<WebService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteSpy: any;

  const mockMaintenanceRequest = {
    _id: '123',
    title: 'Fix Roof',
    description: 'Roof is leaking',
    status: false
  };

  beforeEach(async () => {
    webServiceSpy = jasmine.createSpyObj('WebService', [
      'getOneMaintenanceRequest',
      'getOneMaintenanceRequestRelatedToTenant',
      'deleteMaintenanceRequest'
    ]);
    webServiceSpy.getOneMaintenanceRequest.and.returnValue(of(mockMaintenanceRequest));
    webServiceSpy.getOneMaintenanceRequestRelatedToTenant.and.returnValue(of(mockMaintenanceRequest));
    webServiceSpy.deleteMaintenanceRequest.and.returnValue(of({}));

    authServiceSpy = jasmine.createSpyObj('AuthService', ['getUserRole']);
    authServiceSpy.getUserRole.and.returnValue('landlord');

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    activatedRouteSpy = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('123')
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [MaintenanceViewComponent, CommonModule, HttpClientModule],
      providers: [
        { provide: WebService, useValue: webServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaintenanceViewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to edit page when navigateToEdit is called', () => {
    component.maintenanceRequest = mockMaintenanceRequest;
    component.navigateToEdit();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/maintenance/123/edit']);
  });

  it('should not navigate if maintenance request is undefined', () => {
    component.maintenanceRequest = undefined;
    component.navigateToEdit();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should handle missing ID when deleting maintenance request', () => {
    spyOn(console, 'error');
    activatedRouteSpy.snapshot.paramMap.get.and.returnValue(null);

    component.deleteMaintenanceRequest();

    expect(console.error).toHaveBeenCalledWith('Maintenance Request ID not found in route parameters');
    expect(webServiceSpy.deleteMaintenanceRequest).not.toHaveBeenCalled();
  });

  it('should return correct id in trackById', () => {
    const request = { _id: '123', title: 'Test' };
    expect(component.trackById(0, request)).toBe('123');
  });

  it('should return correct status string', () => {
    expect(component.getStatus(true)).toBe('Complete');
    expect(component.getStatus(false)).toBe('Pending');
  });
});
