import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AcceptInvitationComponent } from './accept-invitation.component';
import { RouterModule } from '@angular/router';
import { MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatInputModule, MatMenuModule } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import { FuseSharedModule } from '@fuse/shared.module';


const routes = [
  {
    path: 'accept-invitation',
    component: AcceptInvitationComponent
  }
];

@NgModule({
  declarations: [AcceptInvitationComponent],
  imports: [
    CommonModule,
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
export class AcceptInvitationModule { }
