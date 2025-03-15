import {ComponentFixture, TestBed} from '@angular/core/testing';
import {EditLandlordDetailsComponent} from './editLandlordDetails.component';
import {WebService} from '../Services/web.service';
import {of, throwError} from 'rxjs';
import {ReactiveFormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpClientModule} from '@angular/common/http';

describe('EditLandlordDetailsComponent', () => {
  let component: EditLandlordDetailsComponent;
  let fixture: ComponentFixture<EditLandlordDetailsComponent>;
  let webService: WebService;
  let router: Router;

  beforeEach(async () => {
    const webServiceMock = {
      getLandlordInfo: jasmine.createSpy('getLandlordInfo').and.returnValue(of({
        _id: '1',
        name: 'Landlord Name',
        username: 'landlord',
        email: 'landlord@example.com'
      })),
      updateLandlordInfo: jasmine.createSpy('updateLandlordInfo').and.returnValue(of({}))
    };

    const routerMock = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, EditLandlordDetailsComponent, HttpClientModule],
      providers: [
        {provide: WebService, useValue: webServiceMock},
        {provide: Router, useValue: routerMock},
        {provide: ActivatedRoute, useValue: {snapshot: {params: {}}}}
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditLandlordDetailsComponent);
    component = fixture.componentInstance;
    webService = TestBed.inject(WebService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should not call updateLandlordInfo if form is invalid', () => {
    component.landlordForm.setValue({
      name: '',
      username: '',
      email: 'invalidemail',
      password: ''
    });
    fixture.detectChanges();
    component.onSubmit();
    expect(webService.updateLandlordInfo).not.toHaveBeenCalled();
  });
});
