import {
  Directive,
  ElementRef,
  Renderer2,
  OnInit
} from '@angular/core';

@Directive({
  selector: '[libDateNU]',
  standalone: true
})
export class DateDirective implements OnInit {
  // Inject the cursor stylesheet only once for the whole app.
  private static stylesInjected = false;

  constructor(private el: ElementRef<HTMLInputElement>, private renderer: Renderer2) {}

  ngOnInit(): void {
    const input = this.el.nativeElement;

    if (input.tagName.toLowerCase() !== 'input') {
      console.warn('[libDate] directive should be used on an <input> element.');
      return;
    }

    this.injectCursorStyles();

    // Attributes
    this.renderer.setAttribute(input, 'type', 'date');
    this.renderer.setAttribute(input, 'placeholder', 'Select date');
    this.renderer.setAttribute(input, 'autocomplete', 'off');

    // Prevent typing but allow Tab/Shift/Arrows
    this.renderer.listen(input, 'keydown', (event: KeyboardEvent) => {
      const allowedKeys = ['Tab', 'Shift', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
      if (!allowedKeys.includes(event.key)) {
        event.preventDefault();
      }
    });

    this.renderer.addClass(input, 'lib-date-input');
    this.renderer.setStyle(input, 'cursor', 'pointer');

    // Wrapper
    const wrapper = this.renderer.createElement('div');
    this.renderer.addClass(wrapper, 'lib-date-wrapper');

    const parent = input.parentElement;
    if (parent) {
      this.renderer.insertBefore(parent, wrapper, input);
      this.renderer.removeChild(parent, input);
      this.renderer.appendChild(wrapper, input);
    }

    const ios = this.isIOS();

    // Calendar icon.
    const icon = this.renderer.createElement('span');
    this.renderer.addClass(icon, 'lib-date-icon');
    this.renderer.setStyle(icon, 'cursor', 'pointer');
    this.renderer.setStyle(icon, 'pointerEvents', 'auto');
    if (ios) {
      // iOS Safari never draws ::-webkit-calendar-picker-indicator, so we draw
      // our own. (On other browsers the span stays empty and the native
      // indicator shows — unchanged.)
      (icon as HTMLElement).innerHTML = CALENDAR_SVG;
    }
    this.renderer.appendChild(wrapper, icon);

    /**
     * Open the native date picker from a user gesture (desktop/Android path).
     */
    const openPicker = (event?: Event) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      input.focus();
      try {
        if (typeof input.showPicker === 'function') {
          input.showPicker();
          return;
        }
      } catch {
        // showPicker not allowed here (e.g. cross-origin iframe) — fall through.
      }
      input.click();
    };

    if (ios) {
      // Mark the wrapper so our CSS hides the browser's OWN indicator and its
      // empty dd/mm/yyyy text — guarantees a single icon + single placeholder,
      // even in desktop device-emulation (where the native ones also render).
      this.renderer.addClass(wrapper, 'lib-date-custom');

      // Reflect max as an attribute so the native picker greys future dates.
      if (input.max) {
        this.renderer.setAttribute(input, 'max', input.max);
      }

      // A tap on the field opens the native picker by itself. We must NOT
      // preventDefault the input's click (that stopped the chosen value from
      // committing on iOS) and must never call input.click() (loops on Safari).
      // Only the icon nudges the picker open via showPicker where available.
      this.renderer.listen(icon, 'click', () => {
        input.focus();
        try {
          if (typeof input.showPicker === 'function') {
            input.showPicker();
          }
        } catch {
          /* tapping the field already opens the native picker on iOS */
        }
      });

      // iOS ignores placeholder on <input type="date">, so overlay a hint and
      // hide the native empty text while blank (via the is-empty class).
      const hint = this.renderer.createElement('span');
      this.renderer.addClass(hint, 'lib-date-hint');
      this.renderer.appendChild(hint, this.renderer.createText('dd/mm/yyyy'));
      this.renderer.appendChild(wrapper, hint);

      const syncEmptyState = () => {
        const empty = !input.value;
        this.renderer.setStyle(hint, 'display', empty ? 'block' : 'none');
        if (empty) {
          this.renderer.addClass(wrapper, 'is-empty');
        } else {
          this.renderer.removeClass(wrapper, 'is-empty');
        }
      };
      syncEmptyState();
      this.renderer.listen(input, 'input', syncEmptyState);
      this.renderer.listen(input, 'change', syncEmptyState);
      this.renderer.listen(input, 'blur', syncEmptyState);
    } else {
      // Desktop / Android: unchanged behaviour.
      this.renderer.listen(input, 'click', (event: Event) => openPicker(event));
      this.renderer.listen(icon, 'click', (event: Event) => openPicker(event));
    }

    const enforceMaxDate = () => {
      if (!input.value || !input.max || input.value <= input.max) {
        input.setCustomValidity('');
        return;
      }
      input.value = '';
      input.setCustomValidity('Future dates are not allowed.');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    };

    this.renderer.listen(input, 'input', enforceMaxDate);
    this.renderer.listen(input, 'change', enforceMaxDate);
    // iOS may not grey out future dates in the picker even with `max`, so
    // re-check on blur too — a future selection is cleared consistently.
    if (ios) {
      this.renderer.listen(input, 'blur', enforceMaxDate);
    }
  }

  /** iPhone/iPad detection (incl. iPadOS 13+ which reports as MacIntel). */
  private isIOS(): boolean {
    if (typeof navigator === 'undefined') {
      return false;
    }
    const ua = navigator.userAgent || '';
    const iDevice = /iP(hone|ad|od)/.test(ua);
    const iPadOS = navigator.platform === 'MacIntel' && (navigator.maxTouchPoints ?? 0) > 1;
    return iDevice || iPadOS;
  }

  /**
   * The calendar icon on <input type="date"> is a browser pseudo-element
   * (::-webkit-calendar-picker-indicator), which inline styles can't reach.
   * Inject one global rule set: pointer cursor everywhere, plus positioning for
   * the iOS custom icon/hint and hiding of the browser's own icon/empty-text
   * when we supply our own (scoped to .lib-date-custom so non-iOS is untouched).
   */
  private injectCursorStyles(): void {
    if (DateDirective.stylesInjected || typeof document === 'undefined') {
      return;
    }
    const style = this.renderer.createElement('style');
    this.renderer.setAttribute(style, 'data-lib-date', '');
    const css = `
      input.lib-date-input { cursor: pointer !important; }
      input.lib-date-input::-webkit-calendar-picker-indicator { cursor: pointer !important; }
      .lib-date-wrapper { position: relative; display: block; width: 100%; }
      .lib-date-wrapper .lib-date-icon { cursor: pointer !important; pointer-events: auto !important; }

      /* --- iOS custom icon + placeholder (only when .lib-date-custom) --- */
      .lib-date-wrapper.lib-date-custom .lib-date-icon svg {
        position: absolute; right: 4px; top: 50%; transform: translateY(-50%);
        width: 18px; height: 18px; color: #5b6169; pointer-events: none;
      }
      .lib-date-wrapper.lib-date-custom .lib-date-hint {
        position: absolute; left: 2px; top: 50%; transform: translateY(-50%);
        color: #8a8f98; font: inherit; pointer-events: none; white-space: nowrap;
      }
      /* Hide the browser's OWN indicator + empty text so only ours shows.
         No-op on a real iOS device (these aren't rendered there); removes the
         duplicate icon/placeholder seen in desktop device-emulation. */
      .lib-date-wrapper.lib-date-custom input.lib-date-input::-webkit-calendar-picker-indicator {
        display: none; -webkit-appearance: none; appearance: none;
      }
      .lib-date-wrapper.lib-date-custom.is-empty input.lib-date-input::-webkit-datetime-edit {
        opacity: 0;
      }
    `;
    this.renderer.appendChild(style, this.renderer.createText(css));
    this.renderer.appendChild(document.head, style);
    DateDirective.stylesInjected = true;
  }
}

const CALENDAR_SVG = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
  <line x1="16" y1="2" x2="16" y2="6"></line>
  <line x1="8" y1="2" x2="8" y2="6"></line>
  <line x1="3" y1="10" x2="21" y2="10"></line>
</svg>`;