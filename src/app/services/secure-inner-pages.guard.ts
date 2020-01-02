import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import { CommonAlertService } from 'app/shared/common-alert.service';


@Injectable({
  providedIn: 'root'
})

export class SecureInnerPagesGuard implements CanActivate {

  constructor(public authenticationService: AuthenticationService, public router: Router, private commonAlertService: CommonAlertService) {

  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authenticationService.isAuthenticated()) {
      this.commonAlertService.typeError('Error', 'You are not allowed to access this URL!', 6000);
      this.router.navigate(['/']);
    }
    return true;
  }

}