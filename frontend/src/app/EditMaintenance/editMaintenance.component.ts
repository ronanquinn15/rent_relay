import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WebService } from '../WebService/web.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-maintenance',
  templateUrl: './editMaintenance.component.html',
  styleUrls: ['./editMaintenance.component.css'],
  standalone: true,
  providers: [WebService],
  imports: [CommonModule, ReactiveFormsModule]
})
export class EditMaintenanceComponent implements OnInit {
  maintenanceForm: FormGroup;
  maintenanceId: string = '';
  maintenanceRequest: any;

  constructor(
    private webService: WebService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.maintenanceForm = this.fb.group({
      status: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
    this.maintenanceId = this.route.snapshot.paramMap.get('id') || '';
    this.webService.getOneMaintenanceRequest(this.maintenanceId).subscribe((data) => {
      this.maintenanceRequest = data;
      this.maintenanceForm.patchValue({
        status: data.status
      });
    });
  }

  getStatus(status: boolean): string {
    return status ? 'Completed' : 'Pending';
  }

  onSubmit(): void {
    if (this.maintenanceForm.valid) {
      const updatedRequest = {
        ...this.maintenanceRequest,
        status: this.maintenanceForm.value.status
      };
      this.webService.updateMaintenanceRequest(this.maintenanceId, updatedRequest).subscribe(() => {
        this.router.navigate(['/maintenance']);
      });
    }
  }
}
