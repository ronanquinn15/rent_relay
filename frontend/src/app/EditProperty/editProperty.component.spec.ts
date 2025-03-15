import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditPropertyComponent } from './editProperty.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { WebService } from '../Services/web.service';

describe('EditPropertyComponent', () => {
  let component: EditPropertyComponent;
  let fixture: ComponentFixture<EditPropertyComponent>;
  let webServiceMock: any;
  let routerMock: any;

  beforeAll(async () => {
    webServiceMock = {
      getOneProperty: jasmine.createSpy('getOneProperty').and.returnValue(of({
        _id: '1',
        purchase_date: '2023/10/01',
        address: '123 Main St',
        postcode: '12345',
        city: 'Sample City',
        number_of_bedrooms: 3,
        number_of_bathrooms: 2,
        rent: 1500,
        number_of_tenants: 2,
        tenant_id: 'tenant123'
      })),
      updateProperty: jasmine.createSpy('updateProperty').and.returnValue(of({}))
    };

    routerMock = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule, HttpClientModule, EditPropertyComponent],
      providers: [
        { provide: WebService, useValue: webServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditPropertyComponent);
    component = fixture.componentInstance;

    // Call detectChanges after component creation to trigger lifecycle hooks
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
