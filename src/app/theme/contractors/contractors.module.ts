import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContractorsRoutingModule } from './contractors-routing.module';
import { ContractorsListComponent } from './contractors-list/contractors-list.component';
import { AddContractorComponent } from './add-contractor/add-contractor.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { ContractorViewComponent } from './contractor-view/contractor-view.component';
import { ToastrModule } from 'ngx-toastr';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import {ToastModule} from "primeng/toast"

@NgModule({
  declarations: [
    ContractorsListComponent,
    AddContractorComponent,
    ContractorViewComponent,
    
  ],
  imports: [
    CommonModule,
    ContractorsRoutingModule,
    FormsModule, ReactiveFormsModule ,
    AgGridModule,
    ToastrModule.forRoot(),
    ModalModule.forRoot(),
    SharedModule,
    ToastModule


  ]
})
export class ContractorsModule { }
