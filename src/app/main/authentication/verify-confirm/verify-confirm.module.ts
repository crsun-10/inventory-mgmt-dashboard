import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { FuseSharedModule } from '@fuse/shared.module';

import { VerifyConfirmComponent } from 'app/main/authentication/verify-confirm/verify-confirm.component';
import { MatRadioModule, MatDividerModule } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';

const routes = [
    { path: 'verify-confirm', component: VerifyConfirmComponent }
];

@NgModule({
    declarations: [
        VerifyConfirmComponent
    ],
    imports: [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        FuseSharedModule,
        MatRadioModule,
        MatDividerModule,
        TranslateModule
    ]
})
export class VerifyConfirmModule {
}
