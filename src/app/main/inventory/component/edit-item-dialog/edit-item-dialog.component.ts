import { Component, OnInit, Inject, ViewEncapsulation, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { InventoryService } from 'app/services/inventory.service';
import { Validators, FormControl } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'edit-item-dialog',
  templateUrl: './edit-item-dialog.component.html',
  styleUrls: ['./edit-item-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class EditItemDialogComponent implements OnInit, OnDestroy {

  isExistName: boolean = false;
  isEmptyName: boolean = false;
  isBarcodeName: boolean = false;
  isInvalidName: boolean = false;

  // strNewName: string = "";
  private _unsubscribeAll: Subject<any>;

  // FormControl = new FormControl('', [
  //   Validators.required
  // ]);
  FormControl = new FormControl;

  constructor(
    @Inject(MAT_DIALOG_DATA) public _data: any,
    public matDialogRef: MatDialogRef<EditItemDialogComponent>,
    private inventoryService: InventoryService,
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit() {
    // listen for item name value changes
    this.FormControl.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.isEmptyName = false;
        this.isExistName = false;
        this.isBarcodeName = false;
        this.isInvalidName = false;
      });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  async onClickRename() {
    // check empty new name
    // if (this.FormControl.valid) {
    // console.log('>>>>>>>>>>>>>>>>> inputed new name:', this.FormControl.value);
    if (!this.FormControl.value || this.FormControl.value.trim() === "") {
      this.isEmptyName = true;
      return;
    }
    // console.log('>>>>>>>>>>>>>>>>> check success empty');
    // check exist name
    for (let ss = 0; ss < this._data.items.length; ss++) {
      const element = this._data.items[ss];
      if (element.name === this.FormControl.value.trim()) {
        this.isExistName = true;
        return;
      }
    }
    // console.log('>>>>>>>>>>>>>>>>> check existname success');
    //check same with barcode
    if (this.FormControl.value.trim() === this._data.currentItem.scanResults) {
      this.isBarcodeName = true;
      return;
    }
    // console.log('>>>>>>>>>>>>>>>>> check barcode success');
    //check if name include '_'
    if (this.FormControl.value.trim().includes('_')) {
      this.isInvalidName = true;
      return;
    }
    await this.inventoryService.updateItem(this._data.currentItem.id, this.FormControl.value.trim());
    this.matDialogRef.close(['Rename']);
    // }
  }

}
