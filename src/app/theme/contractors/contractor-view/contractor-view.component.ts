import { Component, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { HttpService } from 'src/app/services/http-service/http.service';
import { RegExpPatterns, StaticDataEntity } from 'src/app/shared/static-data';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { validateAllFormFields } from 'src/app/shared/utils/utils';
import { ColumnApi, GridReadyEvent } from 'ag-grid-community';
import { StringResourceErrors } from 'src/app/shared/static-data';
import { ToastService } from 'src/app/services/toast.service';
import { PageReloadService } from 'src/app/services/auto-reload/page-reload.service';

@Component({
  selector: 'app-contractor-view',
  templateUrl: './contractor-view.component.html',
  styleUrls: ['./contractor-view.component.css']
})
export class ContractorViewComponent implements OnInit {
  contractId;
  contractDetails;
  resourceList: any;
  rowData = [];
  resourcesColumnDefs: any;
  private gridApi: any;
  public gridColumnApi: ColumnApi;
  contractorForm:FormGroup;
  public _stringResourceErrors: StringResourceErrors = new StringResourceErrors();
  @ViewChild('contractorData') contractorModal;
  @Output() gridReadyEvent: EventEmitter<GridReadyEvent> = new EventEmitter<GridReadyEvent>();
  contractorMode: string;


  constructor(private inactivityService: PageReloadService,private toast: ToastService, private httpservice: HttpService, private router:Router, private route: ActivatedRoute, private notification: NotificationService,
    private fb:FormBuilder) {
      this.contractorForm = this.fb.group({
        id:null,
        contractorName:['',Validators.required],
        businessEmail:['',[Validators.pattern(RegExpPatterns.emailPattern),Validators.required]],
        contactFirstName:[''],
        contactMiddleName:[''],
        contactLastName:[''],
        contactEmail:['',[Validators.pattern(RegExpPatterns.emailPattern)]],
        contactPh:['',[Validators.pattern(RegExpPatterns.usphonenumber)]],
        addLine1:['',Validators.required],
        addLine2:['',],
        city:['',Validators.required],
        state:['',Validators.required],
        country:['',Validators.required],
        zipcode:['',Validators.required],
        status:["",Validators.required]
      })
     }
     @HostListener('document:mousemove', ['$event'])
  @HostListener('document:keydown', ['$event'])

  onUserActivity(event: Event) {
    this.inactivityService.resetInactivityTimer();
  }

  ngOnInit(): void {
    this.inactivityService.startInactivityTimer();
    this.route.params.subscribe(params => {
      this.contractId = params['id'];
      const currentUrl = this.router.url;
      const urlSegments = currentUrl.split('/');
      this.contractorMode = urlSegments[4];
      this.resourcesColumnDefs = [
        { headerName: 'Resource ID', field: 'resource_number', tooltipField:'resource_number',sortable: true, suppressSizeToFit: true, width: 180 },
        { headerName: 'First Name', field: 'first_name', tooltipField:'first_name', sortable: true, suppressSizeToFit: true, width: 200 },
        { headerName: 'Last Name', field: 'last_name', tooltipField:'last_name', sortable: true, suppressSizeToFit: true, width: 200 },
        { headerName: 'Email Id', field: 'email_id', tooltipField:'email_id', sortable: true, suppressSizeToFit: true, width: 230 },
        { headerName: 'Status', field: 'status', tooltipField:'status', sortable: true, suppressSizeToFit: true, width: 150, cellRenderer:(params)=>{
          const status = params.value;
          const cellValue = status === 'Active' ? '<span style="color: #3F51B5;">Active</span>' : '<span style="color: red;">Inactive</span>';
          return cellValue;
        }  },
        {
          headerName: 'Actions',
          field: 'resource_details.status',
          sortable: true,
          suppressSizeToFit: true,
          width: 100,
          cellRenderer: (params: any) => {
            if(this.contractorMode == 'edit' || this.contractorMode == 'edit%7D'){
              // return '<i class="fa fa-eye" style="cursor: pointer; margin-right: 5px;" data-toggle="tooltip" data-placement="top" title="View Resource"></i>' 
              return "<i data-toggle='tooltip' data-placement='top' title='Edit resource' style='color: #3F51B5; cursor: pointer; font-size: 17px;'' class='edit fa fa-pencil-square-o'></i>";
            }
            // if(this.contractorMode == 'view'){
            //   return "<img class='view mr-1 mb-1' width='17' height='17' style='cursor:pointer' src='https://img.icons8.com/ios/50/fine-print--v1.png' alt='fine-print--v1' data-toggle='tooltip' data-placement='top' title='View resource' />";
            // }
                  //  '<i class="fa fa-pencil-square-o" style="cursor: pointer;"></i>';
          },
          onCellClicked: (params: any) => {
            const iconName = params.event.target.className;
            // if (iconName.includes('view')) {
            //   let resourceId = params.data.id;
            //   this.router.navigate(['/vendors-list', 'view-resource', resourceId, 'view']);
            // }
            if (iconName.includes('edit')) {
              let resourceId = params.data.id;
              this.router.navigate(['/vendors-list', 'view-resource', resourceId, this.contractId, 'edit']);
            }
          }
        }
        // {
        //   headerName: 'Actions',
        //   field: 'resource_details.status',
        //   sortable: true,
        //   suppressSizeToFit: true,
        //   width: 130,
        //   cellRenderer: (params: any) => {
        //     return '<i class="fa fa-pencil-square-o" style="cursor: pointer;"></i>';
        //   },
        //   onCellClicked: (params: any) => {
        //     const iconName = params.event.target.className;
        //     if(iconName.includes('fa-pencil')) {
        //       // this.router.navigate(['view-resource']);
        //     }
        //   }
        // }
        
      ];
  });
  this.getContractDetails();
}

getContractDetails(){
  this.httpservice.doGet(StaticDataEntity.getContractorByID.replace(/{id}/g, this.contractId)).subscribe((result) => {
    this.contractDetails = result;
    this.resourceList = result.resources;
  })
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

showModal(contractorData){
  this.contractorModal.show();
  this.contractorForm.patchValue({
    id:contractorData?.contractor_details?.id,
    contractorName:contractorData?.contractor_details?.company_name,
    businessEmail:contractorData?.contractor_details?.business_email,
    contactFirstName:contractorData?.contractor_details?.contact_first_name,
    contactMiddleName:contractorData?.contractor_details?.contact_middle_name,
    contactLastName:contractorData?.contractor_details?.contact_last_name,
    contactEmail:contractorData?.contractor_details?.contact_email_id,
    contactPh:contractorData?.contractor_details?.contact_phone_number,
    addLine1:contractorData?.contractor_details?.addressline1,
    addLine2:contractorData?.contractor_details?.addressline2,
    city:contractorData?.contractor_details?.city,
    state:contractorData?.contractor_details?.state,
    country:contractorData?.contractor_details?.country,
    zipcode:contractorData?.contractor_details?.zipcode,
    status: contractorData?.contractor_details?.status,
  })
}

hideModal(){
  this.contractorModal.hide();
}

updateContractor(){
  if(this.contractorForm.valid){
    let form = this.contractorForm.value;
  let payload ={
    "id":form.id,
    "company_name": form.contractorName,
    "business_email":form.businessEmail,
    "contact_first_name": form.contactFirstName,
    "contact_middle_name": form.contactMiddleName,
    "contact_last_name": form.contactLastName,
    "contact_email_id": form.contactEmail,
    "contact_phone_number": form.contactPh,
    "addressline1": form.addLine1,
    "addressline2": form.addLine2,
    "city": form.city,
    "state": form.state,
    "zipcode": form.zipcode,
    "country": form.country,
    "status": form.status,
  }
  this.httpservice.doUpdate(StaticDataEntity.updateContractor, payload).subscribe((result) => {
    if(result.message){
      // this.notification.showSucessNotification('Success',result.message);
      this.toast.showSuccess("success", "Success", result.message);
      this.hideModal();
      this.getContractDetails();
    }else if(result.errorMessage){
      // this.notification.showErrorNotification('Error',result.errorMessage);
      this.toast.showError("error", "Error", result.errorMessage);
    }
  },  (error) => {
    if (error.status === 400) {
      // this.notification.showWarningNotification("Error", error.error.detail);
      this.toast.showWarning("warn", "Warning", error.error.detail);
    }
  }); 
  }else{
    validateAllFormFields(this.contractorForm);
  }



}

}
