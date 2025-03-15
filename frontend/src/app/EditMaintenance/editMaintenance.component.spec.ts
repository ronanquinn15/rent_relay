import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditMaintenanceComponent } from './editMaintenance.component';
import { WebService } from '../Services/web.service';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {HttpClientModule} from '@angular/common/http';

describe('EditMaintenanceComponent', () => {
  let component: EditMaintenanceComponent;
  let fixture: ComponentFixture<EditMaintenanceComponent>;
  let webService: WebService;
  let router: Router;

  beforeEach(async () => {
    const webServiceMock = {
      getOneMaintenanceRequest: jasmine.createSpy('getOneMaintenanceRequest').and.returnValue(of({
        _id: '1',
        status: true
      })),
      updateMaintenanceRequest: jasmine.createSpy('updateMaintenanceRequest').and.returnValue(of({}))
    };

    const routerMock = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, EditMaintenanceComponent, HttpClientModule],
      providers: [
        { provide: WebService, useValue: webServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditMaintenanceComponent);
    component = fixture.componentInstance;
    webService = TestBed.inject(WebService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should not call updateMaintenanceRequest if form is invalid', () => {
    component.maintenanceForm.setValue({
      status: false
    });
    fixture.detectChanges();
    component.onSubmit();
    expect(webService.updateMaintenanceRequest).not.toHaveBeenCalled();
  });
});
