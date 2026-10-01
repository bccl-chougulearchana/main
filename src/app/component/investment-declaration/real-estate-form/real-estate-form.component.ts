import { Component, DestroyRef, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { merge } from 'rxjs';
import { UiDirectivesModule } from 'toi-libraries';
import { RealEstateControls } from '../../../core/modals/investment-declaration.model'; 
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
 * Reusable Real Estate declaration form. Operates only on the FormArray passed
 * in; per-row Total = Built Up Area x Actual Price/sq. ft, isolated per row.
 */
@Component({
  selector: 'app-real-estate-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiDirectivesModule, DateDirective],
  templateUrl: './real-estate-form.component.html',
  styleUrl: './real-estate-form.component.scss',
})
export class RealEstateFormComponent implements OnInit {
  @Input() title = '';
  @Input({ required: true }) rows!: FormArray<FormGroup<RealEstateControls>>;

   dealingTypeOptions = DEALING_TYPE_SELECT;
   relationshipOptions = RELATIONSHIP_SELECT;
   transactionTypeOptions = TRANSACTION_TYPE_SELECT;
  /** Max selectable date = today; future dates are disabled. */
  readonly today = new Date().toLocaleDateString('en-CA');

  constructor(private  destroyRef: DestroyRef) {}

  ngOnInit(): void {
    if (this.rows.length === 0) {
      this.addRow();
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
      const value = group.get('purchaseSaleDate')?.value;
      if (value) {
        this.dateErrorRows.delete(group);
      } else {
        this.dateErrorRows.add(group);
      }
    });
  }


  createInvestmentForm(): FormGroup<RealEstateControls> {
    return new FormGroup<RealEstateControls>({
      ownerName: new FormControl<string | null>(null, Validators.required),
      dealingType: new FormControl<string | null>(null, Validators.required),
      relationship: new FormControl<string | null>(null, Validators.required),
      transactionType: new FormControl<string | null>(null, Validators.required),
      propertyTypeMisc: new FormControl<string | null>(null, Validators.required),
      societyName: new FormControl<string | null>(null, Validators.required),
      builtUpArea: new FormControl<number | null>(null, [Validators.required, Validators.pattern(/^[1-9]\d*(\.\d{1,2})?$/)]),
      developedBy: new FormControl<string | null>(null, Validators.required),
      locationState: new FormControl<string | null>(null, Validators.required),
      purchaseSaleDate: new FormControl<string | null>(null, [Validators.required, maxIsoDateValidator(this.today)]),
      pricePerSqFt: new FormControl<number | null>(null, [Validators.required, Validators.pattern(/^[1-9]\d*(\.\d{1,2})?$/)]),
      totalAmount: new FormControl<number | null>({ value: null, disabled: true }),
    });
  }

  /** Recompute this row's Total when its inputs change (bound to the group,
   *  not an index, so it survives row deletions that shift indices). */
  private recalc(group: FormGroup<RealEstateControls>): void {
    const area = group.controls.builtUpArea.value ?? 0;
    const price = group.controls.pricePerSqFt.value ?? 0;
    group.controls.totalAmount.setValue(Math.round(area * price * 100) / 100, { emitEvent: false });
  }

  private wireCalc(group: FormGroup<RealEstateControls>): void {
    merge(group.controls.builtUpArea.valueChanges, group.controls.pricePerSqFt.valueChanges)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.recalc(group));
  }
}