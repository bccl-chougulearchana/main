
import {
  Directive,
  ElementRef,
  Renderer2,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  inject
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[libFileuploadNU]',
  standalone: true
})
export class FileuploadDirective implements AfterViewInit, OnDestroy {
  @Input() labelConfig: [string, string] = ['#a1a1a1', ''];
  @Input() controlName: string = '';
  @Input() allowedExtensions: string[] = [];

  /** NEW — Enable/Disable Download Icon */
  @Input() enableDownload: boolean = true;

 private _maxFileSizeMB = 10; // default (10MB)

@Input() set maxFileSizeMB(value: number) {
  if (!value || isNaN(value)) {
    this._maxFileSizeMB = 10; // fallback default
    return;
  }

  // Enforce min=1MB, max=200MB
  if (value < 1) {
    this._maxFileSizeMB = 1;
  } else if (value > 200) {
    this._maxFileSizeMB = 200;
  } else {
    this._maxFileSizeMB = value;
  }
}

get maxFileSizeMB() {
  return this._maxFileSizeMB;
}
  @Output() fileSelected = new EventEmitter<{ file: File | null; controlName: string }>();
  @Output() fileCleared = new EventEmitter<string>();
  @Output() fileDownload = new EventEmitter<{ fileName: string; controlName: string }>();

  private fileInput!: HTMLInputElement;
  private displayText!: HTMLElement;
  private clearBtn!: HTMLElement;
  private errorMsg!: HTMLElement;
  private uploadIcon!: HTMLElement;
  private downloadIcon!: HTMLElement;
  private previewIcon!: HTMLElement;

  private isRequired = false;
  private dialogOpen = false;
  private clickLocked = false;
  private valueChangeSub: Subscription | null = null;
  private currentFileURL: string | null = null;
  private removeDisplayTextClickListener: (() => void) | null = null;

  private ngControl = inject(NgControl, { optional: true });

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  // -------------------------------------------------------------
  // FILE TYPE BASED ICONS
  // -------------------------------------------------------------

  private iconFor(ext: string): string {
    ext = ext.toLowerCase();

    if (['jpg','jpeg','png','gif','bmp','svg','webp','ico'].includes(ext)) return this.imageIcon();
    if (['mp4','mov','avi','mkv','wmv','webm','flv','3gp'].includes(ext)) return this.videoIcon();
    if (ext === 'pdf') return this.pdfIcon();
    if (['xls','xlsx','csv'].includes(ext)) return this.excelIcon();
    if (['doc','docx'].includes(ext)) return this.wordIcon();
    if (['txt','log'].includes(ext)) return this.textIcon();
    if (['zip','rar','7z'].includes(ext)) return this.zipIcon();

    return this.genericIcon();
  }

 private imageIcon() {
  return `
    <svg viewBox="0 0 24 24" width="20">
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="grey" fill="none" stroke-width="1.5"/>
      <circle cx="9" cy="9" r="2" stroke="grey" fill="none" stroke-width="1.5"/>
      <path d="M21 17l-5-6-4 5-3-3-6 6" stroke="grey" fill="none" stroke-width="1.5"/>
    </svg>
  `;
}

private videoIcon() {
  return `
    <svg viewBox="0 0 24 24" width="20">
      <rect x="3" y="6" width="13" height="12" rx="2" stroke="grey" fill="none" stroke-width="1.5"/>
      <path d="M16 10l5-3v10l-5-3" stroke="grey" fill="none" stroke-width="1.5"/>
    </svg>
  `;
}
private pdfIcon() {
  return `
    <svg viewBox="0 0 24 24" width="20">
      <path d="M6 2h9l5 5v15H6z" stroke="grey" fill="none" stroke-width="1.5"/>
      <path d="M15 2v5h5" stroke="grey" fill="none" stroke-width="1.5"/>
      <text x="7" y="18" font-size="6" fill="grey">PDF</text>
    </svg>
  `;
}
private excelIcon() {
  return `
    <svg viewBox="0 0 24 24" width="20">
      <path d="M6 2h9l5 5v15H6z" stroke="grey" fill="none" stroke-width="1.5"/>
      <path d="M15 2v5h5" stroke="grey" fill="none" stroke-width="1.5"/>
      <text x="7" y="18" font-size="6" fill="grey">XLS</text>
    </svg>
  `;
}
private wordIcon() {
  return `
    <svg viewBox="0 0 24 24" width="20">
      <path d="M6 2h9l5 5v15H6z" stroke="grey" fill="none" stroke-width="1.5"/>
      <path d="M15 2v5h5" stroke="grey" fill="none" stroke-width="1.5"/>
      <text x="7" y="18" font-size="6" fill="grey">DOC</text>
    </svg>
  `;
}
private textIcon() {
  return `
    <svg viewBox="0 0 24 24" width="20">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="grey" fill="none" stroke-width="1.5"/>
      <path d="M7 8h10M7 12h10M7 16h6" stroke="grey" fill="none" stroke-width="1.5"/>
    </svg>
  `;
}
private zipIcon() {
  return `
    <svg viewBox="0 0 24 24" width="20">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="grey" fill="none" stroke-width="1.5"/>
      <path d="M12 3v18M10 6h4M10 10h4M10 14h4M10 18h4" stroke="grey" fill="none" stroke-width="1.5"/>
    </svg>
  `;
}
private genericIcon() {
  return `
    <svg viewBox="0 0 24 24" width="20">
      <path d="M6 2h9l5 5v15H6z" stroke="grey" fill="none" stroke-width="1.5"/>
      <path d="M15 2v5h5" stroke="grey" fill="none" stroke-width="1.5"/>
    </svg>
  `;
}

ngOnChanges(changes: any) {
  // Update ACCEPT attribute ONLY when allowedExtensions input changes
  if (changes['allowedExtensions'] && this.fileInput) {

    // Build updated accept string
    const accept = this.allowedExtensions?.length
      ? this.allowedExtensions.join(',')
      : '';

    this.renderer.setAttribute(this.fileInput, 'accept', accept);
  }
}


  // -------------------------------------------------------------
  // INIT
  // -------------------------------------------------------------

  ngAfterViewInit(): void {
    const host = this.el.nativeElement as HTMLElement;
    const parent = host.parentElement;
    if (!parent) return;

    this.isRequired = host.hasAttribute('librequired');
    const [labelColor, labelText] = this.labelConfig;

    /** Wrapper */
    const wrapper = this.renderer.createElement('div');
    this.renderer.addClass(wrapper, 'fileupload-wrapper');

    /** Label */
    const label = this.renderer.createElement('label');
    this.renderer.addClass(label, 'fileupload-label');
    if (host.classList.contains('add-astrix')) {
      this.renderer.addClass(label, 'add-astrix');
    }
    this.renderer.setStyle(label, 'color', labelColor);
    this.renderer.setProperty(label, 'innerText', labelText);

    /** Hidden file input */
    this.fileInput = this.renderer.createElement('input');
    this.renderer.setAttribute(this.fileInput, 'type', 'file');
    this.renderer.setAttribute(this.fileInput, 'accept', this.allowedExtensions.join(','));
    this.renderer.setStyle(this.fileInput, 'display', 'none');

    /** Display row */
    const displayRow = this.renderer.createElement('div');
    this.renderer.addClass(displayRow, 'fileupload-display-row');

    // Upload icon
    this.uploadIcon = this.renderer.createElement('span');
    this.renderer.addClass(this.uploadIcon, 'fileupload-icon');
    this.renderer.setProperty(this.uploadIcon, 'innerHTML',   `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%">
        <path d="M19.35 10.04A7.49 7.49 0 0 0 5.01 9.17 6 6 0 0 0 6 21h13a5 5 0 0 0 .35-10.96z" fill="white" stroke="grey" stroke-width="1.5"/>
        <path d="M13 9v15h-2v-6H8l4-4 4 4h-3z" fill="grey"/>
      </svg>
    `);

    // Download icon
    this.downloadIcon = this.renderer.createElement('span');
    this.renderer.addClass(this.downloadIcon, 'fileupload-download-icon');
    this.renderer.setStyle(this.downloadIcon, 'paddingTop', '5px');
    this.renderer.setProperty(this.downloadIcon, 'innerHTML', `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M5 20h14v-2H5v2z" fill="grey"/>
        <path d="M7 10l5 5 5-5H13V4h-2v6H7z" fill="grey"/>
      </svg>
    `);

    /** Preview icon */
    this.previewIcon = this.renderer.createElement('span');
    this.renderer.addClass(this.previewIcon, 'fileupload-preview-icon');
    this.renderer.setStyle(this.previewIcon, 'paddingTop', '11px');
    this.renderer.setStyle(this.previewIcon, 'display', 'none');

    /** File container */
    const fileContainer = this.renderer.createElement('div');
    this.renderer.addClass(fileContainer, 'fileupload-file-container');

    this.displayText = this.renderer.createElement('span');
    this.renderer.addClass(this.displayText, 'fileupload-display-text');
    this.renderer.setProperty(this.displayText, 'innerText', 'No file chosen');

    this.clearBtn = this.renderer.createElement('span');
    this.renderer.addClass(this.clearBtn, 'fileupload-clear-btn');
    this.renderer.setProperty(this.clearBtn, 'innerText', '×');

    this.renderer.appendChild(fileContainer, this.displayText);
    this.renderer.appendChild(fileContainer, this.clearBtn);

    this.renderer.appendChild(displayRow, this.uploadIcon);
    this.renderer.appendChild(displayRow, this.downloadIcon);
    this.renderer.appendChild(displayRow, this.previewIcon);
    this.renderer.appendChild(displayRow, fileContainer);

    /** Insert into DOM */
    this.renderer.insertBefore(parent, wrapper, host);
    this.renderer.removeChild(parent, host);
    this.renderer.appendChild(wrapper, label);
    this.renderer.appendChild(wrapper, displayRow);
    this.renderer.appendChild(wrapper, this.fileInput);

    /** Error msg */
    this.errorMsg = this.renderer.createElement('span');
    this.renderer.addClass(this.errorMsg, 'fileupload-error-msg');
    this.renderer.appendChild(wrapper, this.errorMsg);

    // -------------------------------
    // CURSOR FIX — ONLY clickable parts
    // -------------------------------
    this.renderer.setStyle(displayRow, 'cursor', 'default');
    this.renderer.setStyle(displayRow, 'pointer-events', 'none');

    [this.uploadIcon, this.downloadIcon, this.previewIcon, this.displayText, this.clearBtn]
      .forEach(el => {
        this.renderer.setStyle(el, 'cursor', 'pointer');
        this.renderer.setStyle(el, 'pointer-events', 'auto');
      });

    this.addListeners();
    this.handleNgControl();
  }

  // -------------------------------------------------------------
  // LISTENERS
  // -------------------------------------------------------------

  private addListeners() {
    // Upload icon
    this.renderer.listen(this.uploadIcon, 'click', () => this.fileInput.click());

    // Click "No file chosen"
    this.renderer.listen(this.displayText, 'click', () => {
      if (this.displayText.innerText === 'No file chosen') this.fileInput.click();
    });

    // Download icon
    this.renderer.listen(this.downloadIcon, 'click', () => {
      if (!this.enableDownload) return;

      const value = this.ngControl?.control?.value;
      if (!value) return;

      const fileName = value instanceof File ? value.name : value;
      this.fileDownload.emit({ fileName, controlName: this.controlName });
    });

    // File input change
    this.renderer.listen(this.fileInput, 'change', (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
    
      // Allow ALL file types when allowedExtensions is empty
if (this.allowedExtensions.length > 0 && !this.allowedExtensions.includes(ext)) {
  this.setError(
    this.allowedExtensions.length === 0
      ? ''  // no message
      : `Invalid file type. Allowed: ${this.allowedExtensions.join(', ')}`
  );
  this.fileInput.value = '';
  return;
}


      const maxBytes = this.maxFileSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        this.setError(`File size exceeds ${this.maxFileSizeMB}MB.`);
        this.fileInput.value = '';
        return;
      }

      this.clearError();
      this.updateDisplayWithFile(file);
      this.toggleIcons(true);

      const ctrl = this.ngControl?.control;
      ctrl?.setValue(file);
      ctrl?.markAsTouched();

      this.fileSelected.emit({ file, controlName: this.controlName });
    });

    // Clear button
    this.renderer.listen(this.clearBtn, 'click', () => {
      this.clearError();
      this.resetFileInput();
      this.fileCleared.emit(this.controlName);

      const ctrl = this.ngControl?.control;
      if (ctrl) {
        ctrl.setValue(null);
        ctrl.markAsTouched();
        if (this.isRequired) ctrl.setErrors({ required: true });
      }
    });
  }

  private handleNgControl() {
    const ctrl = this.ngControl?.control;
    if (!ctrl) return;

    if (ctrl.value) {
      setTimeout(() => this.handleValueChange(ctrl.value));
    }

    this.valueChangeSub = ctrl.valueChanges.subscribe(value =>
      this.handleValueChange(value)
    );
  }

  private handleValueChange(value: any) {
    if (!value) {
      this.resetFileInput();
      return;
    }

    if (value instanceof File) {
      this.updateDisplayWithFile(value);
      this.toggleIcons(true);
      return;
    }

    if (typeof value === 'string') {
      this.updateDisplayWithFileName(value);
      this.toggleIcons(true);
      return;
    }

    if (value?.name && (value?.blob || value?.file)) {
      const fileObj = new File([value.blob ?? value.file], value.name);
      this.handleValueChange(fileObj);
    }
  }

  // -------------------------------------------------------------
  // UI UPDATES
  // -------------------------------------------------------------

  private updateDisplayWithFile(file: File) {
  this.updateDisplayText(file.name);
  this.renderer.addClass(this.clearBtn, 'show');

  // Create blob URL
  if (this.currentFileURL) URL.revokeObjectURL(this.currentFileURL);
  this.currentFileURL = URL.createObjectURL(file);

  const ext = file.name.split('.').pop() || '';
  this.previewIcon.innerHTML = this.iconFor(ext);

  this.removePreviousClickListener();

  // Click on file name → preview
  this.removeDisplayTextClickListener = this.renderer.listen(
    this.displayText,
    'click',
    (e: Event) => {
      e.stopPropagation();
      window.open(this.currentFileURL!, '_blank', 'noopener,noreferrer');
    }
  );

  // Click on preview icon → preview (SAME BEHAVIOR)
  this.renderer.listen(
    this.previewIcon,
    'click',
    (e: Event) => {
      e.stopPropagation();
      window.open(this.currentFileURL!, '_blank', 'noopener,noreferrer');
    }
  );
}


private updateDisplayWithFileName(fileName: string) {
  this.updateDisplayText(fileName);
  this.renderer.addClass(this.clearBtn, 'show');

  const ext = fileName.split('.').pop() || '';
  this.previewIcon.innerHTML = this.iconFor(ext);

  this.removePreviousClickListener();

  // Click on file name
  this.removeDisplayTextClickListener = this.renderer.listen(
    this.displayText,
    'click',
    (e: Event) => {
      e.stopPropagation();
      if (this.enableDownload) {
        this.fileDownload.emit({ fileName, controlName: this.controlName });
      } else {
        window.open(fileName, '_blank', 'noopener,noreferrer');
      }
    }
  );

  // Click on preview icon (same behavior)
  this.renderer.listen(
    this.previewIcon,
    'click',
    (e: Event) => {
      e.stopPropagation();
      if (this.enableDownload) {
        this.fileDownload.emit({ fileName, controlName: this.controlName });
      } else {
        window.open(fileName, '_blank', 'noopener,noreferrer');
      }
    }
  );
}

  private removePreviousClickListener() {
    if (this.removeDisplayTextClickListener) {
      this.removeDisplayTextClickListener();
      this.removeDisplayTextClickListener = null;
    }
  }

  private updateDisplayText(text: string) {
    this.renderer.setProperty(this.displayText, 'innerText', text);
    this.renderer.setAttribute(this.displayText, 'title', text);
  }

  private resetFileInput() {
    this.fileInput.value = '';
    this.updateDisplayText('No file chosen');
    this.renderer.removeClass(this.clearBtn, 'show');
    this.toggleIcons(false);

    this.removePreviousClickListener();

    if (this.currentFileURL) {
      URL.revokeObjectURL(this.currentFileURL);
      this.currentFileURL = null;
    }
  }

  private toggleIcons(hasFile: boolean) {
    this.renderer.setStyle(this.uploadIcon, 'display', hasFile ? 'none' : 'inline');

    if (this.enableDownload) {
      this.renderer.setStyle(this.downloadIcon, 'display', hasFile ? 'inline' : 'none');
      this.renderer.setStyle(this.previewIcon, 'display', 'none');
    } else {
      this.renderer.setStyle(this.downloadIcon, 'display', 'none');
      this.renderer.setStyle(this.previewIcon, 'display', hasFile ? 'inline' : 'none');
    }
  }

  private setError(msg: string) {
    this.renderer.setProperty(this.errorMsg, 'innerText', msg);
  }

  private clearError() {
    this.renderer.setProperty(this.errorMsg, 'innerText', '');
  }

 ngOnDestroy(): void {
  // Unsubscribe Angular form changes
  if (this.valueChangeSub) {
    this.valueChangeSub.unsubscribe();
  }

  // Remove click listener on display text
  if (this.removeDisplayTextClickListener) {
    this.removeDisplayTextClickListener();
    this.removeDisplayTextClickListener = null;
  }

  // Revoke preview blob URL
  if (this.currentFileURL) {
    URL.revokeObjectURL(this.currentFileURL);
    this.currentFileURL = null;
  }
}

}
