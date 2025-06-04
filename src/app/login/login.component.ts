import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { HttpService } from '../services/http-service/http.service';
import {RegExpPatterns, StaticDataEntity} from '../shared/static-data'
import { NotificationService } from '../services/notification-service/notification.service';
import { validateAllFormFields } from '../shared/utils/utils';
import { ToastService } from '../services/toast.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showPassword: boolean = false;
  isShowResetPassword:boolean = false;
  isVisible: boolean = false;
  inputType: string = 'password'
  forgotPasswordForm:FormGroup;
  baseUrl:any;
  pass(){
   this.isVisible=!this.isVisible 
   this.inputType = this.inputType === 'password' ? 'text' : 'password';
  }
  private secretKey = 'ASDFGHJKLKJHGFDSFGHJKLKJHGFDSFGHJKLKJHYTRERFGYJKLKJHGTFREWERGHJMNBVCDSWERTYHJNBVCXDSERTYHUJNBVDERTY'; // Replace with your secret key
  private xorEncrypt(plaintext: string): string {
    const key = this.secretKey;
    let encryptedString = '';
    for (let i = 0; i < plaintext.length; i++) {
      encryptedString += String.fromCharCode(plaintext.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(encryptedString);
  }

  public encryptPassword(password: string): string {
    return this.xorEncrypt(password);
  }  


  constructor(private toast: ToastService, private router: Router, private fb: FormBuilder, private httpservice:HttpService, private notification: NotificationService) { 
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.forgotPasswordForm = this.fb.group({
      emailForgotPassword: new FormControl("",[Validators.required,Validators.pattern(RegExpPatterns.emailPattern)])
    });
  }

  ngOnInit(): void {
    this.baseUrl = window.location.origin + '/#/resetPassword';
  }
  onClickReset(){
    this.isShowResetPassword = !this.isShowResetPassword;
    this.loginForm.reset();
  }
  onBackResetPassword(){
    this.forgotPasswordForm.get("emailForgotPassword").reset();
    this.isShowResetPassword = !this.isShowResetPassword;
  }
  onSubmitResetPassword(){
    if(this.forgotPasswordForm.valid){
      let payload = {
        "base_url": this.baseUrl,
        'email': this.forgotPasswordForm.get('emailForgotPassword').value.toLowerCase(),
      }
      this.httpservice.doPost("sendMailToken",payload).subscribe((response)=>{
        if(response.message){
          // this.notification.showSucessNotification("Success", response.message);
          this.toast.showSuccess("success", "Success", response.message);
          this.isShowResetPassword = !this.isShowResetPassword;
          this.forgotPasswordForm.get('emailForgotPassword').reset();
        }else if(response.errorMessage){
          // this.notification.showErrorNotification("Error",response.errorMessage);
          this.toast.showError("error","Error", response.errorMessage);
          this.forgotPasswordForm.get('emailForgotPassword').reset();
        }
      })
    }else{
      validateAllFormFields(this.forgotPasswordForm);
    }
  }
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  submit(){
    if(this.loginForm.valid){
      let payload ={
        username: this.loginForm.value.username,
        password: this.encryptPassword(this.loginForm.value.password)
      }
      this.httpservice.doPost(StaticDataEntity.login,payload).subscribe((result:any)=>{
        if(result.access_token){
          localStorage.setItem('timeApprover', result.time_approver);
          localStorage.setItem('isResetPassword',result.reset_password);
          
          localStorage.setItem('access-token',result.access_token);
          localStorage.setItem('email',result.email);
          localStorage.setItem('name',result.first_name +' '+ result.middle_name +' '+ result.last_name);
          localStorage.setItem('userId',result.id);
          localStorage.setItem('joiningDate',result.joining_date);
          localStorage.setItem('role',result.roles[0].role_name);
          localStorage.setItem('resourceNumber',result.resource_number);
          localStorage.setItem('uploadOption',result.upload_signed_timesheet);

          if(result?.reset_password === true){
            this.router.navigate(['/firstChangePassword']);
          }else if(result?.reset_password === false){
            console.log('false')
            this.router.navigate(['/dashboard']);
          }

          if(result?.sessionclosed_message != null){
            this.toast.showWarning("info", "Information",  result?.sessionclosed_message);
          }
          
          // this.notification.showSucessNotification("Success", "Logged in successfully")
        }else if(result.errorMessage){
          // this.notification.showErrorNotification("Error", result.errorMessage)
          this.toast.showError("error", "Error", result.errorMessage);
        }
        
      })
    }else{
      validateAllFormFields(this.loginForm);
    }
  }

  getRole(){
     let role = localStorage.getItem('role')
     if(role === 'Admin'){
      this.httpservice.doGet(StaticDataEntity.getRole).subscribe((res)=>{
        localStorage.setItem('timeApprover',res.time_approver);
      })

     }
  }

}
