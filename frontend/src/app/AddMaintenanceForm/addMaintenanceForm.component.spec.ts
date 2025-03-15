import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { AddMaintenanceFormComponent } from './addMaintenanceForm.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('AddMaintenanceFormComponent', () => {
  let component: AddMaintenanceFormComponent;
  let fixture: ComponentFixture<AddMaintenanceFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMaintenanceFormComponent, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMaintenanceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with default values', () => {
    expect(component.maintenanceForm).toBeDefined();
    expect(component.maintenanceForm.controls['urgency'].value).toEqual('');
    expect(component.maintenanceForm.controls['description'].value).toEqual('');
  });

  it('should mark the form as invalid if required fields are empty', () => {
    component.maintenanceForm.controls['urgency'].setValue('');
    component.maintenanceForm.controls['description'].setValue('');
    expect(component.maintenanceForm.valid).toBeFalsy();
  });

  it('should mark the form as valid if all fields are valid', () => {
    component.maintenanceForm.controls['urgency'].setValue('high');
    component.maintenanceForm.controls['description'].setValue('Valid description');
    expect(component.maintenanceForm.valid).toBeTruthy();
  });

  it('should call the submit method when form is submitted', () => {
    spyOn(component, 'onSubmit');
    const formElement = fixture.nativeElement.querySelector('form');
    formElement.dispatchEvent(new Event('submit'));

    expect(component.onSubmit).toHaveBeenCalled();
  });
});
