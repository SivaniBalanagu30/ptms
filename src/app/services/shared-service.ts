import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private params: any;
  public usernameSource = new BehaviorSubject<any>({}); // Set an initial value for the username
  public currentUsername = this.usernameSource.asObservable();

  setParams(data: any) {
    this.params = data;
  }

  getParams() {
    return this.params;
  }
  updateUsername(username: any):void {
    this.usernameSource.next(username);
  }
}
