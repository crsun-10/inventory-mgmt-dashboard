import { Component, OnInit, ViewEncapsulation, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/services/inventory.service';

@Component({
  selector: 'verify-item-dialog',
  templateUrl: './verify-item-dialog.component.html',
  styleUrls: ['./verify-item-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class VerifyItemDialogComponent implements OnInit, OnDestroy {

  isEmptyName: boolean[];
  isExistName: boolean[];
  isBarcodeName: boolean[];
  isInvalidName: boolean[];
  // items: any;
  // unVerifiedItems: any;
  nameFormControl: FormControl[];

  private _unsubscribeAll: Subject<any>;
  constructor(
    @Inject(MAT_DIALOG_DATA) public _data: any,
    public matDialogRef: MatDialogRef<VerifyItemDialogComponent>,
    private inventoryService: InventoryService,
  ) {
    this._unsubscribeAll = new Subject();
    // this.items = this._data.items;
    // this.unVerifiedItems = this._data.unVerifiedItems;
  }

  ngOnInit() {
    // console.log('unVerifiedDlg passing data:', this._data);
    this.isEmptyName = [];
    this.isExistName = [];
    this.isBarcodeName = [];
    this.isInvalidName = [];

    this.nameFormControl = [];

    for (let index = 0; index < this._data.items.length; index++) {
      // const element = this._data[index];
      this.isEmptyName[index] = false;
      this.isExistName[index] = false;
      this.isBarcodeName[index] = false;
      this.isInvalidName[index] = false;

      this.nameFormControl[index] = new FormControl();
      this.nameFormControl[index].valueChanges
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(() => {
          this.isEmptyName[index] = false;
          this.isExistName[index] = false;
          this.isInvalidName[index] = false;
          this.isBarcodeName[index] = false;
        });
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  async onRename(unVerifiedItem, index) {
    // console.log('-------', unVerifiedItem);
    // console.log('--------index', index);
    //check empty name
    if (!this.nameFormControl[index].value || this.nameFormControl[index].value.trim() === '') {
      this.isEmptyName[index] = true;
      return;
    }
    //check exist name
    const isExistNameRes = await this.inventoryService.isExistName(this.nameFormControl[index].value.trim());
    if (isExistNameRes.total) {
      this.isExistName[index] = true;
      this.isInvalidName[index] = false;
      this.isEmptyName[index] = false;
      this.isBarcodeName[index] = false;
      return;
    }
    //check same name with barcode
    if (this.nameFormControl[index].value.trim() === unVerifiedItem.scanResults) {
      this.isExistName[index] = false;
      this.isEmptyName[index] = false;
      this.isInvalidName[index] = false;
      this.isBarcodeName[index] = true;
      return;
    }
    //check whether name include underline
    if (this.nameFormControl[index].value.trim().includes('_')) {
      this.isExistName[index] = false;
      this.isEmptyName[index] = false;
      this.isBarcodeName[index] = false;
      this.isInvalidName[index] = true;
      return;
    }
    //
    this.inventoryService.updateItemVerify(unVerifiedItem.id, this.nameFormControl[index].value).then(res => {
      // console.log('add new inventory res:', res);
      // this.inventoryService.getInventories();
      // this.inventoryService.removeUnverifiedItem(unVerifiedItem.id);
      this.inventoryService.getAllUnverifiedItems();
      // if item is only one, close dialog
      if (this._data.items.length == 1) {
        this.matDialogRef.close(['add']);
      }
      else {
        this._data.items.splice(index, 1);
        this.nameFormControl.splice(index, 1);
        this.isEmptyName.splice(index, 1);
        this.isExistName.splice(index, 1);
        this.isBarcodeName.splice(index, 1);
      }
    }).catch(err => {
      console.log('add new inventory error:', err);
    });

  }
}
