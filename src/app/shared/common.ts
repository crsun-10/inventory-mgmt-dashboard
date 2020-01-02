// export var tokenKey: string = "antara_token";
// export var apiURL: string = 'http://localhost:3030';
// export var apiURL: string = 'https://antarapacker-api.herokuapp.com/';

// feathers service variables
export var usersServiceName = 'users';
export var selfItemsServiceName = 'self-items';
export var orderServiceName = 'orders';
export var outboundServiceName = 'outbounds';


export interface StaffElement {
    name: string;
    email: string;
    employerId: number;
    pengdingInvitationId: string;
    // createdAt: Date;
    // updatedAt: Date;
}

export interface InventoryElement {
    name: string;
    user_id: number;
    scanResults: string;
}

// export interface OrderElement {
//     label: string;
//     email: string;
//     employerId: number;
//     pengdingInvitationId: number;
//     createdAt: Date;
//     updatedAt: Date;
// }

export class OutboundItemElement {
    order_id?: number;
    // selfitem_id: number;
    item_id: number;
    // shelf_id: number;
    qty: number;
    itemId_qty_str: string;
    type: string
    constructor(item) {
        this.order_id = item.id || null;
        // this.selfitem_id = item.selfitem_id || null;
        this.item_id = item.item_id || null;
        // this.shelf_id = item.shelf_id || null;
        this.qty = item.stock_qty || 1;
        this.itemId_qty_str = item.itemId_qty_str || ''
        this.type = item.type || 'new'
    }
}