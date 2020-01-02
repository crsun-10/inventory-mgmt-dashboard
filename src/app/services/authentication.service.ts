import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { FeathersService } from './feathers.service';
// import { tokenKey } from 'app/shared/common';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  public currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private router: Router, private featherService: FeathersService) {
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem(environment.tokenKey)));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): any { return this.currentUserSubject.value; }

  public get currentUserValueObservable(): any { return this.currentUserSubject.asObservable(); }

  /**
   * login to authenticate our site
   * @param authData 
   */
  async signinUser(authData) {
    return await this.featherService.authenticate(authData);
  }
  // async signinByGoogle(gmailInfo) {
  //   let signinByGoogle = this.featherService.service('login_by_google');
  //   return await signinByGoogle.find({ query: gmailInfo });
  // }
  // async signinByFacebook(fbInfo) {
  //   let signinByFB = this.featherService.service('login_by_facebook');
  //   return await signinByFB.find({ query: fbInfo });
  // }

  signupUser(formData) {
    let userService = this.featherService.service('users');
    return userService.create(formData);
  }
  // signupUser(formData): Promise<any> {
  //   let userService = this.featherService.service('users');
  //   // return userService.create(formData);
  //   return new Promise((resolve, reject) => {
  //     userService.create(formData)
  //       .then(response => {
  //         console.log('response:', response);
  //         resolve(response);
  //       }).catch(error => {
  //         console.log('error:', error);
  //         reject(error);
  //       })
  //   });
  // }

  async updateUser(userInfo, user_id) {
    let userService = this.featherService.service('users');
    return userService.patch(user_id, userInfo);
  }

  logout() {
    this.featherService.logout().then(response => {
      this.router.navigate(['authentication/login']);
      localStorage.removeItem(environment.tokenKey);
      this.currentUserSubject.next(null);
    }).catch(e => {
      console.error("logout error:", e);
    });
  }

  isAuthenticated() {
    return (this.currentUserValue !== null) ? true : false;
  }
  // isRole() {
  //   return (this.currentUserValue.employerId == 0 && this.currentUserValue.pengdingInvitationId == 0) ? 'employer' : 'staff';
  // }
  isVerified() {
    if (this.currentUserValue) {
      return this.currentUserValue.isVerified === 1;
    }
    return false;
  }

  sendVerifyCodeToEmailOrPhone(emailphone, receive_type = 'email') {
    if (receive_type == 'email') {
      let formData = {
        email: emailphone,
        type: 'verifyCode',
        receiver_type: receive_type
      }
      let sendEmailService = this.featherService.service('send_email');
      return sendEmailService.find({ query: formData });
    } else {
      let formData = {
        mobileNumber: emailphone,
        type: 'verifyCode',
        receiver_type: receive_type
      }
      let sendSMSService = this.featherService.service('send_sms');
      return sendSMSService.find({ query: formData });
    }
  }

  sendRecoveryCodeToMail(emailForm, receive_type = 'email') {
    let formData = {
      email: emailForm.email,
      type: 'resetPassword',
      receiver_type: receive_type,
      url: emailForm.url
    }
    let sendEmailService = this.featherService.service('send_email');
    return sendEmailService.find({ query: formData });
  }

  confirmVerifyCode(verifyData, receive_type = 'email') {
    verifyData.receiver_type = receive_type
    let sendEmailService = this.featherService.service('check_verify_code');
    return sendEmailService.find({ query: verifyData });
  }

  sendResetPassword(formData) {
    let sendEmailService = this.featherService.service('resetYourPassword');
    return sendEmailService.find({ query: formData });
  }
}
