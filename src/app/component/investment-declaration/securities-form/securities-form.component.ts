import { Component, DestroyRef, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { merge } from 'rxjs';
import { UiDirectivesModule } from 'toi-libraries';
import { SecuritiesControls } from '../../../core/modals/investment-declaration.model'; 
import { DateDirective } from '../../../shared/shared-directives/date.directive';
import {
  DEALING_TYPE_SELECT,
  RELATIONSHIP_SELECT,
  TRANSACTION_TYPE_SELECT,
  maxIsoDateValidator,
  showAddButton,
  showDeleteButton,
} from '../../../core/constants/investment-declaration.constant';

/**
 * Reusable securities declaration form (Unlisted + Listed share the same fields).
 * Operates only on the FormArray passed in, so Add/Delete and the per-row Total
 * (No of Shares x Rate per Share) never affect any other form's rows.
 */
@Component({
  selector: 'app-securities-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiDirectivesModule, DateDirective],
  templateUrl: './securities-form.component.html',
  styleUrl: './securities-form.component.scss',
})
export class SecuritiesFormComponent implements OnInit {
  @Input() title = '';
  @Input() investeeLabel = 'Name of Investee Company';
  @Input({ required: true }) rows!: FormArray<FormGroup<SecuritiesControls>>;

   dealingTypeOptions = DEALING_TYPE_SELECT;
   relationshipOptions = RELATIONSHIP_SELECT;
   transactionTypeOptions = TRANSACTION_TYPE_SELECT;

  /** Max selectable date = today; future dates are disabled. */
  readonly today = new Date().toLocaleDateString('en-CA');

  constructor(private  destroyRef: DestroyRef) {}

  ngOnInit(): void {
    if (this.rows.length === 0) {
      this.addRow(); // first row is mandatory
    } else {
      this.rows.controls.forEach((group) => this.wireCalc(group));
    }
  }

  addRow(): void {
    const group = this.createInvestmentForm();
    this.rows.push(group);
    this.wireCalc(group);
  }

  removeRow(index: number): void {
    this.rows.removeAt(index);
    if (this.rows.length === 0) {
      this.addRow(); // at least one row must remain -> add a fresh blank one (calc re-wired)
    }
  }

  showAdd(index: number): boolean {
    return showAddButton(index, this.rows.length);
  }

  showDelete(): boolean {
    return showDeleteButton(this.rows.length);
  }

  /** Block a leading zero: first digit must be 1-9. "0"/"007" -> stripped;
   *  a leading-zero decimal like "0.5" is cleared. */
  onNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let cleaned = input.value.replace(/^0+/, '');
    if (cleaned.startsWith('.')) {
      cleaned = '';
    }
    if (input.value !== cleaned) {
      input.value = cleaned;
      input.dispatchEvent(new Event('input', { bubbles: true })); // keep the form control in sync
    }
  }

  /** Rows whose date field needs the guidance message — the date control is
   *  empty after the user interacted (opened the calendar and picked nothing,
   *  or picked a future date which the directive then cleared). */
  readonly dateErrorRows = new Set<FormGroup>();

  onDateCheck(group: FormGroup): void {
    // Defer so we read the control AFTER the directive/value-accessor settle.
    setTimeout(() => {
      const value = group.get('transactionDate')?.value;
      if (value) {
        this.dateErrorRows.delete(group);
      } else {
        this.dateErrorRows.add(group);
      }
    });
  }

  createInvestmentForm(): FormGroup<SecuritiesControls> {
    return new FormGroup<SecuritiesControls>({
      ownerName: new FormControl<string | null>(null, Validators.required),
      dealingType: new FormControl<string | null>(null, Validators.required),
      relationship: new FormControl<string | null>(null, Validators.required),
      transactionType: new FormControl<string | null>(null, Validators.required),
      noOfShares: new FormControl<number | null>(null, [Validators.required, Validators.pattern(/^[1-9]\d*$/)]),
      investeeCompany: new FormControl<string | null>(null, Validators.required),
      transactionDate: new FormControl<string | null>(null, [Validators.required, maxIsoDateValidator(this.today)]),
      ratePerShare: new FormControl<number | null>(null, [Validators.required, Validators.pattern(/^[1-9]\d*(\.\d{1,2})?$/)]),
      totalAmount: new FormControl<number | null>({ value: null, disabled: true }),
    });
  }

  /** Recompute this row's Total when its inputs change (bound to the group,
   *  not an index, so it survives row deletions that shift indices). */
  private recalc(group: FormGroup<SecuritiesControls>): void {
    const shares = group.controls.noOfShares.value ?? 0;
    const rate = group.controls.ratePerShare.value ?? 0;
    group.controls.totalAmount.setValue(Math.round(shares * rate * 100) / 100, { emitEvent: false });
  }

  private wireCalc(group: FormGroup<SecuritiesControls>): void {
    merge(group.controls.noOfShares.valueChanges, group.controls.ratePerShare.valueChanges)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.recalc(group));
  }
}