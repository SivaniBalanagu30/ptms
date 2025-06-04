import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[noLeadingSpace]'
})
export class NoLeadingSpaceDirective {

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === ' ' && event.target['selectionStart'] === 0) {
      event.preventDefault();
    }
  }
}
