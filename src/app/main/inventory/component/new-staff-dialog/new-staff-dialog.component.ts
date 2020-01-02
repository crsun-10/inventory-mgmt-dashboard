import { Component, OnInit, ViewEncapsulation, Inject, OnDestroy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { StaffService } from 'app/services/staff.service';
import { AuthenticationService } from 'app/services/authentication.service';
import { CommonAlertService } from 'app/shared/common-alert.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'new-staff-dialog',
  templateUrl: './new-staff-dialog.component.html',
  styleUrls: ['./new-staff-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})

export class NewStaffDialogComponent implements OnInit, OnDestroy {
  currentUser: any;
  isSelfEmail: boolean = false;
  isNotExistEmail: boolean = false;
  isAlreadyEmployeed: boolean = false;
  isAlreadyInvited: boolean = false;

  private _unsubscribeAll: Subject<any>;

  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: any,
    public matDialogRef: MatDialogRef<NewStaffDialogComponent>,
    private staffService: StaffService, private authService: AuthenticationService,
    private commonAlertService: CommonAlertService
  ) {
    this.currentUser = this.authService.currentUserValue;
    this._unsubscribeAll = new Subject();
  }

  ngOnInit() {
    // listen new staff email value changes
    this.emailFormControl.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.isNotExistEmail = false;
        this.isAlreadyEmployeed = false;
        this.isAlreadyInvited = false;
        this.isSelfEmail = false;
      });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  async onclickAdd() {
    if (this.emailFormControl.valid) {
      // console.log(this.emailFormControl.value);
      // 1 check itself
      if (this.currentUser.email === this.emailFormControl.value) {
        this.isNotExistEmail = false;
        this.isAlreadyEmployeed = false;
        this.isAlreadyInvited = false;
        this.isSelfEmail = true;
        return;
      }
      // 2. check email from database
      const isEmptyStaffRes = await this.staffService.isEmptyStaff(this.emailFormControl.value);
      if (!isEmptyStaffRes.total) { // check empty
        this.isNotExistEmail = true;
        this.isAlreadyEmployeed = false;
        this.isAlreadyInvited = false;
        this.isSelfEmail = false;
        return;
      }
      else if (isEmptyStaffRes.data[0].employerId === this.currentUser.id) { // check already employed
        this.isAlreadyEmployeed = true;
        this.isAlreadyInvited = false;
        this.isNotExistEmail = false;
        this.isSelfEmail = false;
        return;
      }
      else if (isEmptyStaffRes.data[0].pengdingInvitationId.includes(`,${this.currentUser.id},`)) { //check already invited
        this.isAlreadyInvited = true;
        this.isAlreadyEmployeed = false;
        this.isNotExistEmail = false;
        this.isSelfEmail = false;
        return;
      } else {
        // console.log("add new staff!!!");
        const patchData = isEmptyStaffRes.data[0].pengdingInvitationId;
        // console.log('staff patch data', _pendingIdArr);
        this.staffService.addNewStaff(this.emailFormControl.value, patchData).then(response => {
          // this.commonAlertService.typeSuccess("Success", "Send invitation email!");
          this.commonAlertService.typeSuccess("Berhasil", "Undangan telah dikirim ke email anda");
          this.matDialogRef.close(['add', this.emailFormControl.value]);
        }).catch(error => {
          console.log(" add new staff error:", error);
        });
      }
    }
  }

}
