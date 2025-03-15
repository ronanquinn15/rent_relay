import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationComponent } from './nav.component';
import { AuthService } from '../Services/authService.service';
import { BehaviorSubject } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, RouterOutlet } from '@angular/router';
import { AuthButtonComponent } from '../AuthenticationButton/authButton.component';
import { UserAuthComponent } from '../UserAuthentication/userAuth.component';
import { Component } from '@angular/core';

// Mock components to avoid importing actual implementations
@Component({ selector: 'auth-button', template: '', standalone: true })
class MockAuthButtonComponent {}

@Component({ selector: 'user-auth', template: '', standalone: true })
class MockUserAuthComponent {}

describe('NavigationComponent', () => {
  let component: NavigationComponent;
  let fixture: ComponentFixture<NavigationComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getUserRole']);
    authServiceSpy.getUserRole.and.returnValue('landlord');

    const activatedRouteMock = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('1')
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        CommonModule,
        NavigationComponent
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    })
    .overrideComponent(NavigationComponent, {
      set: {
        imports: [
          RouterOutlet,
          RouterModule,
          CommonModule,
          MockUserAuthComponent,
          MockAuthButtonComponent
        ]
      }
    })
    .compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize userRole in ngOnInit', () => {
    component.ngOnInit();
    expect(component.userRole).toBe('landlord');
    expect(authService.getUserRole).toHaveBeenCalled();
  });

  it('should check authentication status correctly when token exists', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue('some-token');
    expect(component.checkAuthStatus()).toBeTrue();
    expect(sessionStorage.getItem).toHaveBeenCalledWith('token');
  });

  it('should check authentication status correctly when token does not exist', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue(null);
    expect(component.checkAuthStatus()).toBeFalse();
    expect(sessionStorage.getItem).toHaveBeenCalledWith('token');
  });

  it('should update authentication status and user role', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue('some-token');
    spyOn(component.isAuthenticated, 'next');

    component.updateAuthStatus();

    expect(component.isAuthenticated.next).toHaveBeenCalledWith(true);
    expect(authService.getUserRole).toHaveBeenCalled();
    expect(component.userRole).toBe('landlord');
  });
});
