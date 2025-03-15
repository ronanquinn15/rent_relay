import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthButtonComponent } from './authButton.component';
import { WebService } from '../Services/web.service';
import { AuthService } from '../Services/authService.service';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { DOCUMENT } from '@angular/common';

describe('AuthButtonComponent', () => {
  let component: AuthButtonComponent;
  let fixture: ComponentFixture<AuthButtonComponent>;
  let webService: WebService;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    const webServiceMock = {
      getLogout: jasmine.createSpy('getLogout').and.returnValue(of({}))
    };

    const authServiceMock = {
      isLoggedIn: jasmine.createSpy('isLoggedIn').and.returnValue(true),
      getUserRole: jasmine.createSpy('getUserRole').and.returnValue('user'),
      logout: jasmine.createSpy('logout')
    };

    const routerMock = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [AuthButtonComponent, HttpClientModule],
      providers: [
        { provide: WebService, useValue: webServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: DOCUMENT, useValue: document }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthButtonComponent);
    component = fixture.componentInstance;
    webService = TestBed.inject(WebService);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call login method and navigate to login page', () => {
    component.login();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should return true if user is logged in', () => {
    expect(component.isLoggedIn()).toBeTrue();
  });

  it('should return false if user is not logged in', () => {
    (authService.isLoggedIn as jasmine.Spy).and.returnValue(false);
    expect(component.isLoggedIn()).toBeFalse();
  });
});
