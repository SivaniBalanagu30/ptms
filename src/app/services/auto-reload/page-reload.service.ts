import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PageReloadService {
  private inactivityTimer: ReturnType<typeof setTimeout>;
  constructor() { }

  startInactivityTimer() {
    this.inactivityTimer = setTimeout(() => {
      // Reload the application or perform necessary actions here
      window.location.reload();
    }, 30 * 60 * 1000); // 30 minutes in milliseconds
  }

  resetInactivityTimer() {
    clearTimeout(this.inactivityTimer);
    this.startInactivityTimer();
  }

}
