import { Injectable, OnDestroy } from '@angular/core';
import { FeathersService } from './feathers.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { AuthenticationService } from './authentication.service';
import { takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InventoryService implements Resolve<any> {

  items: any[];
  itemsPF: any[];

  // itemsCount: number = 0;
  // onItemsCountSub: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  itemsPFCount: number = 0;
  onItemsChanged: BehaviorSubject<any>;
  onItemsPFChanged: BehaviorSubject<any>;

  unverifiedItems: any[];
  unverifiedItemsCount: number = 0;
  onUnverifiedItemsChanged: BehaviorSubject<any>;

  currentUser: any;

  private _unsubscribeAll: Subject<any>;

  inventoryService: any;
  // unverifiedItemService: any;

  constructor(private featherService: FeathersService, private authService: AuthenticationService) {
    this.inventoryService = featherService.service('items');
    // this.unverifiedItemService = featherService.service('unverified-items');
    this.currentUser = this.authService.currentUserValue;
    // define subscription variables
    this.onItemsChanged = new BehaviorSubject([]);
    this.onItemsPFChanged = new BehaviorSubject([]);
    this.onUnverifiedItemsChanged = new BehaviorSubject([]);

    // this.onInventorySearchOptionChanged = new BehaviorSubject({ search: "", pageSize: 10, pageIndex: 0 });
    // Set the private defaults
    this._unsubscribeAll = new Subject();
  }

  getInventories() {
    // console.log('get all inventories invoked');
    if (!this.currentUser) { return; }
    this.items = [];
    this.inventoryService.find({
      query: {
        user_id: this.currentUser.id,
        verified_status: true,
        paginate: false,
        // $limit: limit,
        // $skip: skip,
        // $limit: this.inventorySearchOption.pageSize,
        // $skip: this.inventorySearchOption.pageIndex * this.inventorySearchOption.pageSize,
        findType: 'item-self'
      },
    }).then(response => {
      // console.log('inventory Service all items:', response);
      // this.itemsCount = response.total;
      // this.onItemsCountSub.next(response.total);
      // this.items = response.data;
      this.onItemsChanged.next(response);
    }).catch(error => {
      console.error("get Inventory error:", JSON.stringify(error));
    })
  }

  getAllInventories() {
    // console.log('get all PF inventories invoked');
    if (!this.currentUser) { return; }
    this.itemsPF = [];
    this.inventoryService.find({
      query: {
        user_id: this.currentUser.id,
        verified_status: true,
        findType: 'item-self',
        paginate: false
      },
    }).then(response => {
      // console.log('inventory Service all items PF:', response);
      this.itemsPFCount = response.length;
      this.itemsPF = response;
      this.onItemsPFChanged.next(this.itemsPF);
    }).catch(error => {
      console.error("get all PF Inventory error:", JSON.stringify(error));
    })
  }

  getAllUnverifiedItems() {
    // console.log('get all unverified items invoked');
    if (!this.currentUser) { return; }
    this.unverifiedItems = [];
    // this.unverifiedItemService.find({
    //   query: {
    //     user_id: this.currentUser.id,
    //     verified_status: false
    //   }
    this.inventoryService.find({
      query: {
        user_id: this.currentUser.id,
        verified_status: false,
        paginate: false,
        findType: 'item-self'
      }
    }).then(response => {
      // console.log('>>>>>>>>>>>>>>>>>>>inventory Service get all unverified items:', response);
      // this.unverifiedItemsCount = response.total;
      // this.unverifiedItems = response.data;
      // this.onUnverifiedItemsChanged.next(this.unverifiedItems);
      this.unverifiedItemsCount = response.length;
      this.unverifiedItems = response;
      this.onUnverifiedItemsChanged.next(this.unverifiedItems);
    }).catch(error => {
      console.log('get Unverified Items error:', error);
    })
  }

  updateItem(id, newName) {
    if (!this.currentUser) { return; }
    this.inventoryService.patch(id, { name: newName })
      .then(response => {
        this.getInventories();
      }).catch(error => {
        console.log('update item name error:', error);
      })
  }

  getInventoryCreateEvent() {
    this.inventoryService.on('created', async (data) => {
      // if (this.currentUser.id == data.employerId) {
      this.getAllUnverifiedItems();
    });
  }

  updateItemVerify(id, newName) {
    if (!this.currentUser) { return; }
    return new Promise((resolve, reject) => {
      this.inventoryService.patch(id, { name: newName, verified_status: true })
        .then(response => {
          this.getInventories();
          resolve(response);
        }).catch(error => {
          console.log('update item name error:', error);
          reject(error);
        })
    });
  }

  isExistName(name): Promise<any> {
    if (!this.currentUser) return;
    if (!name) return;
    return new Promise((resolve, reject) => {
      this.inventoryService.find({
        query: {
          name: name,
          user_id: this.currentUser.id
        }
      }
      ).then(response => {
        resolve(response);
      }).catch(error => {
        reject(error);
      })
    });
  }

  addNewInventory(name, scanResults) {
    if (!this.currentUser) { return; }
    return new Promise((resolve, reject) => {
      this.inventoryService.create({
        user_id: this.currentUser.id,
        scanResults: scanResults,
        name: name
      }).then(response => {
        resolve(response);
      }).catch(error => {
        reject(error);
      })
    });
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    // console.log('inventory resolve');
    this.currentUser = this.authService.currentUserValue;
    return new Promise((resolve, reject) => {
      Promise.all([
        this.getAllUnverifiedItems(),
        this.getInventories(),
      ]).then(
        () => {
          resolve();
        },
        reject
      );
    });
  }

}
