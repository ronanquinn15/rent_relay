import { Component, Inject, Output, EventEmitter } from '@angular/core';
import { WebService } from '../WebService/web.service';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { AsyncPipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { AuthService } from '../AuthenticationService/authService.component';

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

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  login() {
    this.router.navigate(['/login']);
  }

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
