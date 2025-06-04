import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './layout/header/header.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { DefaultComponent } from './layout/default/default.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AvatarModule } from 'ngx-avatar';
import { HttpClientModule,  HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from '@ag-grid-community/angular';
import { HttpInterceptorService } from './services/interceptors/http.interceptor';
import { ProfileComponent } from './profile/profile.component';
import { BsDatepickerModule, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgHttpLoaderModule } from 'ng-http-loader';
import { ToastrModule } from 'ngx-toastr';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { DatePipe } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component'
import {MatMenuModule} from "@angular/material/menu";
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { GeneratePdfService } from './services/timesheet-generate-pdf/generate-pdf.service';
import { FirstChangePasswordComponent } from './first-change-password/first-change-password.component';
import{ToastModule} from "primeng/toast"
// import {MessageService } from "primeng/api"
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    DefaultComponent,
    LoginComponent,
    ProfileComponent,
    ForgotPasswordComponent,
    FirstChangePasswordComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ToastModule,
    NgbModule,
    AvatarModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AgGridModule.withComponents([]),
		BsDatepickerModule.forRoot(),
    BrowserAnimationsModule,
    NgHttpLoaderModule.forRoot(),
    ToastrModule.forRoot({
			timeOut: 1000,
    		preventDuplicates: true,
      		maxOpened: 1
		}),
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    SharedModule,
    MatMenuModule,

  ],
  providers: [DatePipe,{
    provide: HTTP_INTERCEPTORS,
    useClass: HttpInterceptorService,
    multi: true
  },
  // MessageService,
	{
    provide: LocationStrategy,
    useClass: HashLocationStrategy
  },],
  bootstrap: [AppComponent]
})
export class AppModule { }
