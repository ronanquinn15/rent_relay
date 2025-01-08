import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { AuthButtonComponent } from '../AuthenticationButton/authButton.component';
import { UserAuthComponent } from '../UserAuthentication/userAuth.component';
import { BehaviorSubject } from 'rxjs';
import { WebService } from '../WebService/web.service';

@Component({
  selector: 'navigation',
  imports: [RouterOutlet, RouterModule, UserAuthComponent, AuthButtonComponent],
  standalone: true,
  templateUrl: './nav.component.html'
})
export class NavigationComponent {
  title: string = '';
  isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.checkAuthStatus());

  constructor(private webService: WebService) {}

  checkAuthStatus(): boolean {
    return !!sessionStorage.getItem('token');
  }

  updateAuthStatus() {
    this.isAuthenticated.next(this.checkAuthStatus());
  }
}
