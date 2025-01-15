import { Component } from '@angular/core';
import { WebService } from '../Services/web.service';
import { FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-auth',
  templateUrl: './userAuth.component.html',
  styleUrls: ['./userAuth.component.css'],
  standalone: true,
  providers: [WebService, AsyncPipe, CommonModule],
  imports: [FormsModule]
})
export class UserAuthComponent {
  username: string = '';
  password: string = '';

  constructor(private webService: WebService) { }

  login() {
    this.webService.getLogin(this.username, this.password).subscribe(
      response => {
        console.log('Successfully Logged In', response);
        sessionStorage.setItem('token', response.token);
        sessionStorage.setItem('role', response.role);
        window.location.href = '/';

      },
      error => {
        console.error('Failed to Login', error);
      }
    );
  }
}
