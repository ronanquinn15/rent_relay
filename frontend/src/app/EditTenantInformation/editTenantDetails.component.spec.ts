
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditTenantDetailsComponent } from './editTenantDetails.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { WebService } from '../Services/web.service';

describe('EditTenantDetailsComponent', () => {
  let component: EditTenantDetailsComponent;
  let fixture: ComponentFixture<EditTenantDetailsComponent>;
  let webService: WebService;
  let router: Router;

  beforeEach(async () => {
    const webServiceMock = {
      getTenantInfo: jasmine.createSpy('getTenantInfo').and.returnValue(of({
        _id: 'tenant123',
        name: 'John Doe',
        username: 'johndoe',
        email: 'johndoe@example.com'
      })),
      updateTenantInfo: jasmine.createSpy('updateTenantInfo').and.returnValue(of({}))
    };

    const routerMock = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientModule, EditTenantDetailsComponent],
      providers: [
        { provide: WebService, useValue: webServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'tenant123' } } } }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTenantDetailsComponent);
    component = fixture.componentInstance;
    webService = TestBed.inject(WebService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

it('should navigate to home on successful form submission', () => {
  component.tenantForm.setValue({
    name: 'Jane Doe',
    username: 'janedoe',
    email: 'janedoe@example.com',
    password: ''
  });
  component.onSubmit();
});

it('should not call updateTenantInfo if form is invalid', () => {
  component.tenantForm.setValue({
    name: '',
    username: '',
    email: 'invalid-email',
    password: ''
  });
  component.onSubmit();
  expect(webService.updateTenantInfo).not.toHaveBeenCalled();
});


it('should disable submit button if form is invalid', () => {
  component.tenantForm.setValue({
    name: '',
    username: '',
    email: 'invalid-email',
    password: ''
  });
  fixture.detectChanges();
  const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
  expect(submitButton.disabled).toBeTrue();
});

});
