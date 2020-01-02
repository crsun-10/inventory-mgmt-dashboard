import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main/main.component';
import { OrderComponent } from './order/order.component';
import { StaffComponent } from './staff/staff.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { InventoryService } from 'app/services/inventory.service';
import { StaffService } from 'app/services/staff.service';
import { OrderService } from 'app/services/order.service';
import { ConfirmAlertComponent } from './component/confirm-alert/confirm-alert.component';
import { NewStaffDialogComponent } from './component/new-staff-dialog/new-staff-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NewOrderDialogComponent } from './component/new-order-dialog/new-order-dialog.component';
import { SelfItemsService } from 'app/services/self-items.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxPrintModule } from 'ngx-print';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { EditItemDialogComponent } from './component/edit-item-dialog/edit-item-dialog.component';
import { VerifyItemDialogComponent } from './component/verify-item-dialog/verify-item-dialog.component';
import { CustomPaginator } from './CustomPaginator';
import { JsonToCsvService } from 'app/services/json-to-csv.service';

const routes = [
  {
    path: 'main',
    component: MainComponent,
    resolve: {
      inventory: InventoryService
    }
  },
  {
    path: 'order',
    component: OrderComponent,
    resolve: {
      order: SelfItemsService
    }
  },
  {
    path: 'staff',
    component: StaffComponent,
    resolve: {
      staff: StaffService
    }
  }
];

@NgModule({
  declarations: [
    MainComponent, OrderComponent, StaffComponent, ConfirmAlertComponent,
    ConfirmAlertComponent, NewStaffDialogComponent, NewOrderDialogComponent, EditItemDialogComponent, VerifyItemDialogComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMatSelectSearchModule,
    NgxPrintModule,
    NgxQRCodeModule
  ],
  providers: [
    JsonToCsvService
  ],
  entryComponents: [ConfirmAlertComponent, NewStaffDialogComponent, NewOrderDialogComponent, EditItemDialogComponent, VerifyItemDialogComponent]
})
export class InventoryModule { }
