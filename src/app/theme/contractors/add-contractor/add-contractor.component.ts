import { Component, HostListener, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpService } from 'src/app/services/http-service/http.service';
import { RegExpPatterns, StaticDataEntity } from 'src/app/shared/static-data';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { validateAllFormFields } from 'src/app/shared/utils/utils';
import { StringResourceErrors } from 'src/app/shared/static-data';
import { ToastService } from 'src/app/services/toast.service';
import { PageReloadService } from 'src/app/services/auto-reload/page-reload.service';

@Component({
  selector: 'app-add-contractor',
  templateUrl: './add-contractor.component.html',
  styleUrls: ['./add-contractor.component.css']
})
export class AddContractorComponent implements OnInit {
  addConractorForm: FormGroup;
  submitted: Boolean = false;
  public _stringResourceErrors: StringResourceErrors = new StringResourceErrors();
  constructor(private inactivityService: PageReloadService,private toast: ToastService, private fb: FormBuilder, private httpservice: HttpService,
     private router:Router, private route: ActivatedRoute, private notificationService: NotificationService) {


    this.addConractorForm = this.fb.group({
      firmName: ['', Validators.required],
      businessEmail:['',[Validators.pattern(RegExpPatterns.emailPattern),Validators.required]],
      firstName: [''],
      middleName: ['',],
      lastName: [''],
      email: ['', [Validators.pattern(RegExpPatterns.emailPattern)]],
      mobileNumber: [''],
      line1: ['', Validators.required],
      line2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      zipcode: ['',Validators.required]
    });
  }

  ngOnInit(): void {
    this.inactivityService.startInactivityTimer();
  }
  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:keydown', ['$event'])

  onUserActivity(event: Event) {
    this.inactivityService.resetInactivityTimer();
  }
  addContractor() {
    if(this.addConractorForm.valid){
      let form= this.addConractorForm.value;
    let Payload = {
      "company_name": form.firmName,
      "business_email":form.businessEmail,
      "contact_first_name": form.firstName,
      "contact_middle_name": form.middleName,
      "contact_last_name": form.lastName,
      "contact_email_id": form.email,
      "contact_phone_number": form.mobileNumber,
      "addressline1": form.line1,
      "addressline2": form.line2,
      "city": form.city,
      "state": form.state,
      "zipcode": form.zipcode,
      "country": form.firmName
    }
    this.httpservice.doPost(StaticDataEntity.addContractor, Payload).subscribe((result)=>{
      if(result.message){
        // this.notificationService.showSucessNotification('', result['message']);
        this.toast.showSuccess("success","Success", result['message']);
        this.router.navigate(['/vendors-list'])
      }else if (result.errorMessage) {
        // this.notificationService.showErrorNotification("Error", result.errorMessage);
        this.toast.showError("error", "Error", result.errorMessage);
      }
    }, (error) => {
      if (error.status === 400) {
        // this.notificationService.showWarningNotification("Error", error.error.detail);
        this.toast.showWarning("warn","Warning", error.error.detail);
      }
    });
    }else{
      validateAllFormFields(this.addConractorForm);
    }
          
  }
}
