import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegExpPatterns, StringResourceErrors } from 'src/app/shared/static-data';
import { HttpService } from 'src/app/services/http-service/http.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { isBlank, validateAllFormFields } from 'src/app/shared/utils/utils';
import { SharedService } from 'src/app/services/shared-service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  userName:string = "";
  profileName:string;
  isShowCurrentPassword:boolean = false;
  isShowNewPassword:boolean = false;
  isShowConfirmPassword:boolean = false;
  public _stringResourceErrors: StringResourceErrors = new StringResourceErrors();
  @ViewChild("changePasswordData") changePasswordModal;
  changePasswordForm:FormGroup;
  constructor(private toast: ToastService,  private router: Router, private fb: FormBuilder, private http : HttpService, private notification : NotificationService, private sharedService: SharedService) { 
    this.createChangePasswordForm();
  }

  ngOnInit(): void {
    this.sharedService.usernameSource.subscribe((res) => {
      if (!isBlank(res)) {
        this.profileName = res.userName;
      } else {
        this.profileName = localStorage.getItem('name');
      }
    });
    this.profileName = localStorage.getItem('name');
  }
  logout(){
    this.router.navigate(['/login']);
    this.http.doGet('logout').subscribe((response)=>{
      // this.notification.showSucessNotification("Success",response.message);
      // this.toast.showSuccess("success", "Success", response.message);
    });
    localStorage.clear();

    
  }
  createChangePasswordForm(){
    this.changePasswordForm = this.fb.group({
      currentPassword: new FormControl("", Validators.required),
      newPassword: new FormControl("", [Validators.compose([Validators.required,
        Validators.pattern(RegExpPatterns.passwordPattern),
        Validators.minLength(8), Validators.maxLength(15)])]),
      confirmPassword: new FormControl("", Validators.required),
    },
    { validator: [this.checkMatchingNewAndConfirmPassword('newPassword', 'confirmPassword'), this.checkMatchingNewAndCurrentPassword('currentPassword', 'newPassword')]},
    )
  }
  //Checking New and Confirm Password Matching
  checkMatchingNewAndConfirmPassword(newPasswordKey, confrimPasswordKey){
    return (group: FormGroup) => {
      const newPasswordInput = group.controls[newPasswordKey];
        const confirmPasswordInput = group.controls[confrimPasswordKey];
      if (newPasswordInput.value !== confirmPasswordInput.value) {
        return confirmPasswordInput.setErrors({ notEquivalent: true })
      }
      else {
        return confirmPasswordInput.setErrors(null);
      }
    }
  }
  //Checking New and Current password matching
  checkMatchingNewAndCurrentPassword(currentPasswordKey, newPasswordKey){
    return (group: FormGroup) => {
      const currentPasswordInput = group.controls[currentPasswordKey];
        const newPasswordInput = group.controls[newPasswordKey];
      if ((currentPasswordInput.value !=="") && currentPasswordInput.value === newPasswordInput.value) {
        return newPasswordInput.setErrors({ equivalent: true })
      }
      else {
        return newPasswordInput.setValidators(Validators.compose([Validators.required,Validators.pattern(RegExpPatterns.passwordPattern),
          Validators.minLength(8),
          Validators.maxLength(15)]));
      }
    }
  }
  changePassword(){
    this.changePasswordModal.show();
  }
  onCloseChangePassword(){
    this.changePasswordForm.reset();
    this.changePasswordForm.markAsUntouched();
    this.changePasswordModal.hide();
  }
  onResetChangePassword(){
    this.changePasswordForm.reset();
    this.isShowCurrentPassword = false,
    this.isShowNewPassword = false,
    this.isShowConfirmPassword = false
  }
  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.changePasswordForm.reset();
}
  onSubmitChangePassword(){
    if(this.changePasswordForm.valid){
      const form = this.changePasswordForm.value;
      let payload = {
        "current_password": form.currentPassword,
        "new_password": form.newPassword
      }
      this.http.doPost('changePassword',payload).subscribe((data)=>{
        if(data.errorMessage){
          // this.notification.showErrorNotification("Error", data.errorMessage);
          this.toast.showError("error", "Error", data.errorMessage);
        }else{
          // this.notification.showSucessNotification("Success", data.message);
          setTimeout(()=>{
            this.toast.showSuccess("success", "Success", data.message);
          },500)
          localStorage.clear();
          this.router.navigate(["/login"]);
        }
      })
    }else{
      validateAllFormFields(this.changePasswordForm);
    }
  }
  onClickCurrentPasswordIcon(){
    this.isShowCurrentPassword = !this.isShowCurrentPassword;
  }
  onClickNewPasswordIcon(){
    this.isShowNewPassword = !this.isShowNewPassword;
  }
  onClickConfirmPasswordIcon(){
    this.isShowConfirmPassword = !this.isShowConfirmPassword;
  }
}
