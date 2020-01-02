import { Injectable } from '@angular/core';
import { FeathersService } from './feathers.service';
import { AuthenticationService } from './authentication.service';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { selfItemsServiceName, orderServiceName, outboundServiceName } from 'app/shared/common';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SelfItemsService implements Resolve<any>{

  // selfItems: any[];
  // selfItemsCount: Number = 0;
  // onSelfItemsChanged: BehaviorSubject<any>;
  orders: any[];
  ordersCount: Number = 0;
  onOrdersChanged: BehaviorSubject<any>;

  currentUser: any;

  // define pagination variables
  // orderSearchOption = { search: "", pageSize: 10, pageIndex: 0 };
  // onOrderSearchOptionChanged: BehaviorSubject<any>;

  private _unsubscribeAll: Subject<any>;
  selfItemsService: any;
  orderService: any;
  outboundService: any;

  constructor(private featherService: FeathersService, private authService: AuthenticationService) {
    this.selfItemsService = featherService.service(selfItemsServiceName);
    this.orderService = featherService.service(orderServiceName);
    this.outboundService = featherService.service(outboundServiceName);
    this.currentUser = this.authService.currentUserValue;
    // define subscription variables
    // this.onSelfItemsChanged = new BehaviorSubject([]);
    this.onOrdersChanged = new BehaviorSubject([]);

    // this.onOrderSearchOptionChanged = new BehaviorSubject({ search: "", pageSize: 10, pageIndex: 0 });
    // Set the private defaults
    this._unsubscribeAll = new Subject();
  }


  /**
     * Get orders
     *
     * @returns {Promise<any>}
     */
  getOrders(): Promise<any> {
    // console.log('getOrders invoked');
    if (!this.currentUser) { return new Promise(reject => reject('currentUser Error')); }
    return new Promise((resolve, reject) => {
      this.orderService.find({
        query: {
          user_id: this.currentUser.id,
          paginate: false,
        }
      }).then((response: any) => {
        this.ordersCount = response.length;
        this.orders = response;
        this.onOrdersChanged.next(this.orders);
        resolve(response);
      }).catch(error => {
        console.error('>>>> Service getOrders error');
        reject;
      });
    });
  }

  getSelfItemsByItemId(itemId): Promise<any> {
    if (!this.currentUser) return new Promise(reject => reject('Invalid user'));
    if (!itemId) return new Promise(reject => reject('Invalid itemId'));
    return new Promise((resolve, reject) => {
      this.selfItemsService.find({
        query: {
          user_id: this.currentUser.id,
          item_id: itemId,
          $sort: {
            after_order_qty: -1
          },
          paginate: false,
          findType: 'item-self'
        }
      }).then(response => {
        resolve(response);
      }).catch(error => {
        reject(error);
      })
    })
  }

  addNewOrder(data) {
    if (!this.currentUser) return;
    if (!data) return;
    return new Promise((resolve, reject) => {
      this.orderService.create({
        user_id: data.user_id,
        shippingLabel: data.shippingLabel,
        scanResults: data.scanResults
      }).then(response => {
        resolve(response);
      }).catch(error => {
        reject(error);
      })
    });
  }

  addNewOutbound(data) {
    if (!this.currentUser) return;
    if (!data) return;
    return new Promise((resolve, reject) => {
      this.outboundService.create(data).then(response => {
        resolve(response);
      }).catch(error => {
        reject(error);
      })
    });
  }

  updateOrder(scanResults) {

  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.getOrders(),
        // }
        // }),
      ]).then(
        () => {
          resolve();
        },
        reject
      );
    });
  }


}