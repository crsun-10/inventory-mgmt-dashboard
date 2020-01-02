import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MatDialog, MatTableDataSource, MatPaginator, MatPaginatorIntl, MatSort } from '@angular/material';
import { NewOrderDialogComponent } from '../component/new-order-dialog/new-order-dialog.component';
import { Subject, fromEvent, BehaviorSubject, Observable, merge } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { SelfItemsService } from 'app/services/self-items.service';
import { takeUntil, debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { CustomPaginator } from '../CustomPaginator';
import { CommonAlertService } from 'app/shared/common-alert.service';
import { JsonToCsvService } from 'app/services/json-to-csv.service';
import { DataSource } from '@angular/cdk/table';
import { FuseUtils } from '@fuse/utils';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
  animations: fuseAnimations,
  providers: [
    { provide: MatPaginatorIntl, useValue: CustomPaginator() }
  ]
})

export class OrderComponent implements OnInit, OnDestroy {
  // ngxQrcode2 = '1-22-slkjsdf-23';
  displayedColumn: string[] = ['shippingLabel', 'qty', 'item_name', 'status', 'actions']
  // dataSource: any = new MatTableDataSource<any>(null);
  // dataSource: any = new OrdersDataSource(null);
  dataSource: OrdersDataSource | null;

  // Private
  private _unsubscribeAll: Subject<any>;

  pageSizeOptions: number[] = [1, 5, 10, 25, 100];

  @ViewChild('orderPaginator', { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;

  constructor(
    public selfItemService: SelfItemsService,
    public dialog: MatDialog,
    private _jsonToCsvService: JsonToCsvService,
    private commonAlertService: CommonAlertService,
  ) {
    // Set the private defaults
    this._unsubscribeAll = new Subject();
  }

  ngOnInit() {
    this.dataSource = new OrdersDataSource(this.selfItemService, this.paginator, this.sort);
    // console.log('>>>> data source:', this.dataSource);

    fromEvent(this.filter.nativeElement, 'keyup')
      .pipe(
        takeUntil(this._unsubscribeAll),
        debounceTime(150),
        distinctUntilChanged()
      )
      .subscribe(($event: KeyboardEvent) => {
        if ($event.keyCode === 13) {
          if (!this.dataSource) {
            return;
          }
          this.dataSource.filter = this.filter.nativeElement.value.trim();
        }
      });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  doAddNewOrder() {
    const dialogRef = this.dialog.open(NewOrderDialogComponent, {
      panelClass: 'new-order-dialog',
      data: {}
    });

    dialogRef.afterClosed()
      .subscribe(response => {
        if (!response) {
          return;
        }
        // this.getOrders();
        const actionType: string = response[0];
        switch (actionType) {
          case 'place order':
            // this.staffService.getPendingStaff();
            this.selfItemService.getOrders();

            break;
          case 'cancel':
            // console.log("actionType:", actionType);
            break;
        }
      });
  }

  downloadCSV() {
    const currentData = this.dataSource.filteredData.slice();
    if (!currentData || !currentData.length) {
      this.commonAlertService.typeError('Notify', 'There is no data to export');
      return;
    }
    let jsonData: any[] = [];
    for (let index = 0; index < currentData.length; index++) {
      const order_obj = currentData[index];
      let data_obj = {
        Label_Pengiriman: '"' + order_obj.shippingLabel + '"',
        Jumlah: '"' + order_obj.str_item_outbound.split('__').join('\n') + '"',
        Status: order_obj.status,
        Aksi: 'print',
      };
      jsonData.push(data_obj);
    }
    const csv_header = ['Label_Pengiriman', 'Jumlah', 'Status', 'Aksi'];
    this._jsonToCsvService.downloadFile(jsonData, csv_header, 'Antarapacker-order');
  }

}


export class OrdersDataSource extends DataSource<any>
{
  // Private
  private _filterChange = new BehaviorSubject('');
  private _filteredDataChange = new BehaviorSubject('');

  /**
   * Constructor
   *
   * @param {OrdersService} _ordersService
   * @param {MatPaginator} _matPaginator
   * @param {MatSort} _matSort
   */
  constructor(
    private _ordersService: SelfItemsService,
    private _matPaginator: MatPaginator,
    private _matSort: MatSort
  ) {
    super();

    // this.filteredData = this._ordersService.orders;
    let orders = this._ordersService.orders.slice();
    // console.log("order data", orders);
    this.filteredData = this.getTableOrders(orders);
    // console.log("order table data", this.filteredData);

  }

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  // Filtered data
  get filteredData(): any {
    return this._filteredDataChange.value;
  }

  set filteredData(value: any) {
    this._filteredDataChange.next(value);
  }

  // Filter
  get filter(): string {
    return this._filterChange.value;
  }

  set filter(filter: string) {
    this._filterChange.next(filter);
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Connect function called by the table to retrieve one stream containing the data to render.
   *
   * @returns {Observable<any[]>}
   */
  connect(): Observable<any[]> {
    const displayDataChanges = [
      this._ordersService.onOrdersChanged,
      this._matPaginator.page,
      this._filterChange,
      this._matSort.sortChange
    ];

    return merge(...displayDataChanges).pipe(map(() => {

      // let data = this._ordersService.orders.slice();
      let data;
      let orders = this._ordersService.orders.slice();
      data = this.getTableOrders(orders);
      data = this.filterData(data);

      this.filteredData = [...data];

      data = this.sortData(data);

      // Grab the page's slice of data.
      const startIndex = this._matPaginator.pageIndex * this._matPaginator.pageSize;
      return data.splice(startIndex, this._matPaginator.pageSize);
    })
    );

  }

  /**
   * Filter data
   *
   * @param data
   * @returns {any}
   */
  filterData(data): any {
    if (!this.filter) {
      return data;
    }
    return FuseUtils.filterArrayByString(data, this.filter);
  }

  /**
   * Sort data
   *
   * @param data
   * @returns {any[]}
   */
  sortData(data): any[] {
    if (!this._matSort.active || this._matSort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';

      switch (this._matSort.active) {
        case 'shippingLabel':
          [propertyA, propertyB] = [a.shippingLabel, b.shippingLabel];
          break;
        case 'qty':
          [propertyA, propertyB] = [a.item_outbound[0].qty, b.item_outbound[0].qty];
          break;
        case 'item_name':
          [propertyA, propertyB] = [a.item_outbound[0].name, b.item_outbound[0].name];
          break;
        case 'status':
          [propertyA, propertyB] = [a.status, b.status];
          break;
        case 'actions':
          [propertyA, propertyB] = ['print', 'print'];
          break;
      }

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this._matSort.direction === 'asc' ? 1 : -1);
    });
  }

  getTableOrders(orderData: any[]) {
    if (orderData === []) {
      return orderData;
    }

    let table_orders = [];
    orderData.forEach(element => {

      let tmp = [];
      if (element.outbounds instanceof Array) {
        tmp = element.outbounds;
      }
      else {
        tmp.push(element.outbounds);
      }

      let xx = 1;
      // let tmp_status = "process";
      let tmp_status = "Sedang dikerjakan";
      tmp.forEach(outbound => {
        if (outbound.staff_id)
          xx *= 1;
        else
          xx = 0;
      });
      if (xx) {
        // tmp_status = "Completed";
        tmp_status = "Selesai";
      }
      // console.log('>>>>>>>>scanResults:', element.scanResults);
      let tmp_item_outbound = [];
      let obj_item_outbound: any;
      let cnt_item_outbound = parseInt(element.scanResults.split('_')[3]);
      let tmp_str_item_outbounds = '';
      // console.log('>>>>>>cnt_item_outbound:', cnt_item_outbound);
      for (let ii = 0; ii < 2 * cnt_item_outbound; ii += 2) {
        let item_id = parseInt(element.scanResults.split('_')[ii + 4]);
        let arr_tmp = tmp.filter(obj_tmp => obj_tmp.item_id === item_id);
        obj_item_outbound = {
          qty: parseInt(element.scanResults.split('_')[ii + 5]),
          name: arr_tmp[0].items.data[0].name
        };
        tmp_item_outbound.push(obj_item_outbound);
        tmp_str_item_outbounds += '__' + element.scanResults.split('_')[ii + 5] + '_' + arr_tmp[0].items.data[0].name;
      }
      tmp_str_item_outbounds = tmp_str_item_outbounds.slice(2);
      // console.log('>>>>> string:', tmp_str_item_outbounds);
      if (this._matSort.active) {
        if (this._matSort.active === 'item_name') {
          tmp_item_outbound.sort((a, b) => {
            return (a.name < b.name ? -1 : 1) * (this._matSort.direction === 'asc' ? 1 : -1);
          });
        }
        else if (this._matSort.active === 'qty') {
          tmp_item_outbound.sort((a, b) => {
            return (a.qty < b.qty ? -1 : 1) * (this._matSort.direction === 'asc' ? 1 : -1);
          });
        }
      }
      let table_element = {
        shippingLabel: element.shippingLabel,
        scanResults: element.scanResults,
        // outbounds: tmp,
        status: tmp_status,
        item_outbound: tmp_item_outbound,
        str_item_outbound: tmp_str_item_outbounds
      }
      table_orders.push(table_element);
    });
    return table_orders;
  }
  /**
   * Disconnect
   */
  disconnect(): void {
  }
}