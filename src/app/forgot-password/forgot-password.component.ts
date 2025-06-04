import { Component, OnInit } from '@angular/core';
import { FormControl,FormGroup,FormBuilder, Validators } from '@angular/forms';
import { RegExpPatterns, StringResourceErrors } from '../shared/static-data';
import { validateAllFormFields } from '../shared/utils/utils';
import { NotificationService } from '../services/notification-service/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../services/http-service/http.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  resetPasswordForm:FormGroup;
  isShowNewPassword:boolean = false;
  isShowConfirmPassword:boolean = false;
  showErrorMessage:boolean = false;
  errorMessage: string = '';
  enableSubmitButton:boolean = false;
  isPasswordExpired:boolean = false;

  token;
  public _stringResourceErrors: StringResourceErrors = new StringResourceErrors();
  constructor(private toast: ToastService, private fb: FormBuilder, private notificationService: NotificationService, private activatedRoute :  ActivatedRoute, private httpService: HttpService, private router : Router) {
    this.resetPasswordForm = this.fb.group({
      newPassword: new FormControl("",[Validators.compose([Validators.required,
        Validators.pattern(RegExpPatterns.passwordPattern),
        Validators.minLength(8), Validators.maxLength(15)])]),
      confirmPassword: new FormControl("",[Validators.required])
    }, { validator: [this.checkMatchingNewAndConfirmPassword('newPassword', 'confirmPassword')]});
   }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      this.token = params['token'];
    });
    this.onOpenPasswordResetPage();
  }
  checkMatchingNewAndConfirmPassword(newPasswordKey,confirmPasswordKey){
    return (group: FormGroup) => {
      const newPasswordInput = group.controls[newPasswordKey];
        const confirmPasswordInput = group.controls[confirmPasswordKey];
      if (newPasswordInput.value !== confirmPasswordInput.value) {
        return confirmPasswordInput.setErrors({ notEquivalent: true })
      }
      else {
        return confirmPasswordInput.setErrors(null);
      }
    }
  }
  onClickNewPasswordIcon(){
    this.isShowNewPassword = !this.isShowNewPassword;
  }
  onClickConfirmPasswordIcon(){
    this.isShowConfirmPassword = !this.isShowConfirmPassword;
  }
  onSubmitResetPassword(){

    if(this.resetPasswordForm.valid){
      this.router.navigate(['/login']);
      let payload = {
        token:this.token,
        password:this.resetPasswordForm.value.newPassword
      }
      this.httpService.doPost("resetChangePassword",payload).subscribe((response)=>{
        // this.notificationService.showSucessNotification("Success",response.message);
        this,this.toast.showSuccess("success", "Success", response.message);
      });
    }else{
      validateAllFormFields(this.resetPasswordForm);
    }
  }

  onOpenPasswordResetPage(){
    let payload = {
      token:this.token,
    }
    this.httpService.doPost("passMailValidation",payload).subscribe((response)=>{
      if (response.message) {
        // this.notificationService.showSucessNotification("Success",response.message);
        this.isPasswordExpired = false;
      } else if (response.errorMessage) {
        this.isPasswordExpired = true;
      }
    })
  }

}
