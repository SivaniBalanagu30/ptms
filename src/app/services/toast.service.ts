import { Injectable } from '@angular/core';
import {MessageService } from "primeng/api"


@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private messageService  : MessageService) { }

  showSuccess(severity: string, summary: string, detail: string) {
    this.messageService.add({ severity: severity,summary: summary, detail:detail });
  }
  showError(severity: string, summary: string, detail: string){
    this.messageService.add({ severity: severity, summary: summary, detail:detail });
  }
  showInfo(severity: string, summary: string, detail: string){
    this.messageService.add({ severity: severity, summary: summary, detail:detail });
  }
  showWarning(severity: string, summary: string, detail: string){
    this.messageService.add({ severity: severity, summary: summary, detail:detail });
  }
}
