import { Component, OnInit, Inject, ViewChild, OnDestroy } from '@angular/core';
import { InventoryService } from 'app/services/inventory.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatPaginator, MatTableDataSource, MatPaginatorIntl, MatSort } from '@angular/material';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { EditItemDialogComponent } from '../component/edit-item-dialog/edit-item-dialog.component';
import { VerifyItemDialogComponent } from '../component/verify-item-dialog/verify-item-dialog.component';
import { CustomPaginator } from '../CustomPaginator';
import { JsonToCsvService } from 'app/services/json-to-csv.service';
import { CommonAlertService } from 'app/shared/common-alert.service';
import { InventoryElement } from 'app/shared/common';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  providers: [
    { provide: MatPaginatorIntl, useValue: CustomPaginator() }
  ]
})
export class MainComponent implements OnInit, OnDestroy {

  fDisplayNote: boolean = false;

  displayedColumns: string[] = ['name', 'qty', 'locations', 'actions'];
  dataSource: any = new MatTableDataSource<InventoryElement>(null);

  unVerifiedItems: any = [];
  // Private
  private _unsubscribeAll: Subject<any>;

  // MatPaginator Inputs
  pageSizeOptions: number[] = [1, 5, 10, 25, 100];

  @ViewChild('inventoryPaginator', { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    public inventoryService: InventoryService,
    public dialog: MatDialog,
    private _jsonToCsvService: JsonToCsvService,
    private commonAlertService: CommonAlertService,
  ) {
    // Set the private defaults
    this._unsubscribeAll = new Subject();
  }

  ngOnInit() {
    this.inventoryService.onItemsChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(items => {
        // console.log('onInit all items:', items);
        let items_data = items;
        for (let index = 0; index < items_data.length; index++) {
          const item_element = items_data[index];
          item_element.qty = 0;
          // let qty = 0;
          item_element.actions = 'Ubah'
          item_element.locations = "";
          item_element.selfItems.data.forEach(selfItemElement => {
            item_element.qty += selfItemElement.qty;
            // qty += selfItemElement.qty;
            selfItemElement.selves.forEach(shelf_element => {
              item_element.locations += ', ' + shelf_element.name;
            });
          });
          // item_element.qty = +qty;
          if (item_element.locations.length - 2) {
            item_element.locations = item_element.locations.slice(2);
          }
        }

        this.dataSource = new MatTableDataSource<InventoryElement>(items_data);

        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

      });

    this.inventoryService.onUnverifiedItemsChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(unverifiedItems => {
        // console.log('onInit all unverified items:', unverifiedItems);
        if (unverifiedItems.length) {
          this.fDisplayNote = true;
          this.unVerifiedItems = unverifiedItems;
        }
        else {
          this.fDisplayNote = false;
        }
      });

  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  onDestroyWarningBox() {
    this.fDisplayNote = false;
  }

  onDisplayVerifyDialog() {
    const dialogRef = this.dialog.open(VerifyItemDialogComponent, {
      panelClass: 'verify-item-dialog',
      data: { items: this.unVerifiedItems }
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log('verify-item-dialog was closed');
    });
  }

  onEditItemDlg(currentItem, items): void {
    // console.log('passing item:', currentItem);
    const dialogRef = this.dialog.open(EditItemDialogComponent, {
      panelClass: 'edit-item-dialog',
      data: { currentItem: currentItem, items: items }
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log('Edit-item-dialog was closed');
    });
  }

  // changeInventoryPagination($event) {
  //   // this.inventoryService.onInventorySearchOptionChanged.next(inventorySearchOption);
  //   // this.onInventorySearchOptionChanged.next(inventorySearchOption);
  //   this.pageSize = $event.pageSize;
  //   this.pageIndex = this.pageSize * $event.pageIndex;
  //   this.inventoryService.getInventories($event.pageSize, $event.pageIndex * $event.pageSize);
  // }

  applyFilter(filterText: string) {
    this.dataSource.filter = filterText.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  downloadCSV() {
    const currentData = this.dataSource._renderData._value.slice();
    if (!currentData || !currentData.length) {
      this.commonAlertService.typeError('Notify', 'There is no data to export');
      return;
    }
    let jsonData: any[] = [];
    for (let index = 0; index < currentData.length; index++) {
      const inventory_obj = currentData[index];
      let data_obj = {
        Nama: inventory_obj.name,
        Jumlah: inventory_obj.qty,
        Lokasi: inventory_obj.locations.replace(/,/g, '-'),
        Aksi: inventory_obj.actions
      };
      jsonData.push(data_obj);
    }
    const csv_header = ['Nama', 'Jumlah', 'Lokasi', 'Aksi'];
    this._jsonToCsvService.downloadFile(jsonData, csv_header, 'Antarapacker-inventory');
  }

  customSort($event) {
    if ($event.active === 'locations') {
      let sort_direction = 0;
      if ($event.direction === 'asc')
        sort_direction = -1;
      else if ($event.direction === 'desc')
        sort_direction = 1;
      let sort_data = this.dataSource.filteredData.slice();
      for (let index = 0; index < sort_data.length; index++) {
        let inventory_obj = sort_data[index];
        let location_arr = inventory_obj.locations.split(', ');
        location_arr.sort((a, b) => {
          if (a < b) return sort_direction;
          if (a > b) return sort_direction * (-1);
          return 0;
        });
        const sorted_location = location_arr.join(', ');
        inventory_obj.locations = sorted_location;
      }
      this.dataSource.filteredData = sort_data;
    }
  }
}