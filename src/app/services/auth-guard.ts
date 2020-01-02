import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private _router: Router,
    private authService: AuthenticationService
  ) { }
  canActivate() {
    if (this.authService.isAuthenticated()) {
      // console.log('Role:', this.authService.isRole());
      console.log('>>>>>>>>>>>>>> isAuthenticated');
      // return true;
      if (this.authService.isVerified()) {
        // if (this.authService.isRole() == 'employer') {
        //   return true;
        // } else {
        //   // console.log('========================forbid=========================')
        //   this._router.navigate(['/authentication/forbid']);
        //   return;
        // }
        return true;
      } else {
        // console.log(">>>>>>>>>not verified:", this.authService.isVerified());
        this._router.navigate(['/authentication/verify-confirm']);
        return false;
      }
    }

    this._router.navigate(['/authentication/login']);
    return false;

  }
}
