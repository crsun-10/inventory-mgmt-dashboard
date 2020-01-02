import { Injectable } from '@angular/core';
// import { apiURL, tokenKey } from 'app/shared/common';
// import { tokenKey } from 'app/shared/common';
import { environment } from 'environments/environment';

import * as feathersRx from 'feathers-reactive';
import * as io from 'socket.io-client';

import feathers from '@feathersjs/feathers';
import feathersSocketIOClient from '@feathersjs/socketio-client';
import feathersAuthClient2 from '@feathersjs/authentication-client';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class FeathersService {

  private _feathers = feathers();                     // init socket.io
  // private _socket = io(apiURL);      // init feathers
  private _socket = io(environment.apiUrl);      // init feathers

  private feathersAuthClient = require('@feathersjs/authentication-client').default;

  constructor(private router: Router) {
    this._feathers
      .configure(feathersSocketIOClient(this._socket))  // add socket.io plugin
      .configure(this.feathersAuthClient({                   // add authentication plugin
        storage: window.localStorage
      }))
      .configure(feathersRx({                           // add feathers-reactive plugin
        idField: '_id'
      }));
  }

  public service(name: string) {
    return this._feathers.service(name);
  }
  public authenticate(credentials?) {
    let data = { strategy: 'local', email: credentials.email, password: credentials.password }
    // console.log(data);
    return this._feathers.authenticate(data);
  }

  public refreshAuthenticate() {
    return this._feathers.authenticate().then(response => {
    }).catch(error => {
      localStorage.removeItem(environment.tokenKey);
      return;
    });
  }
  public logout() {
    return this._feathers.logout();
  }
}
