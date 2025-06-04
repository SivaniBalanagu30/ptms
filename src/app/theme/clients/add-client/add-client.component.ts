import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { HttpService } from 'src/app/services/http-service/http.service';
import { RegExpPatterns, StaticDataEntity } from 'src/app/shared/static-data';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import {validateAllFormFields} from 'src/app/shared/utils/utils'
import { StringResourceErrors } from 'src/app/shared/static-data';
import { ToastService } from 'src/app/services/toast.service';
import { PageReloadService } from 'src/app/services/auto-reload/page-reload.service';
@Component({
  selector: 'app-add-client',
  templateUrl: './add-client.component.html',
  styleUrls: ['./add-client.component.css']
})
export class AddClientComponent implements OnInit {
showFields: boolean = false;


  public addClientForm: FormGroup = new FormGroup({
  });
  public _stringResourceErrors: StringResourceErrors = new StringResourceErrors();
  constructor(private inactivityService: PageReloadService,private toast: ToastService, private fb: FormBuilder, private notificationService: NotificationService,
    private httpservice: HttpService, private router: Router, private readonly piper: DatePipe,
    private route: ActivatedRoute) {
    this.createClientForm();
  }
  createClientForm() {
    this.addClientForm = this.fb.group({
      clientName: new FormControl('', Validators.required),
      contactFirstName: new FormControl('', Validators.required),
      contactMiddleName: new FormControl(''),
      contactLastName: new FormControl('', Validators.required),
      contactEmail: new FormControl('', [Validators.required,Validators.pattern(RegExpPatterns.emailPattern)]),
      contactPhoneNumber: new FormControl(''),
      addressLine1: new FormControl('', Validators.required),
      addressLine2: new FormControl(''),
      city: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      country: new FormControl('', Validators.required),
      zipCode: new FormControl('', Validators.required),
      executed: new FormControl('', Validators.required),
      contactNumberSOW: new FormControl('', Validators.required),
      executedDate: new FormControl('', Validators.required),
      termStartDate: new FormControl('', Validators.required),
      termEndDate: new FormControl('', Validators.required),
      notes: new FormControl('')
    },{validators:[Validators.required, this.validateExecuted('executed','contactNumberSOW','executedDate','termStartDate','termEndDate')]})
  }
  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:keydown', ['$event'])

  onUserActivity(event: Event) {
    this.inactivityService.resetInactivityTimer();
  }
  ngOnInit(): void {
    this.inactivityService.startInactivityTimer();
  }
  validateExecuted(executed,contactNumberSOW,executedDate,termStartDate,termEndDate){
    return (group:FormGroup)=>{
      const executedType = group.controls[executed];
      const contractNumbersow = group.controls[contactNumberSOW];
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
  newEndDate(date){
    return new Date(date);
  }
  changeContract(value){
    if(value === 'Yes'){
      this.showFields = true;
    }else{
      this.showFields = false;
    }

  }
  stopManualEntry(event: KeyboardEvent) {
    const key = event.key;
    if (key === "Backspace" || key === "Delete") {
    } else {
      event.preventDefault();
    }
  }

  addClient() {
    let form = this.addClientForm.value
    if(this.addClientForm.valid){
      let payload = {
        "client_name": form.clientName,
        "contact_first_name": form.contactFirstName,
        "contact_middle_name": form.contactMiddleName,
        "contact_last_name": form.contactLastName,
        "email_id": form.contactEmail,
        "primary_phone_number": form.contactPhoneNumber,
        "addressline1": form.addressLine1,
        "addressline2": form.addressLine2,
        "city": form.city,
        "state": form.state,
        "zipcode": form.zipCode,
        "country": form.country,
        "contract_agreement_executed": form.executed == 'Yes' ? true : false,
        "contract_number": form.contactNumberSOW,
        "contract_executed_date": this.piper.transform(form.executedDate, 'yyyy-MM-dd'),
        "term_start_date": this.piper.transform(form.termStartDate, 'yyyy-MM-dd'),
        "term_end_date": this.piper.transform(form.termEndDate, 'yyyy-MM-dd'),
        "comments": form.notes,
      }
      this.httpservice.doPost(StaticDataEntity.addClient, payload).subscribe((result) => {
        if (result.message) {
          // this.notificationService.showSucessNotification('', result['message']);
          this.toast.showSuccess("success", "Success", result['message']);
          this.router.navigate(['/clients-list'])
        } else if(result.errorMessage){
          // this.notificationService.showErrorNotification('', result['errorMessage']);
          this.toast.showError("error", "Error", result['errorMessage']);
        }
       
      },
      (error) => {
        if (error.status === 400) {
          // this.notificationService.showWarningNotification("Error", error.error.detail);
          this.toast.showWarning("warn", "Warning", error.error.detail);
        }
      });
  
      
    }else{
      validateAllFormFields(this.addClientForm)
    }
  
  }


}
