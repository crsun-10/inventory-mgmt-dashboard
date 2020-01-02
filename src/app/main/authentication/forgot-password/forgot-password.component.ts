import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { Router } from '@angular/router';
import { CommonAlertService } from 'app/shared/common-alert.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { AuthenticationService } from 'app/services/authentication.service';

@Component({
    selector: 'forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class ForgotPasswordComponent implements OnInit {
    forgotPasswordForm: FormGroup;
    isSendingResetLink: boolean = false;
    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     * @param {FormBuilder} _formBuilder
     */
    constructor(
        private _fuseConfigService: FuseConfigService, private _formBuilder: FormBuilder,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private authService: AuthenticationService, private commonAlertService: CommonAlertService, private router: Router,
    ) {
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
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.forgotPasswordForm = this._formBuilder.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }


    // On submit click, reset form fields
    onSubmit(formData) {
        this.isSendingResetLink = true;
        let dataSet = {
            email: formData.email,
            url: location.origin + "/authentication/reset-password"
        }
        this.authService.sendRecoveryCodeToMail(dataSet).then(response => {
            // this.commonAlertService.typeSuccess('success', 'Sent a recovery code to your email.');
            this.commonAlertService.typeSuccess('Berhasil', 'Link reset telah dikirim ke email anda');
            this.isSendingResetLink = false;
            this.forgotPasswordForm.reset();
        }).catch(error => {
            // alertFunctions.typeError(error.code, error.message);
            this.commonAlertService.typeSuccess(error.code, error.message);
            this.isSendingResetLink = false;
        });
    }
}
