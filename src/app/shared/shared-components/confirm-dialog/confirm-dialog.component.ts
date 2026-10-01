import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
    templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {
  @Input() title = '';
  @Input() message = '';
  @Input() type: 'alert' | 'confirm' = 'alert';
  @Output() closed = new EventEmitter<string>();

  close(result: string) {
    this.closed.emit(result);
  }
}
