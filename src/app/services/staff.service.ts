import { Injectable } from '@angular/core';
import { FeathersService } from './feathers.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { AuthenticationService } from './authentication.service';
// import { usersServiceName, tokenKey } from 'app/shared/common';
import { environment } from 'environments/environment';
import { usersServiceName } from 'app/shared/common';
import { takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StaffService implements Resolve<any> {

  acceptedStaffs: any[];
  acceptedStaffsCount: Number = 0;
  onAcceptedStaffsChanged: BehaviorSubject<any>;

  currentUser: any;

  // define pagination variables
  // acceptedSearchOption = { search: "", pageSize: 10, pageIndex: 0 };
  // onAcceptedSearchOptionChanged: BehaviorSubject<any>;

  // pendingSearchOption = { search: "", pageSize: 10, pageIndex: 0 };
  // onPendingSearchOptionChanged: BehaviorSubject<any>;

  private _unsubscribeAll: Subject<any>;
  staffService: any;

  constructor(private featherService: FeathersService, private authService: AuthenticationService) {
    this.staffService = featherService.service(usersServiceName);
    this.currentUser = this.authService.currentUserValue;
    // define subscription variables
    this.onAcceptedStaffsChanged = new BehaviorSubject([]);
    // this.onAcceptedSearchOptionChanged = new BehaviorSubject({ search: "", pageSize: 10, pageIndex: 0 });
    // Set the private defaults
    this._unsubscribeAll = new Subject();
  }

  getAcceptedStaff() {
    // console.log('getAcceptedStaff occured');
    this.currentUser = this.authService.currentUserValue;
    // console.log('staff service getacceptedstaff:', this.currentUser);
    if (!this.currentUser) { return; }
    this.acceptedStaffs = [];
    this.staffService.find({
      query: {
        $or: [
          { employerId: this.currentUser.id },
          { pengdingInvitationId: { $like: `%,${this.currentUser.id},%` } }
        ],
        paginate: false,
        // pengdingInvitationId: { $contains: [6] },
        // $limit: this.acceptedSearchOption.pageSize,
        // $skip: this.acceptedSearchOption.pageIndex * this.acceptedSearchOption.pageSize,
      }
    }).then(response => {
      // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>response.data stringify:', JSON.stringify(response.data));
      // this.acceptedStaffsCount = response.total;
      // this.acceptedStaffs = response.data;
      this.acceptedStaffsCount = response.length;
      this.acceptedStaffs = response;
      this.onAcceptedStaffsChanged.next(this.acceptedStaffs);
    }).catch(error => {
      console.error("get Staff error:", JSON.stringify(error));
    })
  }

  removeStaff(staffid): Promise<any> {
    if (!this.currentUser) return;
    if (!staffid) return;
    return new Promise((resolve, reject) => {
      this.staffService.patch(staffid, {
        employerId: staffid,
        // pengdingInvitationId: 0
      }).then(response => {
        this.getAcceptedStaff();
        // this.getPendingStaff();
        resolve(response);
      }).catch(error => {
        reject(error);
      })
    });
  }
  addNewStaff(email, data: string): Promise<any> {
    // console.log("this.currentUser:", this.currentUser);
    // console.log("email:", email);
    if (!this.currentUser) return;
    if (!email) return;
    if (!data) return;
    // console.log('>>>>>>>>>>>>>>> add new staff function data:', data);
    // data.push(this.currentUser.id);
    data += `${this.currentUser.id},`;
    return new Promise((resolve, reject) => {
      this.staffService.patch(null, {
        pengdingInvitationId: data,
        type: "newStaff," + this.currentUser.id,
      }, {
        query: { email: email }
      }).then(response => {
        resolve(response);
      }).catch(error => {
        reject(error);
      })
    });
  }

  isEmptyStaff(email): Promise<any> {
    if (!email) return;
    return new Promise((resolve, reject) => {
      this.staffService.find({
        query: {
          email: email,
          isVerified: 1
        }
      }
      ).then(response => {
        resolve(response);
      }).catch(error => {
        reject(error);
      })
    });
  }

  acceptInvitation(id): Promise<any> {
    this.currentUser = this.authService.currentUserValue;
    return new Promise((resolve, reject) => {
      // if (!this.currentUser) resolve("");
      if (!this.currentUser) {
        console.error('acceptInvitation error:>>>> non currentUser');
        reject('error-nonCurrentUser');
      }
      if (!id) {
        console.error('acceptInvitation error:>>>> Invalid sender id');
        reject('error-Invalid sender');
      }
      let invitation_str = this.currentUser.pengdingInvitationId;
      if (!invitation_str.includes(`,${id},`)) {
        console.error('acceptInvitation error:>>>> not include invitation code');
        reject('error-Invalid invitation');
      }
      let patch_data = invitation_str.replace(`,${id},`, ',');
      this.staffService.patch(null, {
        employerId: id,
        pengdingInvitationId: patch_data
      }, {
        query: { email: this.currentUser.email }
      }).then(response => {
        resolve(response);
      }).catch(error => {
        reject(error);
      })
    });
  }

  rejectInvitation(id): Promise<any> {
    this.currentUser = this.authService.currentUserValue;
    return new Promise((resolve, reject) => {
      if (!this.currentUser) {
        console.error('rejectInvitation error:>>>> non currentUser');
        reject('error-nonCurrentUser');
      }
      if (!id) {
        console.error('rejectInvitation error:>>>> Invalid sender id');
        reject('error-Invalid sender');
      }
      let invitation_str = this.currentUser.pengdingInvitationId;
      if (!invitation_str.includes(`,${id},`)) {
        console.error('rejectInvitation error:>>>> not include invitation code');
        reject('error-Invalid invitation');
      }
      let patch_data = invitation_str.replace(`,${id},`, ',');
      this.staffService.patch(null, {
        // employerId: 0,
        pengdingInvitationId: patch_data
      }, {
        query: { email: this.currentUser.email }
      }).then(response => {
        resolve(response);
      }).catch(error => {
        reject(error);
      })
      // }
    });
  }

  getStaffEvent() {
    this.staffService.on('patched', async (data) => {
      // if (this.currentUser.id == data.employerId) {
      // console.log('staff patched event emitter');
      this.getAcceptedStaff();

      if (this.currentUser.email == data.email) {
        localStorage.setItem(environment.tokenKey, JSON.stringify(data));
        this.authService.currentUserSubject.next(data);
        // console.log("data:", data);
      }
    });
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.getAcceptedStaff()
      ]).then(
        () => {
          resolve();
        },
        reject
      );
    });
  }

}
