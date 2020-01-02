import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeclineInvitationComponent } from './decline-invitation.component';
import { RouterModule } from '@angular/router';


const routes = [
  {
    path: 'decline-invitation',
    component: DeclineInvitationComponent
  }
];

@NgModule({
  declarations: [DeclineInvitationComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ]
})
export class DeclineInvitationModule { }
