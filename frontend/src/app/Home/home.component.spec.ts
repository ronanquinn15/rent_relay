import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { WebService } from '../Services/web.service';
import { AuthService } from '../Services/authService.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import {HttpClientModule} from '@angular/common/http';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let webService: WebService;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    const webServiceMock = {
      getTenantInfo: jasmine.createSpy('getTenantInfo').and.returnValue(of({
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe'
      })),
      getLandlordInfo: jasmine.createSpy('getLandlordInfo').and.returnValue(of({
        name: 'Jane Doe',
        email: 'jane@example.com',
        username: 'janedoe'
      })),
      getProperties: jasmine.createSpy('getProperties').and.returnValue(of([{
        address: '123 Main St',
        city: 'Sample City'
      }])),
      getPropertyRelatedToTenant: jasmine.createSpy('getPropertyRelatedToTenant').and.returnValue(of({
        address: '123 Main St',
        city: 'Sample City'
      }))
    };

    const authServiceMock = {
      isLoggedIn: jasmine.createSpy('isLoggedIn').and.returnValue(true),
      getUserRole: jasmine.createSpy('getUserRole').and.returnValue('landlord')
    };

    const routerMock = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [HomeComponent, HttpClientModule],
      providers: [
        { provide: WebService, useValue: webServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    webService = TestBed.inject(WebService);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should initialise isLoggedIn and userRole on init', () => {
    component.ngOnInit();
    expect(component.isLoggedIn).toBeTrue();
    expect(component.userRole).toBe('landlord');
  });

  it('should navigate to tenant edit page on editTenant call', () => {
    component.editTenant();
    expect(router.navigate).toHaveBeenCalledWith(['tenant-details/edit']);
  });

  it('should navigate to landlord edit page on editLandlord call', () => {
    component.editLandlord();
    expect(router.navigate).toHaveBeenCalledWith(['landlord-details/edit']);
  });

  it('should load tenant info on loadTenantInfo call', () => {
    component.loadTenantInfo();
    expect(component.tenantInfo).toEqual({
      name: 'John Doe',
      email: 'john@example.com',
      username: 'johndoe'
    });
  });

  it('should load landlord info on loadLandlordInfo call', () => {
    component.loadLandlordInfo();
    expect(component.landlordInfo).toEqual({
      name: 'Jane Doe',
      email: 'jane@example.com',
      username: 'janedoe'
    });
  });

  it('should load properties on loadProperties call', () => {
    component.loadProperties();
    expect(component.data).toEqual([{
      address: '123 Main St',
      city: 'Sample City'
    }]);
  });

  it('should load tenant property on loadTenantProperty call', () => {
    component.loadTenantProperty();
    expect(component.tenantProperty).toEqual({
      address: '123 Main St',
      city: 'Sample City'
    });
  });
});
