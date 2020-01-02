import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
// import { DialogAlertComponent } from './dialog/dialog-alert/dialog-alert.component';

@Injectable({
  providedIn: 'root'
})
export class CommonAlertService {

  constructor(
    private _snackBar: MatSnackBar,
  ) { }

  typeSuccess(title = "Good Job!", message = "Success", duration = 3000) {
    this._snackBar.open(message, title, {
      duration: duration
    });
  }
  typeError(title = "Error!", message = "Error", duration = 3000) {
    this._snackBar.open(message, title, {
      duration: duration
    });
  }

  dialogSuccess(title = "Good Job!", message = "Success") {
    //   this.dialog.open(DialogAlertComponent, {
    //     data: {
    //       title: title,
    //       message: message
    //     }
    //   });
  }
}
