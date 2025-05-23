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
  imports: [FormsModule, CommonModule]
})
export class UserAuthComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private webService: WebService) { }

  // Method to handle login
  // It calls the web service to authenticate the user
  login() {
    // Check if username and password are provided
    this.webService.getLogin(this.username, this.password).subscribe(
      response => {
        // If login is successful, store the token and role in session storage
        // The role is used to determine the user's access level
        console.log('Successfully Logged In', response);
        sessionStorage.setItem('token', response.token);
        sessionStorage.setItem('role', response.role);
        window.location.href = '/';

      },
      error => {
        console.error('Failed to Login', error);
        this.errorMessage = 'Username or Password is incorrect';
      }
    );
  }
}
