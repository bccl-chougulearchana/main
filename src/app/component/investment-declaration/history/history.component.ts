import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EMPTY, forkJoin, Observable, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs/operators';
import { UiDirectivesModule } from 'toi-libraries';
import { LoaderService } from '../../../shared/shared-services/loader.service';
import { CommonDialogService } from '../../../shared/shared-services/common-dialog.service';
import { InvestmentDeclarationService } from '../../../services/investment-declaration/investment-declaration.service'; 
import { StockHistoryComponent } from '../stock-history/stock-history.component';
import { UnlistedHistoryComponent } from '../unlisted-history/unlisted-history.component';
import { RealEstateHistoryComponent } from '../real-estate-history/real-estate-history.component';
import { HistoryStatus, Quarter } from '../../../core/enums/investment-declaration.enum';
import {
  QUARTER_OPTIONS,
  STATUS_OPTIONS,
  YEAR_OPTIONS,
} from '../../../core/constants/investment-declaration.constant';
import {
  HistoryFilter,
  RealEstateHistoryRow,
  SecuritiesHistoryRow,
} from '../../../core/modals/investment-declaration.model';

interface HistoryFilterForm {
  quarter: FormControl<string>;
  year: FormControl<string>;
  status: FormControl<string>;
}

/**
 * History page. There is no combined endpoint — each section has its own API
 * (getStockData / getUnlistedData / getRealData). Nothing is fetched on load;
 * the three run in parallel only once Quarter + Year + Status are all chosen.
 * Cancel is routed to the section's dedicated cancel API.
 */
@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UiDirectivesModule,
    StockHistoryComponent,
    UnlistedHistoryComponent,
    RealEstateHistoryComponent,
  ],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
})
export class HistoryComponent implements OnInit {
  readonly quarterOptions = QUARTER_OPTIONS;
  readonly yearOptions = YEAR_OPTIONS;
  readonly statusOptions = STATUS_OPTIONS;

  readonly filterForm = new FormGroup<HistoryFilterForm>({
    quarter: new FormControl<string>('', { nonNullable: true }),
    year: new FormControl<string>('', { nonNullable: true }),
    status: new FormControl<string>('', { nonNullable: true }),
  });

  stock: SecuritiesHistoryRow[] = [];
  unlisted: SecuritiesHistoryRow[] = [];
  realEstate: RealEstateHistoryRow[] = [];

  /** True once a search has run (drives the "select filters" hint vs results). */
  searched = false;

  filtersOpen = true;

  /** Fires each time a search should run (filter change or post-cancel refresh). */
  private readonly searchTrigger$ = new Subject<void>();

  /**
   * Signature (quarter|year|status) of the search that last ran. A trigger with
   * the same signature is ignored, so a re-emit of the SAME filter value (e.g.
   * a select directive echoing its value during the CD caused by a search
   * response) can never start another search — which is what caused the
   * infinite search loop / page slow-down.
   */
  private lastSearchKey: string | null = null;

  constructor(
    private readonly service: InvestmentDeclarationService,
    private readonly loader: LoaderService,
    private readonly dialog: CommonDialogService,
    private readonly cdr: ChangeDetectorRef,
    private readonly destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    // A filter change asks for a search; distinctUntilChanged stops a re-search
    // when nothing actually changed (e.g. a select directive re-emitting the
    // same value during the CD triggered by a search).
    this.filterForm.valueChanges
      .pipe(
        // 250ms so the transient re-emissions a select directive fires while the
        // results re-render (e.g. value -> '' -> value within one CD burst)
        // collapse to the final value; distinctUntilChanged then suppresses it.
        debounceTime(250),
        distinctUntilChanged(
          (a, b) => a.quarter === b.quarter && a.year === b.year && a.status === b.status,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.searchTrigger$.next());

    // ONE search pipeline. switchMap cancels any in-flight request when a new
    // one starts, and finalize guarantees the loader is always hidden — so the
    // loader can never get stuck (which previously froze the page after the
    // second status change), and requests can't overlap.
    this.searchTrigger$
      .pipe(
        switchMap(() => {
          if (!this.canSearch) {
            this.clearResults();
            return EMPTY;
          }
          const filter = this.buildFilter();
          const key = `${filter.quarter}|${filter.year}|${filter.status}`;
          // Same filter as the last search -> ignore. This is the hard stop for
          // the re-emit loop: identical consecutive triggers never re-fetch.
          if (key === this.lastSearchKey) {
            return EMPTY;
          }
          this.lastSearchKey = key;
          this.loader.show();
          return forkJoin({
            stock: this.service.getStockData(filter),
            unlisted: this.service.getUnlistedData(filter),
            realEstate: this.service.getRealData(filter),
          }).pipe(
            catchError(() => {
              this.lastSearchKey = null;
              this.dialog.alert('Unable to load history. Please try again.');
              return EMPTY;
            }),
            finalize(() => this.loader.hide()),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        this.stock = [...(res.stock ?? [])];
        this.unlisted = [...(res.unlisted ?? [])];
        this.realEstate = [...(res.realEstate ?? [])];
        this.searched = true;
        this.cdr.markForCheck();
      });
  }

  toggleFilters(): void {
    this.filtersOpen = !this.filtersOpen;
  }

  /** All three filters selected. */
  get canSearch(): boolean {
    const { quarter, year, status } = this.filterForm.getRawValue();
    return !!quarter && !!year && !!status;
  }

  /** Cancel is allowed only for Active records, so the Action column shows only then. */
  get canCancel(): boolean {
    return this.filterForm.getRawValue().status === HistoryStatus.Active;
  }

  get filterSummary(): string {
    const { quarter, year, status } = this.filterForm.getRawValue();
    const parts = [
      this.labelFor(this.quarterOptions, quarter),
      this.labelFor(this.yearOptions, year),
      this.labelFor(this.statusOptions, status),
    ].filter((v) => !!v);
    return parts.length ? parts.join(' / ') : 'Search by (Quarter/Year and Status)';
  }

  /** Resolve an option's display label from its bound value. */
  private labelFor(
    options: ReadonlyArray<{ label: string; id: unknown }>,
    value: unknown,
  ): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }
    return options.find((o) => String(o.id) === String(value))?.label ?? String(value);
  }

  private buildFilter(): HistoryFilter {
    const { quarter, year, status } = this.filterForm.getRawValue();
    return {
      quarter: quarter ? (quarter as Quarter) : null,
      year: year ? Number(year) : null,
      status: status ? (status as HistoryStatus) : null,
    };
  }

  /** Re-run the current filter even if unchanged (used after a cancel). */
  private refresh(): void {
    this.lastSearchKey = null;
    this.searchTrigger$.next();
  }

  private clearResults(): void {
    this.lastSearchKey = null;
    this.stock = [];
    this.unlisted = [];
    this.realEstate = [];
    this.searched = false;
    this.cdr.markForCheck();
  }

  // --- Cancel (dedicated API per section) ---

  onCancelStock(row: SecuritiesHistoryRow): void {
    this.confirmCancel(() => this.service.cancelStockRecord(row.id, this.cancelInput, row.rowNumber));
  }

  onCancelUnlisted(row: SecuritiesHistoryRow): void {
    this.confirmCancel(() => this.service.cancelUnlistRecord(row.id, this.cancelInput, row.rowNumber));
  }

  onCancelReal(row: RealEstateHistoryRow): void {
    this.confirmCancel(() => this.service.cancelRealRecord(row.id, this.cancelInput, row.rowNumber));
  }

  private get cancelInput(): string {
    return HistoryStatus.Inactive;
  }

  private confirmCancel(action: () => Observable<boolean>): void {
    this.dialog
      .confirm('Are you sure you want to cancel this declaration?', 'CONFIRMATION')
      .then((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.loader.show();
        action()
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (cancelled) => {
              this.loader.hide();
              // Backend returns status 'success' regardless — the real result
              // is the `data` flag.
              if (cancelled) {
                this.refresh();
              } else {
                this.dialog.alert('This record could not be cancelled. Please try again.');
              }
            },
            error: () => {
              this.loader.hide();
              this.dialog.alert('Unable to cancel. Please try again.');
            },
          });
      });
  }

  clearFilters(): void {
    this.filterForm.reset();
  }
}
