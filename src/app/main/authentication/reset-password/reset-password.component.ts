import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute } from '@angular/router';
import { CommonAlertService } from 'app/shared/common-alert.service';

import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { AuthenticationService } from 'app/services/authentication.service';
@Component({
    selector: 'reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
    resetPasswordForm: FormGroup;
    isSendingPassword: boolean = false;
    resetToken: string = "";

    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(
        private _fuseConfigService: FuseConfigService, private _formBuilder: FormBuilder,
        private activatedRoute: ActivatedRoute, private authService: AuthenticationService,
        private commonAlertService: CommonAlertService, private _fuseTranslationLoaderService: FuseTranslationLoaderService,
    ) {
        this.activatedRoute.paramMap.subscribe(map => {
            this.resetToken = map.get('resetToken');
        })
        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar: { hidden: true },
                toolbar: { hidden: true },
                footer: { hidden: true },
                sidepanel: { hidden: true }
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
        this.resetPasswordForm = this._formBuilder.group({
            password: ['', Validators.required],
            passwordConfirm: ['', [Validators.required, confirmPasswordValidator]]
        });

        // Update the validity of the 'passwordConfirm' field
        // when the 'password' field changes
        this.resetPasswordForm.get('password').valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this.resetPasswordForm.get('passwordConfirm').updateValueAndValidity();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    onSubmit() {
        if (this.resetPasswordForm.valid) {

            this.isSendingPassword = true;
            // this.resetPasswordForm.value['resetToken'] = this.resetToken;
            let dataset = {
                password: this.resetPasswordForm.value['password'],
                resetToken: this.resetToken
            };
            // console.log("this.resetpasswordform:", dataset);
            this.authService.sendResetPassword(dataset).then(response => {
                // console.log("Reset response:", response);
                if (response.resetResult.state == 1) {
                    this.commonAlertService.typeSuccess('success', 'Reseted your password. Please signin!');
                } else if (response.resetResult.state == 2) {
                    this.commonAlertService.typeSuccess('', response.resetResult.msg);
                } else if (response.resetResult.state == 3) {
                    this.commonAlertService.typeSuccess('failure', 'Because the token is deleted, cannot change your password.');
                } else if (response.resetResult.state == 4) {
                    this.commonAlertService.typeSuccess('', response.resetResult.msg);
                }
                this.isSendingPassword = false;
            }).catch(error => {
                console.log("Reset error:", error);
                // alertFunctions.typeError(error.code, error.message);
                this.commonAlertService.typeSuccess("Error", error.message);
                this.isSendingPassword = false;
            })
            this.resetPasswordForm.reset();
        }
    }
}

/**
 * Confirm password validator
 *
 * @param {AbstractControl} control
 * @returns {ValidationErrors | null}
 */
export const confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

    if (!control.parent || !control) {
        return null;
    }

    const password = control.parent.get('password');
    const passwordConfirm = control.parent.get('passwordConfirm');

    if (!password || !passwordConfirm) {
        return null;
    }

    if (passwordConfirm.value === '') {
        return null;
    }

    if (password.value === passwordConfirm.value) {
        return null;
    }

    return { passwordsNotMatching: true };
};
