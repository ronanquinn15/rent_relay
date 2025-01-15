import { Component, OnInit } from '@angular/core';
import { WebService } from '../WebService/web.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-tenant-details',
  templateUrl: './editTenantDetails.component.html',
  styleUrls: ['./editTenantDetails.component.css'],
  providers: [WebService],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class EditTenantDetailsComponent implements OnInit {
  tenantForm: FormGroup;
  tenantId: string = '';

  constructor(private webService: WebService, private route: ActivatedRoute, private router: Router) {
    this.tenantForm = new FormGroup({
      name: new FormControl('', Validators.required),
      username: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('')
    });
  }

  ngOnInit() {
    this.loadTenantDetails();
  }

  loadTenantDetails() {
    this.webService.getTenantInfo().subscribe((tenant) => {
      this.tenantId = tenant._id;
      this.tenantForm.patchValue({
        name: tenant.name,
        username: tenant.username,
        email: tenant.email
      });
    });
  }

  onSubmit() {
    if (this.tenantForm.valid) {
      this.webService.updateTenantInfo(this.tenantId, this.tenantForm.value).subscribe(response => {
        console.log('Tenant details updated successfully', response);
        this.router.navigate(['/']);
      }, error => {
        console.error('Error updating tenant details', error);
      });
    }
  }
}
