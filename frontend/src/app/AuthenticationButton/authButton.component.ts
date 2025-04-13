import { Component, Inject, Output, EventEmitter } from '@angular/core';
import { WebService } from '../Services/web.service';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { AsyncPipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { AuthService } from '../Services/authService.service';

// This component is responsible for managing the authentication button
// It handles user login and logout functionality

@Component({
  selector: 'auth-button',
  templateUrl: './authButton.component.html',
  styleUrls: ['./authButton.component.css'],
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  providers: [WebService]
})
export class AuthButtonComponent {
  @Output() authStatusChanged = new EventEmitter<void>();
  userRole: string = '';

  constructor(private webService: WebService, private router: Router, @Inject(DOCUMENT) private document: Document, private authService: AuthService) {
    this.userRole = this.authService.getUserRole();
  }

  // This method checks if the user is logged in
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  // This method navigates to the login page
  login() {
    this.router.navigate(['/login']);
  }

  // This method logs out the user
  // It calls the web service to perform the logout operation
  // After logging out, it navigates to the login page and emits an event to notify other components
  logout() {
    this.webService.getLogout().subscribe(
      resp => {
        this.authService.logout();
        this.router.navigate(['/login']);
        this.authStatusChanged.emit();
        console.log('Logged out');
      },
      error => {
        console.log('Error logging out');
      }
    );
  }
}
