import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
import { Constants } from '../static-data';

@Pipe({
  name: 'customDate'
})
export class CustomDatePipe implements PipeTransform {

  constructor() {}

  transform(value: any): string {
    if (value) {
      return moment(value).format(Constants.dateShortFormat);
    }
    return '';
  }
}
