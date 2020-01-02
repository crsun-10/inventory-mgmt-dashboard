import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { FuseSharedModule } from '@fuse/shared.module';

import { LoginComponent } from 'app/main/authentication/login/login.component';
import { TranslateModule } from '@ngx-translate/core';
import { SecureInnerPagesGuard } from 'app/services/secure-inner-pages.guard';

const routes = [
    {
        path: 'login',
        component: LoginComponent, canActivate: [SecureInnerPagesGuard]
    }
];

@NgModule({
    declarations: [
        LoginComponent
    ],
    imports: [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        TranslateModule,

        FuseSharedModule
    ]
})
export class LoginModule {
}
