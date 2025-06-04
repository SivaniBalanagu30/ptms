import { Component, OnInit, Output, EventEmitter, HostListener } from '@angular/core';
import { HttpService } from 'src/app/services/http-service/http.service';
import { RegExpPatterns, StaticDataEntity } from 'src/app/shared/static-data';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ViewChild } from '@angular/core';
import { FormGroup,FormControl,FormBuilder, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { DatePipe } from '@angular/common';
import { ColumnApi, GridReadyEvent } from 'ag-grid-community';
import { validateAllFormFields } from 'src/app/shared/utils/utils';
import { StringResourceErrors } from 'src/app/shared/static-data';
import { isBlank } from 'src/app/shared/utils/utils';
import { ToastService } from 'src/app/services/toast.service';
import { PageReloadService } from 'src/app/services/auto-reload/page-reload.service';

@Component({
  selector: 'app-resource-view',
  templateUrl: './resource-view.component.html',
  styleUrls: ['./resource-view.component.css']
})
export class ResourceViewComponent implements OnInit {
  @ViewChild('personalDetailsData') personalDetailsModal;
  @ViewChild('contractorEmploymentDetailsData') contractorEmpoymentDetailsModal;
  @ViewChild('salaryEmploymentDetailsData') salaryEmploymentDetailsModal;
  resourceId;
  resourceDetails;
  navigatePathOnBackClick:string = "";
  rowData = [];
  resourcesColumnDefs: any;
  allTimezones:any[] = [];
  roles = [];
  allEmploymentTypes = [];
  allManagers = [];
  projects = [];
  private gridApi: any;
  personalDetailsUpdateForm:FormGroup;
  contractEmploymentDetailsForm:FormGroup;
  salaryEmploymentDetailsForm:FormGroup;
  @Output() gridReadyEvent: EventEmitter<GridReadyEvent> = new EventEmitter<GridReadyEvent>();
  public gridColumnApi: ColumnApi;
  public _stringResourceErrors: StringResourceErrors = new StringResourceErrors();
  allContractors: any;
  resourceMode: string;
  constructor(private inactivityService: PageReloadService,private toast: ToastService, private httpservice: HttpService, private router:Router, private route: ActivatedRoute,private fb:FormBuilder, private notification: NotificationService, private datePipe : DatePipe) {
    this.personalDetailsUpdateForm = this.fb.group({    
      id:null,
      firstName:["", Validators.required],
      middleName:[""],
      lastName:["",Validators.required],
      email:["",[Validators.required,Validators.pattern(RegExpPatterns.emailPattern)]],
      phoneNumber:["",[Validators.required]],
      addressLine1:["",Validators.required],
      addressLine2:[""],
      city:["",Validators.required],
      state:["",Validators.required],
      country:["", Validators.required],
      zipCode:["", Validators.required],
      role:["", Validators.required],
      timeZone:["",Validators.required],
      uploadTimesheet:["no",Validators.required]
    })
    this.contractEmploymentDetailsForm = this.fb.group({
      id:null,
      employmentInfo:["", Validators.required],
      contractingFirmName:["", Validators.required],
      resourceId:["", Validators.required],
      startDate:[""],
      endDate:[''],
      signedNDA:[""],
      location:[''],
      sickDays:[null],
      vacationDays:[null],
      signedSecurityPolicy:[""],
      subcontractAggreementExecuted:[""],
      reportingManager:["", Validators.required],
      // role:["", Validators.required],
      status:["",Validators.required],
      hourlyPayRate:[null,Validators.required]
    },{validators:[Validators.required, this.validateContractingFirmName('employmentInfo','contractingFirmName')]})
    this.salaryEmploymentDetailsForm = this.fb.group({
      id:null,
      employmentInfo:['',Validators.required],
      contractingFirmName:[null, Validators.required],
      reportingManager:['',Validators.required],
      startDate:[''],
      endDate:[''],
      location:[''],
      // role:['',Validators.required],
      signedNDA:[''],
      signedSecurityPolicy:[''],
      subcontractAggreementExecuted:[""],
      sickDays:[null],
      vacationDays:[null],
      status:["",Validators.required],
      resourceId:["",Validators.required],
      hourlyPayRate:[null,Validators.required]
    },{validators:[Validators.required, this.validateContractingFirmName('employmentInfo','contractingFirmName')]})
   }
  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:keydown', ['$event'])

  onUserActivity(event: Event) {
    this.inactivityService.resetInactivityTimer();
  }
  ngOnInit(): void {
    this.inactivityService.startInactivityTimer();
    this.route.params.subscribe(params => {
      this.resourceId = params['id'];
    });   
    const currentUrl = this.router.url;
    const urlSegments = currentUrl.split('/');
    if(urlSegments[1] == 'vendors-list'){
      this.navigatePathOnBackClick = `vendors-list/view-vendor/${urlSegments[4]}/edit}`
    }else{
      this.navigatePathOnBackClick = urlSegments[1];
    }
    this.resourceMode = urlSegments[4];
  this.getResourceDetails();
  this.getAllRoles();
  this.getAllEmploymentTupes();
  this.getAllManagers();
  this.getAllContractors();
  this.getAllTimezones();
  this.resourcesColumnDefs = [
    { headerName: 'Project Name', field: 'project.project_name', tooltipField:'project.project_name', sortable: true, suppressSizeToFit: true, width: 180 },
    { headerName: 'Weekly Work Hours Limit', field: 'work_hour_limit', tooltipField:'work_hour_limit', sortable: true, suppressSizeToFit: true, width: 250 },
      { headerName: 'Project Manager', field: 'project.project_manager.first_name', tooltipField:'project.project_manager.first_name', sortable: true, suppressSizeToFit: true, width: 250 },
    { headerName: 'Time Approver', field:'project.time_approver.first_name', tooltipField:'project.time_approver.first_name', sortable: true, suppressSizeToFit: true, width: 250 },
    { headerName: 'Status', field: 'status', tooltipField:'status', sortable: true, suppressSizeToFit: true, width: 200,
    cellStyle:(params)=>{
      const status = params.value;
      if(status == 'Assigned'){
        return {color:'green'}
      }else{
        return {color:'red'}
      }
    }
   },

  ];
}
validateContractingFirmName(employmentType,contractingFirmName){
  return (group:FormGroup)=>{
    const employType = group.controls[employmentType];
    const firm = group.controls[contractingFirmName];
    if(employType.value == '3'){
      if(!firm.value){
        return firm.setErrors({required:true});
      }else{
        return firm.setErrors(null);
      }
    }
    if(employType.value == '2' || employType.value == '1'){
      return firm.setErrors(null);
    }
  }

}
onChangeEmploymentType(){
  this.resetEmploymentTypeForm();
}
resetEmploymentTypeForm(){
  this.contractEmploymentDetailsForm.controls['contractingFirmName'].markAsUntouched();
  this.salaryEmploymentDetailsForm.controls['hourlyPayRate'].markAsUntouched();
  this.salaryEmploymentDetailsForm.controls['contractingFirmName'].markAsUntouched();
  this.contractEmploymentDetailsForm.controls['hourlyPayRate'].markAsUntouched();
}
getAllContractors(){
  this.httpservice.doGet('allContactorsDropDown').subscribe((data)=>{
    this.allContractors = data;
  })
}
getAllTimezones(){
  this.httpservice.doGet(StaticDataEntity.timeZones).subscribe((zones)=>{
    this.allTimezones = zones;
  })
}
getAllManagers(){
  this.httpservice.doGet("allManagers").subscribe((data)=>{
    this.allManagers = data;
  })
}
getAllEmploymentTupes(){
  this.httpservice.doGet("AllEmploymentTypes").subscribe((data)=>{
    this.allEmploymentTypes = data;
  })
}
getAllRoles(){
  this.httpservice.doGet("allRoles").subscribe((data)=>{
    this.roles = data;
  })
}
minEndDate(date){
  if (!isBlank(date)) {
    return new Date(date);
  } else {
    return null;
  }
}

getResourceDetails(){
  this.httpservice.doGet(StaticDataEntity.getResourceByID.replace(/{id}/g, this.resourceId)).subscribe((result) => {
    this.resourceDetails = result;
    this.projects = this.resourceDetails.resource_projects;
  })
}
//Salary/W2/Contract
onResourcePersonalDetails(resources,details){
  this.personalDetailsModal.show();
  this.personalDetailsUpdateForm.patchValue({
      id:resources.id,
      firstName:resources?.first_name,
      middleName:resources?.middle_name,
      lastName:resources?.last_name,
      email:resources?.email_id,
      phoneNumber:resources?.primary_phone_number,
      addressLine1:resources?.addressline1,
      addressLine2:resources?.addressline2,
      city:resources?.city,
      state:resources?.state,
      country:resources?.country,
      zipCode:resources?.zipcode,
      role:this.resourceDetails.roles[0]?.id,
      timeZone:resources.timezone,
      uploadTimesheet:resources.upload_signed_timesheet == true ? 'yes' : 'no'
  })
}
//Contract
onContractorEmploymentDetails(resources,details){
  this.contractorEmpoymentDetailsModal.show();
  this.contractEmploymentDetailsForm.patchValue({
    id:resources.id,
      employmentInfo: String(resources.employement_type?.id),
      contractingFirmName:resources?.contract_firm?.company_name,
      resourceId:resources?.resource_number,
      startDate:this.datePipe.transform(resources?.employment_start_date, "MM-dd-yyyy"),
      endDate:this.datePipe.transform(resources?.employment_start_date,"MM-dd-yyyy"),
      signedNDA:resources?.signed_nda == true ? 'Yes' : 'No',
      signedSecurityPolicy:resources?.signed_security_policy == true ? 'Yes' : 'No',
      subcontractAggreementExecuted:resources?.subcontracting_agreement_executed == true ? 'Yes' : 'No',
      reportingManager:resources?.reporting_manager_id,
      // role:details.roles[0].id,
      status:resources?.status,
      hourlyPayRate:resources?.hourly_pay_rate,
      sickDays:resources?.sick_days,
      vacationDays:resources?.vacation_days,
      location:resources?.location,

  })
}
//Salary/W2
onSalaryEmploymentDetails(resources,details){
  this.salaryEmploymentDetailsModal.show();
  this.salaryEmploymentDetailsForm.patchValue({
    id:resources.id,
    employmentInfo: String(resources.employement_type?.id),
    contractingFirmName:resources?.contracting_firm_id,
    subcontractAggreementExecuted:resources?.subcontracting_agreement_executed == true ? 'Yes' : 'No',
    reportingManager:resources?.reporting_manager_id,
    startDate:this.datePipe.transform(resources?.employment_start_date, "MM-dd-yyyy"),
    endDate:this.datePipe.transform(resources?.employment_start_date,"MM-dd-yyyy"),
    location:resources?.location,
    // role:details.roles[0].id,
    signedNDA:resources?.signed_nda == true ? 'Yes' : 'No',
    signedSecurityPolicy:resources?.signed_security_policy == true ? 'Yes' : 'No',
    sickDays:resources?.sick_days,
    vacationDays:resources?.vacation_days,
    status:resources?.status,
    resourceId:resources?.resource_number,
    hourlyPayRate:resources?.hourly_pay_rate,
  });
}
newEndDate(date){
  return new Date(date);
}
//Contract/Salary/W2
updatePersonallDetails(){
  if(this.personalDetailsUpdateForm.valid){
    let personalDetailsForm = this.personalDetailsUpdateForm.value;
  let payload = {
    "id": personalDetailsForm.id,
    "first_name": personalDetailsForm.firstName,
    "middle_name": personalDetailsForm.middleName,
    "last_name": personalDetailsForm.lastName,
    "email_id": personalDetailsForm.email,
    "phone_number": personalDetailsForm.phoneNumber,
    "addressline1": personalDetailsForm.addressLine1,
    "addressline2": personalDetailsForm.addressLine2,
    "city": personalDetailsForm.city,
    "state": personalDetailsForm.state,
    "zipcode": personalDetailsForm.zipCode,
    "country": personalDetailsForm.country,
    "role":Number(personalDetailsForm.role),
    "timezone":Number(personalDetailsForm.timeZone),
    "upload_signed_timesheet":personalDetailsForm.uploadTimesheet == 'no' ? false : true
  }

  this.httpservice.doUpdate("updateResourcePersonolDetails",payload).subscribe((data)=>{
    if(data.message){
      // this.notification.showSucessNotification("Success",data.message);
      this.toast.showSuccess("success", "Success", data.message);
      this.personalDetailsModal.hide();
      this.getResourceDetails();
    }
    if(data.errorMessage){
      // this.notification.showErrorNotification("Error",data.errorMessage);
      this.toast.showError("error", "Error", data.errorMessage);
    }
  })
  }else{
    validateAllFormFields(this.personalDetailsUpdateForm);
  }
  
}
//Contract
updateContractorEmploymentDetails(){
  if(this.contractEmploymentDetailsForm.valid){
    let contractEmploymentForm = this.contractEmploymentDetailsForm.value;
  let payload = {
    "id": contractEmploymentForm.id,
    "employment_type_id": contractEmploymentForm.employmentInfo,
    "resource_number":contractEmploymentForm.resourceId,
    "reporting_manager_id": contractEmploymentForm.reportingManager,
    "signed_nda": contractEmploymentForm.signedNDA =="No" ? false : true,
    "signed_security_policy": contractEmploymentForm.ssignedSecurityPolicy == 'No' ? false : true,
    "employment_start_date": this.datePipe.transform(contractEmploymentForm.startDate, "yyyy-MM-dd"),
    "employment_end_date": this.datePipe.transform(contractEmploymentForm.endDate, "yyyy-MM-dd"),
    "contracting_firm_id": Number(this.resourceDetails?.resource_details?.contracting_firm_id),
    "subcontracting_agreement_executed": contractEmploymentForm.subcontractAggreementExecuted == 'No' ? false : true,
    "location": contractEmploymentForm.location,
    "vacation_days":contractEmploymentForm.vacationDays,
    "sick_days":contractEmploymentForm.sickDays,
    // "role_id": contractEmploymentForm.role,
    "status": contractEmploymentForm.status,
    "hourly_pay_rate": contractEmploymentForm.hourlyPayRate
  }
  this.httpservice.doUpdate("updateResourceEmploymentDetails",payload).subscribe((data)=>{
    if(data.message){
      // this.notification.showSucessNotification("Success",data.message);
      this.toast.showSuccess("success", "Success", data.message);
      this.contractorEmpoymentDetailsModal.hide();
      this.getResourceDetails();
    }
    if(data.errorMessage){
      // this.notification.showErrorNotification("Error",data.errorMessage);
      this.toast.showError("error", "Error", data.errorMessage);
    }
  })
  }else{
    validateAllFormFields(this.contractEmploymentDetailsForm);
  }
}
//For both Salary and W2
updateSalaryEmploymentDetails(){
  if(this.salaryEmploymentDetailsForm.valid){
    let salaryW2employmentForm = this.salaryEmploymentDetailsForm.value;
  let payload = {
    "id": salaryW2employmentForm.id,
    "employment_type_id": salaryW2employmentForm.employmentInfo,
    "resource_number":salaryW2employmentForm.resourceId,
    "reporting_manager_id": salaryW2employmentForm.reportingManager,
    "signed_nda": salaryW2employmentForm.signedNDA =="No" ? false : true,
    "signed_security_policy": salaryW2employmentForm.ssignedSecurityPolicy == 'No' ? false : true,
    "employment_start_date": this.datePipe.transform(salaryW2employmentForm.startDate, "yyyy-MM-dd"),
    "employment_end_date": this.datePipe.transform(salaryW2employmentForm.endDate, "yyyy-MM-dd"),
    "contracting_firm_id": salaryW2employmentForm.contractingFirmName,
    "subcontracting_agreement_executed": salaryW2employmentForm.subcontractAggreementExecuted == 'No' ? false : true,
    // "role_id": salaryW2employmentForm.role,
    "status": salaryW2employmentForm.status,
    "location": salaryW2employmentForm.location,
    "vacation_days":salaryW2employmentForm.vacationDays,
    "sick_days":salaryW2employmentForm.sickDays,
    "hourly_pay_rate": salaryW2employmentForm.hourlyPayRate
  }
  this.httpservice.doUpdate("updateResourceEmploymentDetails",payload).subscribe((data)=>{
    if(data.message){
      // this.notification.showSucessNotification("Success",data.message);
      this.toast.showSuccess("success", "Success", data.message);
      this.salaryEmploymentDetailsModal.hide();
      this.getResourceDetails();
    }
    if(data.errorMessage){
      // this.notification.showErrorNotification("Error",data.errorMessage);
      this.toast.showError("error", "Error", data.errorMessage);
    }
  })
  }else{
    validateAllFormFields(this.salaryEmploymentDetailsForm);
  }
}
closePersonalDetails(){
  this.personalDetailsModal.hide();
}
closeContractorEmploymentDetails(){
  this.contractorEmpoymentDetailsModal.hide();
  this.contractEmploymentDetailsForm.markAsUntouched();
}
closeSalaryEmploymentDetails(){
  this.salaryEmploymentDetailsModal.hide();
  this.salaryEmploymentDetailsForm.markAsUntouched();
}
stopManualEntry(event: KeyboardEvent) {
  const key = event.key;
  if (key === "Backspace" || key === "Delete") {
  } else {
    event.preventDefault();
  }
}
onGridReady(event: GridReadyEvent) : void{
  this.gridReadyEvent.emit(event);
  this.gridApi = event.api;
  this.gridColumnApi = event.columnApi;
  this.gridApi.sizeColumnsToFit();
  this.gridApi.setDomLayout('autoHeight');
  window.onresize = () => {
    this.gridApi.sizeColumnsToFit();
}
}
}
