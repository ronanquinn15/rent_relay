import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PropertyComponent } from './property.component';
import { WebService } from '../Services/web.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';

describe('PropertyComponent', () => {
  let component: PropertyComponent;
  let fixture: ComponentFixture<PropertyComponent>;
  let webServiceSpy: jasmine.SpyObj<WebService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteSpy: any;

  const mockProperty = {
    _id: '123',
    name: 'Test Property',
    address: '123 Main St',
    tenant: { name: 'John Doe' }
  };

  beforeEach(async () => {
    webServiceSpy = jasmine.createSpyObj('WebService', ['getOneProperty', 'deleteProperty']);
    webServiceSpy.getOneProperty.and.returnValue(of(mockProperty));
    webServiceSpy.deleteProperty.and.returnValue(of({}));

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    activatedRouteSpy = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('123')
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [
        PropertyComponent,
        CommonModule,
        ReactiveFormsModule,
        HttpClientModule
      ],
      providers: [
        { provide: WebService, useValue: webServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertyComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle missing ID on initialization', () => {
    activatedRouteSpy.snapshot.paramMap.get.and.returnValue(null);
    spyOn(console, 'error');

    fixture.detectChanges();

    expect(webServiceSpy.getOneProperty).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Property ID not found in route parameters');
  });

  it('should navigate to edit page when navigateToEdit is called', () => {
    component.navigateToEdit();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/landlords/properties/123/edit']);
  });

  it('should handle missing ID when navigateToEdit is called', () => {
    activatedRouteSpy.snapshot.paramMap.get.and.returnValue(null);
    spyOn(console, 'error');

    component.navigateToEdit();

    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Property ID not found in route parameters');
  });

  it('should handle missing ID when deleting property', () => {
    activatedRouteSpy.snapshot.paramMap.get.and.returnValue(null);
    spyOn(console, 'error');

    component.deleteProperty();

    expect(webServiceSpy.deleteProperty).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Property ID not found in route parameters');
  });
});
