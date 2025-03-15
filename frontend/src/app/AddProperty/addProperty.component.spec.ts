import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { AddPropertyComponent } from './addProperty.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { WebService } from '../Services/web.service';
import { of, throwError } from 'rxjs';

describe('AddPropertyComponent', () => {
  let component: AddPropertyComponent;
  let fixture: ComponentFixture<AddPropertyComponent>;
  let webService: WebService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPropertyComponent, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule],
      providers: [WebService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPropertyComponent);
    component = fixture.componentInstance;
    webService = TestBed.inject(WebService);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with default values', () => {
    expect(component.addPropertyForm).toBeDefined();
    expect(component.addPropertyForm.controls['address'].value).toEqual('');
    expect(component.addPropertyForm.controls['city'].value).toEqual('');
    expect(component.addPropertyForm.controls['postcode'].value).toEqual('');
    expect(component.addPropertyForm.controls['number_of_bedrooms'].value).toEqual('');
    expect(component.addPropertyForm.controls['number_of_bathrooms'].value).toEqual('');
    expect(component.addPropertyForm.controls['rent'].value).toEqual('');
    expect(component.addPropertyForm.controls['purchase_date'].value).toEqual('');
    expect(component.addPropertyForm.controls['tenant_id'].value).toEqual('');
  });

  it('should mark the form as invalid if required fields are empty', () => {
    component.addPropertyForm.controls['address'].setValue('');
    component.addPropertyForm.controls['city'].setValue('');
    component.addPropertyForm.controls['postcode'].setValue('');
    component.addPropertyForm.controls['number_of_bedrooms'].setValue('');
    component.addPropertyForm.controls['number_of_bathrooms'].setValue('');
    component.addPropertyForm.controls['rent'].setValue('');
    component.addPropertyForm.controls['purchase_date'].setValue('');
    component.addPropertyForm.controls['tenant_id'].setValue('');
    expect(component.addPropertyForm.valid).toBeFalsy();
  });

  it('should mark the form as valid if all fields are valid', () => {
    component.addPropertyForm.controls['address'].setValue('123 Main St');
    component.addPropertyForm.controls['city'].setValue('Anytown');
    component.addPropertyForm.controls['postcode'].setValue('12345');
    component.addPropertyForm.controls['number_of_bedrooms'].setValue(3);
    component.addPropertyForm.controls['number_of_bathrooms'].setValue(2);
    component.addPropertyForm.controls['rent'].setValue(1500);
    component.addPropertyForm.controls['purchase_date'].setValue('2023-01-01');
    component.addPropertyForm.controls['tenant_id'].setValue('tenant123');
    expect(component.addPropertyForm.valid).toBeTruthy();
  });

  it('should call the submit method when form is submitted', () => {
    spyOn(component, 'onSubmit');
    const formElement = fixture.nativeElement.querySelector('form');
    formElement.dispatchEvent(new Event('submit'));

    expect(component.onSubmit).toHaveBeenCalled();
  });
});
