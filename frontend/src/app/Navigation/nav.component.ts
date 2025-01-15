import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { AuthButtonComponent } from '../AuthenticationButton/authButton.component';
import { UserAuthComponent } from '../UserAuthentication/userAuth.component';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../Services/authService.service';

@Component({
  selector: 'navigation',
  imports: [RouterOutlet, RouterModule, UserAuthComponent, AuthButtonComponent, CommonModule],
  standalone: true,
  templateUrl: './nav.component.html'
})

export class NavigationComponent {
  userRole: string = '';
  title: string = '';
  isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.checkAuthStatus());

  constructor(private authService: AuthService) {}

  checkAuthStatus(): boolean {
    return !!sessionStorage.getItem('token');
  }

  updateAuthStatus() {
    this.isAuthenticated.next(this.checkAuthStatus());
    this.userRole = this.authService.getUserRole();
  }

  ngOnInit() {
    this.userRole = this.authService.getUserRole();
  }

}
