import {
  DoCheck,
  Directive,
  ElementRef,
  Input,
  OnInit,
  Renderer2
} from '@angular/core';

@Directive({
  selector: '[libTextarea]',
  standalone: true
})
export class TextareaDirective implements OnInit, DoCheck {
  @Input('libTextarea') maxLength: number | string = 200;

  private counterEl!: HTMLElement;
  private textareaEl!: HTMLTextAreaElement;
  private max = 200;
  private lastValue = '';

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    const element = this.el.nativeElement as HTMLTextAreaElement;
    this.textareaEl = element;

    // Wrap textarea inside a container
    const wrapper = this.renderer.createElement('div');
    this.renderer.addClass(wrapper, 'lib-textarea-wrapper');

    const parent = element.parentNode;
    this.renderer.insertBefore(parent, wrapper, element);
    this.renderer.removeChild(parent, element);
    this.renderer.appendChild(wrapper, element);

    // Apply textarea CSS class
    this.renderer.addClass(element, 'lib-textarea');

    // Enforce maxLength
    this.max = Number(this.maxLength) || 200;
    this.renderer.setAttribute(element, 'maxlength', this.max.toString());

    // Create character counter
    this.counterEl = this.renderer.createElement('div');
    this.renderer.addClass(this.counterEl, 'lib-textarea-counter');
    this.renderer.appendChild(wrapper, this.counterEl);

    // Update counter initially and on input
    this.syncCounter();
    // this.renderer.listen(element, 'input', (event: any) => {
    //   this.updateCounter(event.target.value, this.max);
    // });
    this.renderer.listen(element, 'input', (event: any) => {
      let value = event.target.value || '';

      // Remove leading spaces/newlines
      value = value.replace(/^\s+/, '');

      // Replace multiple spaces with single space
      value = value.replace(/ {2,}/g, ' ');

      // Allow only one newline
      value = value.replace(/(\r?\n){2,}/g, '\n');

      // Strict max length
      if (value.length > this.max) {
        value = value.substring(0, this.max);
      }

      if (value !== event.target.value) {
        this.renderer.setProperty(event.target, 'value', value);
        event.target.dispatchEvent(new Event('input', { bubbles: true }));
        return;
      }

      this.updateCounter(value, this.max);
    });
  }

  ngDoCheck(): void {
    this.syncCounter();
  }

  private syncCounter(): void {
    if (!this.textareaEl) {
      return;
    }

    const currentValue = this.textareaEl.value || '';
    if (currentValue !== this.lastValue) {
      this.lastValue = currentValue;
      this.updateCounter(currentValue, this.max);
    }
  }

  private updateCounter(value: string, max: number): void {
    const count = value?.length || 0;
    this.counterEl.textContent = `${count}/${max}`;
  }
}
