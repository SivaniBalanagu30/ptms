import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[usFormatPhoneNumber]'
})
export class UsFormatPhoneNumberDirective {
    private regex: RegExp = new RegExp(/^[0-9\-\/\+\(\)\s]+$/);

    constructor(private el: ElementRef) { }
  
    @HostListener('input', ['$event'])
    onInput(event: KeyboardEvent) {
      const input = event.target as HTMLInputElement;
      const value = input.value;
  
      const cleanValue = this.removeInvalidCharacters(value);
      input.value = cleanValue;
    }
  
    private removeInvalidCharacters(value: string): string {
      return value.replace(/[^0-9\-\/\+\(\)\s]+/g, '');
    }
}
