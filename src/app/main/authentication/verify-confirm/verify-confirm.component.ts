import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { Router } from '@angular/router';
import { CommonAlertService } from 'app/shared/common-alert.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { AuthenticationService } from 'app/services/authentication.service';
// import { tokenKey } from 'app/shared/common';
import { environment } from 'environments/environment';

@Component({
    selector: 'verify-confirm',
    templateUrl: './verify-confirm.component.html',
    styleUrls: ['./verify-confirm.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class VerifyConfirmComponent implements OnInit, OnDestroy {
    VerifyConfirmForm: FormGroup;
    private _unsubscribeAll: Subject<any>;
    verifyType: string = "email";
    emailphone: string = "";
    verifyCode: string = "";
    isSendingVerifyCode: boolean = false;
    isSentVerifyCode: boolean = false;
    isCheckingVerifyCode: boolean = false;
    isCheckedVerifyCode: boolean = false;

    constructor(
        private _fuseConfigService: FuseConfigService, private _formBuilder: FormBuilder,
        private router: Router, private authService: AuthenticationService, private commonAlertService: CommonAlertService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
    ) {
        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar: { hidden: true }, toolbar: { hidden: true },
                footer: { hidden: true }, sidepanel: { hidden: true }
            }
        };
    }

    ngOnInit(): void {
        this.VerifyConfirmForm = this._formBuilder.group({
            emailphone: ['', Validators.required],
            verifyType: ['email'],
            verifyCode: ['']
        });
        if (localStorage.getItem(environment.tokenKey)) {
            this.setEmailPhone();
        } else {
            this.router.navigate(['/authentication/login']);
        }
    }

    setEmailPhone() {
        let accessToken = JSON.parse(localStorage.getItem(environment.tokenKey));
        if (this.verifyType == 'email') {
            this.emailphone = accessToken.email;
        } else {
            this.emailphone = accessToken.phone;
        }
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        // this._unsubscribeAll.next();
        // this._unsubscribeAll.complete();
    }

    onChangeVerifyType(event) {
        this.verifyType = event.value;
        this.setEmailPhone();
        // console.log(event.value);
    }

    onSendVerifyCode() {
        this.isSendingVerifyCode = true;
        this.authService.sendVerifyCodeToEmailOrPhone(this.emailphone, this.verifyType)
            .then(response => {
                // console.log("send sms result:", response);
                this.isSendingVerifyCode = false
                this.isSentVerifyCode = true;
                // this.commonAlertService.typeSuccess("Success", "Sent new verify code");
                this.commonAlertService.typeSuccess("Berhasil", "Kode verifikasi telah dikirim ke email anda");
                // alertFunctions.typeSuccess('', 'Sent a verify code to your email.');
            }).catch(error => {
                this.isSendingVerifyCode = false;
                this.isSentVerifyCode = false;
                console.log("verify error:", error);
                this.commonAlertService.typeSuccess(error.code, error.message);
                // alertFunctions.typeError(error.code, error.message);
            });
    }

    onCheckVerifyCode() {
        if (this.verifyCode) {
            // console.log("verify code:", this.verifyCode);
            this.isCheckingVerifyCode = true;
            let verifyData = {
                email: this.emailphone, verifyCode: this.verifyCode.trim()
            }
            this.authService.confirmVerifyCode(verifyData).then(response => {
                this.isCheckingVerifyCode = false;
                if (response.result.state) {
                    this.isCheckedVerifyCode = true;
                    let accessToke = this.authService.currentUserValue;
                    accessToke.isVerified = 1;
                    localStorage.setItem(environment.tokenKey, JSON.stringify(accessToke));
                    this.authService.currentUserSubject.next(accessToke);
                    // this.commonAlertService.typeSuccess("Success", "Checked your code.");
                    this.commonAlertService.typeSuccess("Berhasil", "memeriksa kode Anda");
                } else {
                    this.isCheckedVerifyCode = false;
                    // this.commonAlertService.typeSuccess("Terjadi kesalahan", response.result.msg);
                    if (response.result.msg === 'expired') {
                        this.commonAlertService.typeSuccess("Terjadi kesalahan", 'Kode verifikasi kedaluwarsa');
                    }
                    else {
                        this.commonAlertService.typeSuccess("Terjadi kesalahan", 'Kode verifikasi salah');
                    }
                }
            }).catch(error => {
                this.isCheckedVerifyCode = false;//UsfRd6
                this.isCheckingVerifyCode = false;
                // this.commonAlertService.typeSuccess(error.code, error.message);
                this.commonAlertService.typeSuccess("Terjadi kesalahan", 'Kode verifikasi salah');
            });
        }
    }

    onFinishVerifyCode() {
        this.router.navigate(['/']);
    }
}
