import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PropertiesComponent } from './properties.component';
import { WebService } from '../Services/web.service';
import { of } from 'rxjs';
import { RouterOutlet, RouterModule } from '@angular/router';
import { AsyncPipe, CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import {HttpClientModule} from '@angular/common/http';

describe('PropertiesComponent', () => {
  let component: PropertiesComponent;
  let fixture: ComponentFixture<PropertiesComponent>;
  let webServiceSpy: jasmine.SpyObj<WebService>;

  const mockProperties = [
    { _id: '1', name: 'Property 1', address: '123 Main St', tenant: { name: 'John Doe' } },
    { _id: '2', name: 'Property 2', address: '456 Oak Ave', tenant: { name: 'Jane Smith' } }
  ];

  beforeEach(async () => {
    webServiceSpy = jasmine.createSpyObj('WebService', ['getPropertyWithTenants']);
    webServiceSpy.getPropertyWithTenants.and.returnValue(of(mockProperties));

    await TestBed.configureTestingModule({
      imports: [
        PropertiesComponent,
        RouterTestingModule,
        CommonModule,
        RouterOutlet,
        RouterModule,
        AsyncPipe,
        HttpClientModule
      ],
      providers: [
        { provide: WebService, useValue: webServiceSpy }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertiesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should track items by id', () => {
    const property = { _id: '123', name: 'Test Property' };
    expect(component.trackById(0, property)).toBe('123');
  });
});
