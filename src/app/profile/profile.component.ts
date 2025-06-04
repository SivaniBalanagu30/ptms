import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpService } from '../services/http-service/http.service';
import { StaticDataEntity } from '../shared/static-data';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { NotificationService } from '../services/notification-service/notification.service';
import { validateAllFormFields } from '../shared/utils/utils';
import { StringResourceErrors } from 'src/app/shared/static-data';
import { GeneratePdfService } from '../services/timesheet-generate-pdf/generate-pdf.service';
import {NgxCroppedEvent, NgxPhotoEditorService} from "ngx-photo-editor";
import { SharedService } from '../services/shared-service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  @ViewChild('profilePersonalDetailsData') profilePersonalDetailsModal;
  userName:string = "";
  // signImagePath:string = "";
  // imageFileName:string = "";
  // selectedFiles:any;
  // hasImageError:boolean = false;
  // hasImageUploaded:boolean = false;
  resourceId;
  resourceDetails;
  id = localStorage.getItem('userId');
  projectName;
  resourcesColumnDefs;
  private gridApi: any;
  employmentTypes: any[] = [];
  profilePersnoalDetailsForm: FormGroup;


  // public _stringResourceErrors: StringResourceErrors = new StringResourceErrors();
  file: any;
  blobFile: File;
  constructor(private toast : ToastService, private httpservice: HttpService, private router: Router, private route: ActivatedRoute, private fb: FormBuilder, private notification: NotificationService, private generatePdfservice : GeneratePdfService,private service: NgxPhotoEditorService, private sharedService: SharedService) {
    this.profilePersnoalDetailsForm = this.fb.group({
      id: null,
      firstName: ["",Validators.required],
      middleName: [""],
      lastName: ["",Validators.required],
      email: ["",Validators.required],
      phoneNumber: ["",Validators.required],
      addressLine1: ["",Validators.required],
      addressLine2: [""],
      city: ["",Validators.required],
      state: ["",Validators.required],
      country: ["",Validators.required],
      zipCode: ["",Validators.required]
    })

  }



  ngOnInit(): void {
    this.userName = localStorage.getItem("name");
    this.getResourceDetails();
    this.route.params.subscribe(params => {
      this.resourceId = params['id'];
    });
    // this.getEmploymentTypes();
    // this.onGetSignatureImage();
  }

  // onSelectFile(event){
  //   this.selectedFiles = event.target.files;
  //   if (this.selectedFiles) {
  //     for (let i = 0; i < this.selectedFiles.length; i++) {
  //       this.file = this.selectedFiles[i];
  //       if (this.file.size > 2 * 1024 * 1024) { // check if file size is greater than 2MB
  //         this.hasImageError = true;
  //         this.notification.showErrorNotification("", "File size exceeds 2MB limit");
  //         break; // stop processing further files
  //       } else if (this.file.type !== 'image/jpeg' && this.file.type !== 'image/png') { // check if file type is jpeg or png
  //         this.hasImageError = true;
  //         this.notification.showErrorNotification("", "Only JPEG and PNG image formats are supported");
  //         break; // stop processing further files
  //       }
  //       else{
  //         this.imageFileName = this.selectedFiles[0].name
  //         this.service.open(event, {
  //           aspectRatio: 3/2, // Set aspectRatio to NaN to allow free aspect ratio cropping
  //           autoCropArea: 3,
  //           viewMode: 2, // Set viewMode to 3 for full-screen cropping
  //         }).subscribe(data => {
  //           this.blobFile = data.file;
  //           this.signImagePath = data.base64;
  //           this.hasImageUploaded = true;
  //           this.onUploadImage();
  //         });
  //       }
  //     }
  //   }
  // }

  // onGetSignatureImage() {
  //   this.httpservice.doGet('signatureImage').subscribe((response) => {
  //     if(response['image']){
  //       this.hasImageUploaded = true;
  //       this.signImagePath = `data:image/jpeg;base64,${response['image']}`;
  //     }
  //     // this.generatePdfservice.sendSignImageUrl(response['image']);
  //   });
  // }
  // dataURItoBlob(dataURI: string): Blob {
  //   const byteString = atob(dataURI.split(',')[1]);
  //   const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  
  //   const ab = new ArrayBuffer(byteString.length);
  //   const ia = new Uint8Array(ab);
  
  //   for (let i = 0; i < byteString.length; i++) {
  //     ia[i] = byteString.charCodeAt(i);
  //   }
  
  //   return new Blob([ab], { type: mimeString });
  // }
  
  
  
  
  // onUploadImage(){
  //   const formData = new FormData();
  //   // const blob = this.dataURItoBlob(this.signImagePath);
  //   // formData.append('files', blob, 'cropped_image.jpeg');
  //   formData.append('files', this.blobFile);
  //     if (!this.hasImageError) {
  //       this.httpservice.doPost('signatureImageUpload', formData).subscribe((response) => {
  //         if (response.message) {
  //           this.hasImageUploaded = true;
  //           this.onGetSignatureImage();
  //           this.notification.showSucessNotification("", response.message);
  //         }
  //       });
  //     }
    
  // }

  getResourceDetails() {
    this.httpservice.doGet(StaticDataEntity.getResourceByID.replace(/{id}/g, this.id)).subscribe((result) => {
      this.resourceDetails = result;
      this.sharedService.updateUsername({
        userName:this.resourceDetails.resource_details.first_name + ' ' + this.resourceDetails.resource_details.last_name
      });
    })
  }
  //Salary/W2/Contract
  onResourcePersonalDetails(resources) {
    this.profilePersonalDetailsModal.show();
    this.profilePersnoalDetailsForm.patchValue({
      id: resources.id,
      firstName: resources?.first_name,
      middleName: resources?.middle_name,
      lastName: resources?.last_name,
      email: resources?.email_id,
      phoneNumber: resources?.primary_phone_number,
      addressLine1: resources?.addressline1,
      addressLine2: resources?.addressline2,
      city: resources?.city,
      state: resources?.state,
      country: resources?.country,
      zipCode: resources?.zipcode,
    })
  }

  updatePersonallDetails() {
    if(this.profilePersnoalDetailsForm.valid){
      let personalDetailsForm = this.profilePersnoalDetailsForm.value;
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
    }

    this.httpservice.doUpdate("updateResourcePersonolDetails", payload).subscribe((data) => {
      if (data.message) {
        // this.notification.showSucessNotification("Success", data.message);
        this.toast.showSuccess("success","Success", data.message);
        this.profilePersonalDetailsModal.hide();
        this.getResourceDetails();
      }
    })
    }else{
      validateAllFormFields(this.profilePersnoalDetailsForm);
    }
  }

  profileView() {
    this.profilePersonalDetailsModal.show();
  }
  closeProfileView() {
    this.profilePersonalDetailsModal.hide();
  }
  closePersonalDetails() {
    this.profilePersonalDetailsModal.hide();
  }

}
