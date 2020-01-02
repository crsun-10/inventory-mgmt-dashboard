import { Component, OnInit, ViewEncapsulation, OnDestroy, ViewChild } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { SelfItemsService } from 'app/services/self-items.service';
import { takeUntil } from 'rxjs/operators';
import { Subject, ReplaySubject } from 'rxjs';
import { MatTableDataSource, MatSelect, MatDialogRef } from '@angular/material';
import { OutboundItemElement } from 'app/shared/common';
import { FormControl } from '@angular/forms';
import { AuthenticationService } from 'app/services/authentication.service';
import { CommonAlertService } from 'app/shared/common-alert.service';
import { InventoryService } from 'app/services/inventory.service';

@Component({
  selector: 'new-order-dialog',
  templateUrl: './new-order-dialog.component.html',
  styleUrls: ['./new-order-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class NewOrderDialogComponent implements OnInit, OnDestroy {

  currentUser: any;
  selfitems: any[] = [];
  public filteredSelfItems: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  // define table varibles
  displayedColumns: string[] = ['name', 'qty', 'action'];
  dsOutboundItems: any = new MatTableDataSource<OutboundItemElement>(null);
  outboundItems: OutboundItemElement[] = [];

  // 
  public bankFilterCtrl: FormControl = new FormControl();
  public shippingLabelCtrl: FormControl = new FormControl();
  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;


  private _unsubscribeAll: Subject<any>;

  errorMsg = "no";
  // shippingLabel = "";

  constructor(
    private selfItemService: SelfItemsService,
    private _inventoryService: InventoryService,
    private authService: AuthenticationService,
    public matDialogRef: MatDialogRef<NewOrderDialogComponent>,
    private commonAlertService: CommonAlertService
  ) {
    this._unsubscribeAll = new Subject();

    let newOutboundItem: OutboundItemElement = new OutboundItemElement({});
    this.outboundItems.push(newOutboundItem);
    this.dsOutboundItems = new MatTableDataSource<OutboundItemElement>(this.outboundItems);

    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit() {
    this._inventoryService.getAllInventories();
    this._inventoryService.onItemsPFChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(selfitems => {
        this.selfitems = selfitems;
        // load the initial bank list
        this.filteredSelfItems.next(this.selfitems.slice());
        // console.log("self items:", this.selfitems);
      });

    // listen for search field value changes
    this.bankFilterCtrl.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.filterSelfItems();
      });

    // listen for shipping label field value changes
    this.shippingLabelCtrl.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.errorMsg = "no";
      });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  protected filterSelfItems() {
    if (!this.selfitems) {
      return;
    }
    // get the search keyword
    let search = this.bankFilterCtrl.value;
    if (!search) {
      this.filteredSelfItems.next(this.selfitems.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredSelfItems.next(
      // this.selfitems.filter(selfitem => selfitem.items[0].name.toLowerCase().indexOf(search) > -1)
      this.selfitems.filter(selfitem => selfitem.name.toLowerCase().indexOf(search) > -1)
    );
  }

  addOutboundItem(outboundItem: OutboundItemElement) {
    // console.log('>>>>>>>>>>>>> add outboundItem:', outboundItem);
    this.errorMsg = "no";
    // check unselect shelfitem
    if (outboundItem.itemId_qty_str === "") {
      this.errorMsg = "select";
      return;
    }
    // check exist already
    let alreadyIndex = this.outboundItems.findIndex(x => x.item_id === parseInt(outboundItem.itemId_qty_str.split('_')[0]));
    if (alreadyIndex > -1) {
      this.errorMsg = "exist";
      outboundItem = new OutboundItemElement({});
      this.outboundItems[this.outboundItems.length - 1] = outboundItem;
      this.dsOutboundItems = new MatTableDataSource<OutboundItemElement>(this.outboundItems);
      return;
    }
    // check out of stock
    if (outboundItem.qty > parseInt(outboundItem.itemId_qty_str.split('_')[1])) {
      this.errorMsg = "outOfStock";
      // outboundItem.qty = 1;
      return;
    }
    // check negative
    if (outboundItem.qty <= 0) {
      this.errorMsg = "negative";
      // outboundItem.qty = 1;
      return;
    }

    let newOutbountItem: OutboundItemElement = new OutboundItemElement({});
    Object.assign(newOutbountItem, outboundItem);
    // newOutbountItem.selfitem_id = parseInt(outboundItem.shelfItemId_itemId_shelvesId_qty_str.split('_')[0]);
    newOutbountItem.item_id = parseInt(outboundItem.itemId_qty_str.split('_')[0]);
    // newOutbountItem.shelf_id = parseInt(outboundItem.shelfItemId_itemId_shelvesId_qty_str.split('_')[2]);
    // newOutbountItem.qty = parseInt(outboundItem.item_qty_str.split('_')[1]);
    newOutbountItem.type = "edit";
    this.outboundItems.unshift(newOutbountItem);

    outboundItem = new OutboundItemElement({});
    this.outboundItems[this.outboundItems.length - 1] = outboundItem;
    this.dsOutboundItems = new MatTableDataSource<OutboundItemElement>(this.outboundItems);
  }

  deleteOutboundItem(outboundItem: OutboundItemElement) {
    // let index = this.outboundItems.findIndex(x => x.shelf_id === outboundItem.shelf_id);
    let index = this.outboundItems.findIndex(x => x.item_id === outboundItem.item_id);
    this.outboundItems.splice(index, 1);
    this.dsOutboundItems = new MatTableDataSource<OutboundItemElement>(this.outboundItems);
  }

  onShelfItemSelection(event) {
    this.errorMsg = "no";
    // console.log("qty:", event.value);
    // if (index > -1) element.max_qty = this.selfitems[index].qty;
  }

  async onclickAddOrder() {
    // console.log('>>>>>>>>>> shipping label input value:', this.shippingLabelCtrl.value);
    // check valid shipping label
    if (!this.shippingLabelCtrl.value || this.shippingLabelCtrl.value.trim() === "") {
      this.errorMsg = "empty";
      return;
    }
    // check whether select or not shelf items...
    if (this.outboundItems.length == 1) {
      this.errorMsg = "nonSelect";
      return;
    }

    // console.log("outboundItems:", this.outboundItems);
    let shelf_items: any[] = [];

    for (let index = 0; index < this.outboundItems.length - 1; index++) {
      const outboundItem_element = this.outboundItems[index];
      let qty_sum = 0;
      await this.selfItemService.getSelfItemsByItemId(outboundItem_element.item_id).then(res_selfItems => {
        // console.log('get success' + index);
        shelf_items.push(res_selfItems);
        for (let ii = 0; ii < res_selfItems.length; ii++) {
          qty_sum += res_selfItems[ii].after_order_qty;
        }
        if (outboundItem_element.qty > qty_sum) {
          this.commonAlertService.typeSuccess("Error", 'Jumlah melebihi barang yang ada dan pesanan yang sedang dikerjakan');
          return;
        }
        // console.log('amount success' + index);
      }).catch(err_selfItems => {
        this.commonAlertService.typeSuccess("Error", JSON.stringify(err_selfItems));
        return;
      })
    }

    // console.log('>>>>>> shelf_items:', shelf_items);
    let scanResults = this.currentUser.id + "_" + this.shippingLabelCtrl.value.trim() + "_" + (this.outboundItems.length - 1);
    for (let index = 0; index < this.outboundItems.length - 1; index++) {
      const element = this.outboundItems[index];
      scanResults += "_" + element.item_id + "_" + element.qty;
    }
    // console.log('scanResults:', scanResults);

    await this.selfItemService.addNewOrder({
      user_id: this.currentUser.id,
      // shippingLabel: this.shippingLabel,
      shippingLabel: this.shippingLabelCtrl.value.trim(),
      scanResults: scanResults
    }).then((responsee: any) => {
      // console.log("addNewOrder:", responsee);
      let data_outbound = [];
      for (let index = 0; index < this.outboundItems.length - 1; index++) {
        let element = this.outboundItems[index];
        let idx_s = index;
        // if (element.item_id === shelf_items[0][0].item_id) {
        //   console.log('RIGHT direct');
        //   idx_s = index;
        // }
        // else if (element.item_id === shelf_items[this.outboundItems.length - 2][0].item_id) {
        //   console.log('WRONG direct');
        //   idx_s = this.outboundItems.length - 2 - index;
        // }
        // else {
        //   console.log('Invalid direct');
        //   return;
        // }

        let idx_while = 0;
        for (idx_while = 0; idx_while < shelf_items[idx_s].length; idx_while++) {
          // console.log('>>>>>>>>>>>>>>>> outboundsItems qty:', element.qty);
          // console.log('>>>>>>>>>>>>>>>> shelf_items:', shelf_items[idx_s][idx_while]);
          let item_obj: any;
          if (element.qty <= shelf_items[idx_s][idx_while].after_order_qty) {
            item_obj = {
              item_id: element.item_id,
              order_id: responsee.id,
              staff_id: 0,
              shelfItem_id: shelf_items[idx_s][idx_while].id,
              shelf_id: shelf_items[idx_s][idx_while].selves[0].id,
              qty: element.qty
            };
            data_outbound.push(item_obj);
            // console.log('>>>>>>>>>> data_outbound:', data_outbound);
            // console.log('>>>>>>>>>> break');
            break;
          }
          else {
            item_obj = {
              item_id: element.item_id,
              order_id: responsee.id,
              staff_id: 0,
              shelfItem_id: shelf_items[idx_s][idx_while].id,
              shelf_id: shelf_items[idx_s][idx_while].selves[0].id,
              qty: shelf_items[idx_s][idx_while].after_order_qty
            };
            data_outbound.push(item_obj);
            element.qty -= shelf_items[idx_s][idx_while].after_order_qty;
            // console.log('>>>>>>>>>> data_outbound:', data_outbound);
          }
        }
        if (idx_while === shelf_items[idx_s].length && element.qty > 0) {
          this.commonAlertService.typeSuccess("Error", 'create-invalid amount');
          return;
        }
      }

      this.selfItemService.addNewOutbound(data_outbound).then(response => {
        // console.log('success: add new outbounds==>', response);
        this.commonAlertService.typeSuccess("Staff", "Placed new Order!");
        this.matDialogRef.close(['place order']);
      }).catch(error => {
        console.log("add new outbound error:", error);
      });

    }).catch(error => {
      console.log("add new order error:", error);
    });
  }

}


