import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { Router } from '@angular/router';
import { CommonAlertService } from 'app/shared/common-alert.service';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { AuthenticationService } from 'app/services/authentication.service';
// import { tokenKey } from 'app/shared/common';
import { environment } from 'environments/environment';

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;

    languages: any;
    selectedLanguage: any;
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
        private authService: AuthenticationService, private router: Router, private commonAlertService: CommonAlertService,
        private _translateService: TranslateService, private _fuseTranslationLoaderService: FuseTranslationLoaderService,
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
        this.loginForm = this._formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    onSubmit() {
        if (this.loginForm.valid) {
            this.authService.signinUser(this.loginForm.value).then(async response => {
                localStorage.setItem(environment.tokenKey, JSON.stringify(response.user));
                this.authService.currentUserSubject.next(response.user);
                if (this.authService.isVerified()) {
                    this.router.navigate(['/']);
                } else {
                    this.router.navigate(['/authentication/verify-confirm']);
                }
            }).catch(err => {
                if (err.code == '409') {
                    // alertFunctions.typeWarning(err.code.toString(), err.message);
                    this.commonAlertService.typeSuccess(err.code.toString(), err.message);
                } else {
                    // alertFunctions.typeError(err.code.toString(), err.message);
                    if (err.message === 'Invalid login') {
                        this.commonAlertService.typeSuccess(err.code.toString(), 'Password salah Terjadi kesalahan');
                    }
                    else {
                        this.commonAlertService.typeSuccess(err.code.toString(), 'Password salah Terjadi kesalahan');
                    }
                }
            });;
        }
    }
}
