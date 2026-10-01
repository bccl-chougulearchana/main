import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Submit success screen (design 002). Shown in-place inside the parent
 * (no routing); the two links ask the parent to open the History tab.
 */
@Component({
  selector: 'app-investment-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './investment-success.component.html',
  styleUrl: './investment-success.component.scss',
})
export class InvestmentSuccessComponent {
  readonly message = 'Transaction has been completed successfully';

  /** Asks the parent to switch to the History tab. */
  @Output() viewHistory = new EventEmitter<void>();
}