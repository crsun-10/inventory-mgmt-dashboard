import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';

import { ForbidComponent } from 'app/main/authentication/forbid/forbid.component';

const routes = [
    {
        path: 'forbid',
        component: ForbidComponent
    }
];

@NgModule({
    declarations: [
        ForbidComponent
    ],
    imports: [
        RouterModule.forChild(routes),

        FuseSharedModule
    ]
})
export class ForbidModule {
}
