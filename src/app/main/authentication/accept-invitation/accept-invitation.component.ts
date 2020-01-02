import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { FuseConfigService } from '@fuse/services/config.service';
import { CommonAlertService } from 'app/shared/common-alert.service';
import { AuthenticationService } from 'app/services/authentication.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Router, ActivatedRoute } from '@angular/router';
import { confirmPasswordValidator } from '../register/register.component';
import { takeUntil } from 'rxjs/operators';
// import { tokenKey } from 'app/shared/common';
import { environment } from 'environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { StaffService } from 'app/services/staff.service';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { MatDialogRef, MatDialog } from '@angular/material';

@Component({
  selector: 'accept-invitation',
  templateUrl: './accept-invitation.component.html',
  styleUrls: ['./accept-invitation.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class AcceptInvitationComponent implements OnInit {
  acceptInvitationForm: FormGroup;

  languages: any;
  selectedLanguage: any;
  currentUser: any;
  sender: number;

  confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
  // Private
  private _unsubscribeAll: Subject<any>;
  /**
   * Constructor
   *
   * @param {FuseConfigService} _fuseConfigService
   * @param {FormBuilder} _formBuilder
   */
  constructor(
    private _fuseConfigService: FuseConfigService, private _formBuilder: FormBuilder,
    public authService: AuthenticationService, private router: Router, private commonAlertService: CommonAlertService,
    private _translateService: TranslateService, private _fuseTranslationLoaderService: FuseTranslationLoaderService,
    private staffService: StaffService,
    private _matDialog: MatDialog,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.queryParams.subscribe(params => {
      this.sender = parseInt(atob(params['from']));
      // console.log(this.sender);
    });

    this.currentUser = this.authService.currentUserValue;
    // Configure the layout
    this._fuseConfigService.config = {
      layout: {
        navbar: {
          hidden: true
        },
        toolbar: {
          hidden: true
        },
        footer: {
          hidden: true
        },
        sidepanel: {
          hidden: true
        }
      }
    };
    // Set the private defaults
    this._unsubscribeAll = new Subject();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {

    if (this.authService.isAuthenticated()) {
      // this.acceptInvitation();
    }

    this.acceptInvitationForm = this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  loginAndProcess(type) {
    if (this.acceptInvitationForm.valid) {

      this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
        disableClose: false
      });
      if (type == 'accept') {
        this.confirmDialogRef.componentInstance.confirmMessage = 'Can you only work for one employer at a time?';
      }
      else if (type == 'reject') {
        this.confirmDialogRef.componentInstance.confirmMessage = 'Do you really reject invitation?'
      }

      this.confirmDialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.authService.signinUser(this.acceptInvitationForm.value).then(async response => {
            localStorage.setItem(environment.tokenKey, JSON.stringify(response.user));
            this.authService.currentUserSubject.next(response.user);
            if (this.authService.isVerified() && type == "accept") {
              this.acceptInvitation();
            } else if (this.authService.isVerified() && type == "reject") {
              this.rejectInvitation();
            }
          }).catch(err => {
            if (err.code == '409') {
              // alertFunctions.typeWarning(err.code.toString(), err.message);
              this.commonAlertService.typeSuccess(err.code.toString(), err.message);
            } else {
              // alertFunctions.typeError(err.code.toString(), err.message);
              this.commonAlertService.typeSuccess(err.code.toString(), err.message);
            }
          });
        }
      });
    }
  }

  acceptInvitation() {
    this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
      disableClose: false
    });

    this.confirmDialogRef.componentInstance.confirmMessage = 'Can you only work for one employer at a time?';
    // this.confirmDialogRef.componentInstance.confirmMessage = 'Apa artinya buat anda jika menjadi staff?';

    this.confirmDialogRef.afterClosed().subscribe(result => {
      if (result) {

        this.staffService.acceptInvitation(this.sender).then(res => {
          // console.log("accept resposne:", res);
          if (!res) return;
          localStorage.setItem(environment.tokenKey, JSON.stringify(res[0]));
          this.authService.currentUserSubject.next(res[0]);
          this.commonAlertService.typeSuccess('Notification', 'You accepted invitation!');
          this.router.navigate(['/']);
        }).catch(error => {
          console.log("accept invitation error:", JSON.stringify(error));
          this.commonAlertService.typeSuccess('Error', JSON.stringify(error));
          this.router.navigate(['/']);
        });
      }
    });
  }

  rejectInvitation() {
    this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
      disableClose: false
    });

    this.confirmDialogRef.componentInstance.confirmMessage = 'Do you really reject invitation?';

    this.confirmDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.staffService.rejectInvitation(this.sender).then(res => {
          if (!res) return;
          localStorage.setItem(environment.tokenKey, JSON.stringify(res[0]));
          this.authService.currentUserSubject.next(res[0]);
          this.commonAlertService.typeSuccess('Notification', 'You rejected invitation!');
          this.router.navigate(['/']);
        }).catch(error => {
          console.log("accept invitation error:", JSON.stringify(error));
          this.commonAlertService.typeSuccess('Error', JSON.stringify(error));
          this.router.navigate(['/']);
        });
      }
    });
  }
}
