import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { Router } from '@angular/router';
import { CommonAlertService } from 'app/shared/common-alert.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { AuthenticationService } from 'app/services/authentication.service';
// import { tokenKey } from 'app/shared/common';
import { environment } from 'environments/environment';

@Component({
    selector: 'register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class RegisterComponent implements OnInit, OnDestroy {
    registerForm: FormGroup;
    private _unsubscribeAll: Subject<any>;
    constructor(
        private _fuseConfigService: FuseConfigService, private _formBuilder: FormBuilder,
        private router: Router, private authService: AuthenticationService, private commonAlert: CommonAlertService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
    ) {
        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar: { hidden: true }, toolbar: { hidden: true },
                footer: { hidden: true }, sidepanel: { hidden: true }
            }
        };
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.registerForm = this._formBuilder.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
            passwordConfirm: ['', [Validators.required, confirmPasswordValidator]]
        });
        // when the 'password' field changes
        this.registerForm.get('password').valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this.registerForm.get('passwordConfirm').updateValueAndValidity();
            });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
    onRegisterSubmit(registerForm) {
        if (this.registerForm.valid) {
            let formData = {
                email: registerForm.email,
                name: registerForm.name,
                password: registerForm.password
            }
            this.authService.signupUser(formData).then(response => {
                let authData = { strategy: 'local', email: registerForm.email, password: registerForm.password };
                this.authService.signinUser(authData).then(response => {
                    localStorage.setItem(environment.tokenKey, JSON.stringify(response.user));
                    this.authService.currentUserSubject.next(response.user);
                    this.router.navigate(['/verify-confirm']);
                }).catch(err => {
                    // console.log("authenticate code:", response);
                    console.log("authenticate error:", err);
                    this.commonAlert.typeSuccess("Register Error", JSON.stringify(err));
                })
            }).catch(error => {
                console.log('error:', error.message);
                this.commonAlert.typeSuccess("Kesalahan pendaftaran", 'Maaf email telah dipakai');
            });
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

    if (!control.parent || !control) { return null; }

    const password = control.parent.get('password');
    const passwordConfirm = control.parent.get('passwordConfirm');

    if (!password || !passwordConfirm) { return null; }

    if (passwordConfirm.value === '') { return null; }

    if (password.value === passwordConfirm.value) { return null; }

    return { passwordsNotMatching: true };
};
