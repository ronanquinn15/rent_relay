import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { WebService } from '../Services/web.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule],
  providers: [WebService]
})

export class RegisterComponent {
  user = {
    name: '',
    username: '',
    email: '',
    password: '',
    role: ''
  };
  errorMessage: string = '';

  constructor(private webService: WebService, private router: Router) {}

  onSubmit(registerForm: NgForm) {
    if (registerForm.valid) {
      this.webService.postRegister(this.user).subscribe(
        response => {
          console.log('User registered successfully', response);
          this.webService.getLogin(this.user.username, this.user.password).subscribe(
            loginResponse => {
              sessionStorage.setItem('token', loginResponse.token);
              this.router.navigate(['/']).then(() => {
                window.location.reload(); // Reload the page to load user details
              });
            },
            loginError => {
              console.error('Error logging in user', loginError);
              this.errorMessage = loginError.error.message; // Set the error message
            }
          );
        },
        error => {
          console.error('Error registering user', error);
          this.errorMessage = error.error.error; // Set the error message
        }
      );
    }
  }
}
