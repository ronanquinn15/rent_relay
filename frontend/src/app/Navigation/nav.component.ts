import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { AuthButtonComponent } from '../AuthenticationButton/authButton.component';
import { UserAuthComponent } from '../UserAuthentication/userAuth.component';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../Services/authService.service';

// This component is responsible for managing the navigation bar

@Component({
  selector: 'navigation',
  imports: [RouterOutlet, RouterModule, UserAuthComponent, AuthButtonComponent, CommonModule],
  standalone: true,
  templateUrl: './nav.component.html'
})

export class NavigationComponent {
  // This property is used to store the user's role
  // It is used to determine the access level of the user
  // The role is fetched from the AuthService
  // The BehaviorSubject is used to manage the authentication status
  userRole: string = '';
  title: string = '';
  isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.checkAuthStatus());

  constructor(private authService: AuthService) {}

  // This method checks if the user is logged in
  // It checks if the token is present in session storage
  checkAuthStatus(): boolean {
    return !!sessionStorage.getItem('token');
  }

  // This method is called when the authentication status changes
  // It updates the authentication status in the BehaviorSubject
  updateAuthStatus() {
    this.isAuthenticated.next(this.checkAuthStatus());
    this.userRole = this.authService.getUserRole();
  }

  // This method is called when the component is initialised
  // It fetches the user's role from the AuthService
  ngOnInit() {
    this.userRole = this.authService.getUserRole();
  }

}
