import { Component, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { HttpService } from 'src/app/services/http-service/http.service';
import { RegExpPatterns, StaticDataEntity } from 'src/app/shared/static-data';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { ColumnApi, GridReadyEvent } from 'ag-grid-community';
import { DatePipe } from '@angular/common';
import { isBlank, validateAllFormFields } from 'src/app/shared/utils/utils';
import { CustomDatePipe } from 'src/app/shared/datePipe/custom-date.pipe';
import { StringResourceErrors } from 'src/app/shared/static-data';
import { ToastService } from 'src/app/services/toast.service';
import { PageReloadService } from 'src/app/services/auto-reload/page-reload.service';

@Component({
  selector: 'app-client-view',
  templateUrl: './client-view.component.html',
  styleUrls: ['./client-view.component.css']
})
export class ClientViewComponent implements OnInit {
  clientId;
  clientDetails;
  rowData = [];
  private gridApi: any;
  projectsColumnDefs: any;
  @ViewChild('clientData') clientModal;
  clientForm: FormGroup;
  showFields: Boolean = false;
  public gridColumnApi: ColumnApi;
  public _stringResourceErrors: StringResourceErrors = new StringResourceErrors();
  @Output() gridReadyEvent: EventEmitter<GridReadyEvent> = new EventEmitter<GridReadyEvent>();
  clientMode: string;
  constructor(private inactivityService: PageReloadService,private httpservice: HttpService, private fb: FormBuilder,
    private notification: NotificationService,
    private toast: ToastService,
     private router: Router, private route: ActivatedRoute, private datePipe: DatePipe, private customDatePipe: CustomDatePipe) {
    this.clientForm = this.fb.group({
      id: null,
      clientName: ['', Validators.required],
      contactFirstName: ['', Validators.required],
      contactMiddleName: [''],
      contactLastName: ['',Validators.required],
      contactEmail: ['',[Validators.required,Validators.pattern(RegExpPatterns.emailPattern)]],
      contactPh: [''],
      addLine1: ['',Validators.required],
      addLine2: [''],
      city: ['',Validators.required],
      state: ['',Validators.required],
      country: ['',Validators.required],
      zipcode: ['',Validators.required],
      executed: ['',Validators.required],
      executedDate: ['',Validators.required],
      contractNumber: ['',Validators.required],
      termStartDate: [new Date(),Validators.required],
      termEndDate: ['',Validators.required],
      notes: [''],
      status:['',Validators.required]
    },{validators:[Validators.required, this.validateExecuted('executed','contractNumber','executedDate','termStartDate','termEndDate')]})

  }

  changeContract(value) {
    // this.showFields = value;
    if(value == 'Yes'){
      this.showFields = true;
    }else{
      this.showFields = false;
    }
  }
  validateExecuted(executed,contractNumber,executedDate,termStartDate,termEndDate){
    return (group:FormGroup)=>{
      const executedType = group.controls[executed];
      const contractNumbersow = group.controls[contractNumber];
      const executeddate = group.controls[executedDate];
      const termstartDate = group.controls[termStartDate];
      const termendDate = group.controls[termEndDate];
      if(executedType.value == 'Yes'){
        if(!executedType.value){
          return contractNumbersow.setErrors({required:true}),executeddate.setErrors({required:true}),termstartDate.setErrors({required:true}),termendDate.setErrors({required:true});
        }else{
          return executedType.setErrors(null);
        }
      }
      if(executedType.value == 'No'){
        return contractNumbersow.setErrors(null),executeddate.setErrors(null),termstartDate.setErrors(null),termendDate.setErrors(null);
      }
    }
  }
  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:keydown', ['$event'])

  onUserActivity(event: Event) {
    this.inactivityService.resetInactivityTimer();
  }
  ngOnInit(): void {
    this.inactivityService.startInactivityTimer();
    this.route.params.subscribe(params => {
      this.clientId = params['id'];
      const currentUrl = this.router.url;
      const urlSegments = currentUrl.split('/');
      this.clientMode = urlSegments[4];
      this.projectsColumnDefs = [
        { headerName: 'Project Name', field: 'project_details.project_name', tooltipField:'project_details.project_name',sortable: true, suppressSizeToFit: true, width: 260 },
        { headerName: 'Resources', field: 'resource_count', tooltipField:'resource_count', sortable: true, suppressSizeToFit: true, width: 260 },
        // { headerName: 'Start Date', field: 'project_details.start_date', sortable: true, suppressSizeToFit: true, width: 210 },
        // { headerName: 'End Date', field: 'project_details.end_date', sortable: true, suppressSizeToFit: true, width: 250 },
        {
          headerName: 'Start Date',
          field: 'project_details.start_date',
          sortable: true,
          suppressSizeToFit: true,
          width: 150,
          valueGetter: (params) => {
            const startandEndDate = params.data?.project_details.start_date;
            if (startandEndDate) {
              const formattedStartDate = this.customDatePipe.transform(startandEndDate);
              return `${formattedStartDate}`;
            }
            return '';
          },
          tooltipValueGetter:(params:any)=>{
            const startandEndDate = params.data?.project_details.start_date;
            if (startandEndDate) {
              const formattedStartDate = this.customDatePipe.transform(startandEndDate);
              return `${formattedStartDate}`;
            }
            return '';
          }
        },
        {
          headerName: 'End Date',
          field: 'project_details.end_date',
          sortable: true,
          suppressSizeToFit: true,
          width: 150,
          valueGetter: (params) => {
            const startandEndDate = params.data?.project_details.end_date;
            if (startandEndDate) {
              const formattedStartDate = this.customDatePipe.transform(startandEndDate);
              return `${formattedStartDate}`;
            }
            return '';
          },
          tooltipValueGetter:(params:any)=>{
            const startandEndDate = params.data?.project_details.end_date;
            if (startandEndDate) {
              const formattedStartDate = this.customDatePipe.transform(startandEndDate);
              return `${formattedStartDate}`;
            }
            return '';
          }
        },
        { headerName: 'Status', field: 'project_details.status', tooltipField:'project_details.status', sortable: true, suppressSizeToFit: true, width: 170,cellRenderer:(params)=>{
          const status = params.value;
          const cellValue = status === 'Active' ? '<span style="color: #3F51B5;">Active</span>' : '<span style="color: red;">Inactive</span>';
          return cellValue;
        }  },
        {
          headerName: 'Actions',
          field: 'status',
          tooltipField:'status',
          sortable: true,
          suppressSizeToFit: true,
          width: 120,
          cellRenderer: (params: any) => {
            // return '<i class="fa fa-eye" style="cursor: pointer; margin-right: 5px;" data-toggle="tooltip" data-placement="top" title="View Project"></i>' 
              // '<i class="fa fa-pencil-square-o" style="cursor: pointer;"></i>';
              if(this.clientMode == 'edit'){
                // return '<i class="fa fa-eye" style="cursor: pointer; margin-right: 5px;" data-toggle="tooltip" data-placement="top" title="View Resource"></i>' 
                return "<i data-toggle='tooltip' data-placement='top' title='Edit project' style='color: #3F51B5; cursor: pointer; font-size: 17px;'' class='edit fas fa-file-pen'>";
              }
              // else if(this.clientMode == 'view'){
              //   return "<img class='view mr-1' width='20' height='20' style='cursor:pointer' src='https://img.icons8.com/ios/50/fine-print--v1.png' alt='fine-print--v1' data-toggle='tooltip' data-placement='top' title='View resource' />";
              // }
              // return "<img class='edit' width='20' height='20' style='cursor:pointer' src='https://img.icons8.com/ios/50/create-new.png' alt='create-new' data-toggle='tooltip' data-placement='top' title='Edit resource'/> <img class='view mr-1' width='20' height='20' style='cursor:pointer' src='https://img.icons8.com/ios/50/fine-print--v1.png' alt='fine-print--v1' data-toggle='tooltip' data-placement='top' title='View resource' />"
          },
          onCellClicked: (params: any) => {
            const iconName = params.event.target.className;
            // if (iconName.includes('view')) {
            //   let projectId= params.data.project_details.id
            //   this.router.navigate(['clients-list/project-view', projectId,'view']);
            // }
            if (iconName.includes('edit')) {
              let projectId= params.data.project_details.id
              this.router.navigate(['clients-list/project-view', projectId, this.clientId, 'edit']);
              // this.router.navigate(['add-client']);
            }
          }
        }

      ]
    });
    this.getClientDetails();
  }
  onGridReady(event: GridReadyEvent): void {
    this.gridReadyEvent.emit(event);
    this.gridApi = event.api;
    this.gridColumnApi = event.columnApi;
    this.gridApi.sizeColumnsToFit();
    this.gridApi.setDomLayout('autoHeight');
    window.onresize = () => {
      this.gridApi.sizeColumnsToFit();
  }
  }


  addProject() {
    let resourceId = this.clientDetails?.client_details?.id;
    this.router.navigate(['/clients-list','clientProject-add',resourceId]);
  }
  

  getClientDetails() {
    this.httpservice.doGet(StaticDataEntity.getClientByID.replace(/{id}/g, this.clientId)).subscribe((result) => {
      this.clientDetails = result;
    })
  }
  showModal(clientData) {
    this.clientModal.show();
    this.clientForm.patchValue({
      id: clientData?.client_details?.id,
      clientName: clientData?.client_details?.client_name,
      contactFirstName: clientData?.client_details?.contact_first_name,
      contactMiddleName: clientData?.client_details?.contact_middle_name,
      contactLastName: clientData?.client_details?.contact_last_name,
      contactEmail: clientData?.client_details?.email_id,
      contactPh: clientData?.client_details?.primary_phone_number,
      addLine1: clientData?.client_details?.addressline1,
      addLine2: clientData?.client_details?.addressline2,
      city: clientData?.client_details?.city,
      state: clientData?.client_details?.state,
      country: clientData?.client_details?.country,
      zipcode: clientData?.client_details?.zipcode,
      executed: clientData?.client_details?.contract_agreement_executed == true ? 'Yes' : 'No',
      contractNumber: clientData?.client_details?.contract_number,
      executedDate: this.datePipe.transform(clientData?.client_details?.contract_executed_date, "MM-dd-yyyy"),
      termStartDate: this.datePipe.transform(clientData?.client_details?.term_start_date,"MM-dd-yyyy"),
      termEndDate: this.datePipe.transform(clientData?.client_details?.term_end_date,"MM-dd-yyyy"),
      notes: clientData?.client_details?.comments,
      status:clientData?.client_details?.status,
    })

  }

  hideModal() {
    this.clientModal.hide();
  }

  updateClient() {
    if(this.clientForm.valid){
      let form = this.clientForm.value;
    let payload = {
      "id": form.id,
      "client_name": form.clientName,
      "contact_first_name":form.contactFirstName,
      "contact_middle_name": form.contactMiddleName,
      "contact_last_name": form.contactLastName,
      "email_id":form.contactEmail,
      "primary_phone_number": form.contactPh,
      "addressline1":form.addLine1,
      "addressline2": form.addLine1,
      "city": form.city,
      "state": form.state,
      "zipcode": form.zipcode,
      "country": form.country,
      "contract_agreement_executed": form.executed == 'Yes' ? true : false,
      "contract_number": form.contractNumber,
      "contract_executed_date":this.datePipe.transform(form.executedDate,"yyyy-MM-dd"),
      "term_start_date":this.datePipe.transform(form.termStartDate,"yyyy-MM-dd"),
      "term_end_date": this.datePipe.transform(form.termEndDate,"yyyy-MM-dd"),
      "status": form.status,
      "comments": form.notes,
    }
    this.httpservice.doUpdate(StaticDataEntity.updateClient, payload).subscribe((result) => {
      if(result.message){
        // this.notification.showSucessNotification('',result.message);
        this.toast.showSuccess("success", "Success", result.message);
        this.hideModal();
        this.getClientDetails();
      };
      if(result.errorMessage){
        // this.notification.showErrorNotification('Error',result.errorMessage);
        this.toast.showError("error","Error", result.errorMessage);
      }
    },
    (error) => {
      if (error.status === 400) {
        // this.notification.showWarningNotification("Error", error.error.detail);
        this.toast.showWarning("warn", "Warning", error.error.detail);
      }
    });
    }else{
      validateAllFormFields(this.clientForm);
    }

  }
  newEndDate(date){
    if (!isBlank(date)) {
      return new Date(date);
    } else {
      return null;
    }
  }


}
