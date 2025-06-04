import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsDatepickerModule, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ClientsRoutingModule } from './clients-routing.module';
import { ClientsListComponent } from './clients-list/clients-list.component';
import { AddClientComponent } from './add-client/add-client.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { ClientViewComponent } from './client-view/client-view.component';
import { ProjectClientAddComponent } from './project-client-add/project-client-add.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { CustomDatePipe } from 'src/app/shared/datePipe/custom-date.pipe';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [
    ClientsListComponent,
    AddClientComponent,
    ClientViewComponent,
    ProjectClientAddComponent,
  ],
  imports: [
    CommonModule,
    ClientsRoutingModule,
    ReactiveFormsModule,
    ToastModule,
    AgGridModule,
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    NgMultiSelectDropDownModule.forRoot(),
    FormsModule,
    SharedModule

  ],
  providers:[
    CustomDatePipe
  ]

})
export class ClientsModule { }
