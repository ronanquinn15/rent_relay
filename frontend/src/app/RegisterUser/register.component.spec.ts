import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { WebService } from '../Services/web.service';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import {HttpClientModule} from '@angular/common/http';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let webServiceMock: jasmine.SpyObj<WebService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Create mocks for WebService and Router
    webServiceMock = jasmine.createSpyObj('WebService', ['postRegister', 'getLogin']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    routerMock.navigate.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, HttpClientModule, CommonModule, FormsModule],
      providers: [
        { provide: WebService, useValue: webServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty user object and no error message', () => {
    expect(component.user).toEqual({
      name: '',
      username: '',
      email: '',
      password: '',
      role: ''
    });
    expect(component.errorMessage).toBe('');
  });

  it('should not submit form if form is invalid', () => {
    const invalidForm = { valid: false } as NgForm;
    component.onSubmit(invalidForm);

    expect(webServiceMock.postRegister).not.toHaveBeenCalled();
  });
});
