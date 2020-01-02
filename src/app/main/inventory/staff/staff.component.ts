import { Component, OnInit, Inject, ViewChild, OnDestroy, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatPaginator, MatTableDataSource, MatPaginatorIntl, MatSort } from '@angular/material';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { StaffService } from 'app/services/staff.service';
import { fuseAnimations } from '@fuse/animations';
import { StaffElement } from 'app/shared/common';
import { ConfirmAlertComponent } from '../component/confirm-alert/confirm-alert.component';
import { NewStaffDialogComponent } from '../component/new-staff-dialog/new-staff-dialog.component';
import { CommonAlertService } from 'app/shared/common-alert.service';
import { AuthenticationService } from '../../../services/authentication.service';
import { CustomPaginator } from '../CustomPaginator';
import { JsonToCsvService } from 'app/services/json-to-csv.service';

@Component({
  selector: 'app-staff',
  templateUrl: './staff.component.html',
  styleUrls: ['./staff.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
  providers: [
    { provide: MatPaginatorIntl, useValue: CustomPaginator() }
  ]
})
export class StaffComponent implements OnInit, OnDestroy {

  currentUser: any;

  displayedColumnAccepted: string[] = ['name', 'email', 'status', 'action']
  dataSourceForAccepted: any = new MatTableDataSource<StaffElement>(null);
  // Private
  private _unsubscribeAll: Subject<any>;

  pageSizeOptions: number[] = [1, 5, 10, 25, 100];

  @ViewChild('staffPaginator', { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    public staffService: StaffService,
    public dialog: MatDialog,
    private commonAlertService: CommonAlertService,
    private authService: AuthenticationService,
    private _jsonToCsvService: JsonToCsvService,
  ) {
    this.currentUser = this.authService.currentUserValue;
    // Set the private defaults
    this._unsubscribeAll = new Subject();
  }

  ngOnInit() {
    // console.log('staff ngOninit');

    this.staffService.onAcceptedStaffsChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(staffs => {
        // console.log('onAcceptedstaff changed subscribe start:', staffs);
        if (staffs.length) {
          let me_index = staffs.findIndex(staff_obj => staff_obj.email === this.currentUser.email);
          if (me_index) {
            for (let index = 0; index < me_index; index++) {
              const staff_obj = staffs.shift();
              staffs.push(staff_obj);
            }
          }
        }
        this.dataSourceForAccepted = new MatTableDataSource<StaffElement>(staffs);
        this.dataSourceForAccepted.filteredData.map(filteredData => {
          if (filteredData.employerId === this.currentUser.id) {
            filteredData.status = 'accepted';
            filteredData.status_inr = 'Diterima';
            filteredData.action = 'Hapus';
            if (filteredData.email === this.currentUser.email) {
              filteredData.status = 'myself';
              filteredData.status_inr = '';
              filteredData.action = '';
            }
          }
          else {
            filteredData.status = 'invited';
            filteredData.status_inr = 'Sedang diundang';
            filteredData.action = '';
          }
        });
        // console.log('>>> dataSource:', this.dataSourceForAccepted);
        this.dataSourceForAccepted.paginator = this.paginator;
        this.dataSourceForAccepted.sort = this.sort;
      });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  doRemoveConfirm(staffid) {
    // console.log("staffid:", staffid);
    const dialogRef = this.dialog.open(ConfirmAlertComponent, {
      panelClass: 'confirm-alert',
      data: {}
    });

    dialogRef.afterClosed()
      .subscribe(response => {
        if (!response) {
          return;
        }
        const actionType: string = response[0];
        switch (actionType) {
          case 'okay':
            // this.staffService.removeStaff(staffid);
            this.staffService.removeStaff(staffid).then(response => {
              this.commonAlertService.typeSuccess("Success", "Send removal email!");
            }).catch(error => {
              console.log("error:", error);
            });
            // console.log("actionType:", actionType);
            break;
          case 'cancel':
            // console.log("actionType:", actionType);
            break;
        }
      });
  }
  doAddNewStaff() {
    const dialogRef = this.dialog.open(NewStaffDialogComponent, {
      panelClass: 'new-staff-dialog',
      data: {}
    });

    dialogRef.afterClosed()
      .subscribe(response => {
        if (!response) {
          return;
        }
        const actionType: string = response[0];
        switch (actionType) {
          case 'add':
            // this.staffService.getPendingStaff();
            break;
          case 'cancel':
            // console.log("actionType:", actionType);
            break;
        }
      });
  }

  // changeAcceptedPagination($event) {
  //   // console.log(' event change pagination occured');
  //   var acceptedSearchOption = {};
  //   acceptedSearchOption['search'] = "";
  //   acceptedSearchOption['pageSize'] = $event.pageSize;
  //   acceptedSearchOption['pageIndex'] = $event.pageIndex;
  //   // this.staffService.onAcceptedSearchOptionChanged.next(acceptedSearchOption);
  // }

  applyFilter(filterText: string) {
    this.dataSourceForAccepted.filter = filterText.trim().toLowerCase();

    if (this.dataSourceForAccepted.paginator) {
      this.dataSourceForAccepted.paginator.firstPage();
    }
  }

  downloadCSV() {
    const currentData = this.dataSourceForAccepted._renderData._value.slice();
    if (!currentData || !currentData.length) {
      this.commonAlertService.typeError('Notify', 'There is no data to export');
      return;
    }
    let jsonData: any[] = [];
    for (let index = 0; index < currentData.length; index++) {
      const staff_obj = currentData[index];
      let data_obj = {
        Nama: staff_obj.name,
        Email: staff_obj.email,
        Status_undangan: staff_obj.status_inr,
        Aksi: staff_obj.action
      };
      jsonData.push(data_obj);
    }
    const csv_header = ['Nama', 'Email', 'Status_undangan', 'Aksi'];
    this._jsonToCsvService.downloadFile(jsonData, csv_header, 'Antarapacker-staff');
  }
}
