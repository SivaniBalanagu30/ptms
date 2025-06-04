import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomDatePipe } from 'src/app/shared/datePipe/custom-date.pipe';
import { AlphaWithSpaceDirective } from 'src/app/directives/alpha-with-space.directive';
import {NoLeadingSpaceDirective} from 'src/app/directives/noLeadingSpace.directive'
import { GeneratePdfService } from 'src/app/services/timesheet-generate-pdf/generate-pdf.service';
// import {ImageCropperModule} from "ngx-image-cropper"
import {NgxPhotoEditorModule} from "ngx-photo-editor";
import { UsFormatPhoneNumberDirective } from 'src/app/directives/us-format-phone-number.directive';
import { DisableManualEntryDirective } from 'src/app/directives/stop-manual-entry';
import { MessageService } from 'primeng/api';


@NgModule({
  exports: [CustomDatePipe, AlphaWithSpaceDirective, NoLeadingSpaceDirective,DisableManualEntryDirective, UsFormatPhoneNumberDirective],
  declarations: [CustomDatePipe, AlphaWithSpaceDirective, NoLeadingSpaceDirective, DisableManualEntryDirective,UsFormatPhoneNumberDirective],
  imports: [
    CommonModule,
    NgxPhotoEditorModule
  ],
  providers:[MessageService]
})
export class SharedModule { }
