import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormControl, FormGroup, FormRecord, ReactiveFormsModule } from '@angular/forms';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap, tap, catchError, finalize } from 'rxjs/operators';
import { LoaderService } from '../../../shared/shared-services/loader.service';
import { CommonDialogService } from '../../../shared/shared-services/common-dialog.service';
import { CommonService } from '../../../core/services/common.service';
import { InvestmentDeclarationService } from '../../../services/investment-declaration/investment-declaration.service'; 
import { HistoryStatus, InvestmentFormType, Quarter, QuestionKey, YesNo } from '../../../core/enums/investment-declaration.enum';
import {
  EmployeeDetails,
  FeedbackRequest,
  HistoryFilter,
  InitialAnswerRequest,
  Question,
  RealEstateControls,
  RealEstateHistoryRow,
  SecuritiesControls,
  SecuritiesHistoryRow,
  StockRecordRequest,
  SubQuestionView,
  isRealEstateSub,
} from '../../../core/modals/investment-declaration.model';
import {
  DECLARATION_FOOTNOTE,
  DECLARATION_NOTES,
  DECLARATION_TEXT,
  INVESTMENT_FORM_TITLE,
  serializeRealEstateRow,
  serializeSecuritiesRow,
} from '../../../core/constants/investment-declaration.constant';
import { SecuritiesFormComponent } from '../securities-form/securities-form.component';
import { RealEstateFormComponent } from '../real-estate-form/real-estate-form.component';
import { StockHistoryComponent } from '../stock-history/stock-history.component';
import { UnlistedHistoryComponent } from '../unlisted-history/unlisted-history.component';
import { RealEstateHistoryComponent } from '../real-estate-history/real-estate-history.component';

/** The three sets of ACTIVE records for the quarter, matched to sub-questions. */
interface ActiveRecords {
  unlisted: SecuritiesHistoryRow[];
  listed: SecuritiesHistoryRow[];
  realEstate: RealEstateHistoryRow[];
}

/**
 * Questionnaire flow (API-integrated) with the returning-user experience.
 *
 *  First visit (getAnswer == null):
 *    gate YES/NO -> sub-questions -> forms -> submit (insertStockRecord).
 *
 *  Returning visit (getAnswer == YES): the gate + sub answers are pre-selected
 *  (getFeedback) and each YES sub-question shows its EXISTING active records
 *  (getUnlistedData/getStockData/getRealData, matched by formType) inline —
 *  read-only, collapsible, with Cancel. The form below holds NEW rows only.
 *
 *  Guards (frontend, mirrored server-side later):
 *    - sub YES->NO blocked while that question has active records.
 *    - gate YES->NO blocked while ANY active records exist.
 *
 *  Writes are change-only and use the `data` flag (true = saved). On gate NO
 *  submit, every still-YES sub is set to NO (insertFeedback) then the gate
 *  (insertInitialAnswer) — all on Submit.
 */
@Component({
  selector: 'app-questionnaire',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SecuritiesFormComponent,
    RealEstateFormComponent,
    StockHistoryComponent,
    UnlistedHistoryComponent,
    RealEstateHistoryComponent,
  ],
  templateUrl: './questionnaire.component.html',
  styleUrl: './questionnaire.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class QuestionnaireComponent implements OnInit {
  // Template-facing constants / enums.
  readonly YesNo = YesNo;
  readonly QuestionKey = QuestionKey;
  readonly InvestmentFormType = InvestmentFormType;
  readonly declarationText = DECLARATION_TEXT;
  readonly declarationNotes = DECLARATION_NOTES;
  readonly declarationFootnote = DECLARATION_FOOTNOTE;

  @Input() currentQuarter = '';
  @Output() submitted = new EventEmitter<void>();
  /** "click here" in a sub-question tooltip -> parent switches to History. */
  @Output() viewHistory = new EventEmitter<void>();
  currentYear = new Date().getFullYear();

  questions: Question[] = [];
  employee: EmployeeDetails | null = null;
  loaded = false;

  /** One YES/NO control per visible question, keyed by QuestionKey. */
  readonly answers = new FormRecord<FormControl<YesNo | null>>({});

  /** Last value known to be saved on the server (prefill or successful insert),
   *  keyed by QuestionKey. An answer is only re-sent when it differs. */
  private readonly persisted: Record<string, YesNo | null> = {};

  /** Snapshot of previous feedback (questionId -> Yes/No) for the info tooltip. */
  private previousFeedback: Record<string, YesNo> = {};

  /** Per-sub-question inline view (existing active records + collapse state),
   *  keyed by formType (each sub-question is exactly one type). */
  private readonly subViews = new Map<InvestmentFormType, SubQuestionView>();

  /** Gate answer confirmed (drives declaration/submit visibility). */
  private gateAnswered = false;
  /** Highlights unanswered sub-questions after a blocked submit. */
  showUnanswered = false;

  /** Question keys whose YES reveals the matching form. */
  private readonly confirmedYes = new Set<string>();

  // One independent FormArray per form (Add/Delete/calc never cross forms).
  readonly unlistedRows = new FormArray<FormGroup<SecuritiesControls>>([]);
  readonly listedRows = new FormArray<FormGroup<SecuritiesControls>>([]);
  readonly realEstateRows = new FormArray<FormGroup<RealEstateControls>>([]);

  constructor(
    private readonly service: InvestmentDeclarationService,
    private readonly common: CommonService,
    private readonly loader: LoaderService,
    private readonly dialog: CommonDialogService,
    private readonly cdr: ChangeDetectorRef,
    private readonly destroyRef: DestroyRef,
    private readonly el: ElementRef<HTMLElement>,
  ) {}

  ngOnInit(): void {
    const employee = this.common.getEmpDetails();
    this.employee = employee
      ? { name: employee.empFullName ?? '', sapId: employee.sapNumber ?? '', email: employee.emailId ?? '' }
      : null;
    this.loadInitial();
  }

  // ---------------------------------------------------------------------------
  // Load / prefill
  // ---------------------------------------------------------------------------

  private loadInitial(): void {
    this.loader.show();
    this.service
      .getFirstQuestion(this.currentQuarter)
      .pipe(
        switchMap((gate) => {
          this.questions = [gate];
          this.registerAnswer(gate.key);
          return this.service
            .getAnswer(this.currentYear, this.currentQuarter)
            .pipe(map((gateAnswer) => ({ gate, gateAnswer })));
        }),
        switchMap(({ gate, gateAnswer }) => {
          if (gateAnswer !== YesNo.Yes) {
            return of({ gate, gateAnswer, rest: [] as Question[], feedback: {} as Record<string, YesNo>, records: this.emptyRecords() });
          }
          const filter = this.activeFilter();
          return forkJoin({
            rest: this.service.getRemainingQuestions(),
            feedback: this.service.getFeedback(this.currentYear, this.currentQuarter).pipe(catchError(() => of({} as Record<string, YesNo>))),
            unlisted: this.service.getUnlistedData(filter).pipe(catchError(() => of([] as SecuritiesHistoryRow[]))),
            listed: this.service.getStockData(filter).pipe(catchError(() => of([] as SecuritiesHistoryRow[]))),
            realEstate: this.service.getRealData(filter).pipe(catchError(() => of([] as RealEstateHistoryRow[]))),
          }).pipe(
            map(({ rest, feedback, unlisted, listed, realEstate }) => ({
              gate,
              gateAnswer,
              rest,
              feedback,
              records: { unlisted, listed, realEstate } as ActiveRecords,
            })),
          );
        }),
        // Guarantee the loader is hidden on emit, error, OR complete-without-emit
        // (a single point of truth — the overlay can never stick and freeze the page).
        finalize(() => this.loader.hide()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ gate, gateAnswer, rest, feedback, records }) => {
          this.applyPrefill(gate, gateAnswer, rest, feedback, records);
          this.loaded = true;
          this.cdr.markForCheck();
        },
        error: () => {
          this.loaded = true;
          this.dialog.alert('Unable to load the questionnaire. Please try again.');
        },
      });
  }

  /**
   * Pre-select gate + sub answers from saved state and attach each sub's active
   * records. NEVER calls the insert APIs. Forms start empty (new rows only) and
   * collapsed when records already exist.
   */
  private applyPrefill(
    gate: Question,
    gateAnswer: YesNo | null,
    rest: Question[],
    feedback: Record<string, YesNo>,
    records: ActiveRecords,
  ): void {
    this.previousFeedback = { ...feedback };

    if (gateAnswer == null) {
      return; // fresh questionnaire
    }

    this.setAnswerSilently(gate.key, gateAnswer);
    this.persisted[gate.key] = gateAnswer;
    this.gateAnswered = true;

    if (gateAnswer === YesNo.No) {
      return;
    }

    this.setRemainingQuestions(rest);
    this.buildSubViews(rest, records);

    rest.forEach((q) => {
      const answer = feedback[q.apiId] ?? null;
      if (!answer) {
        return;
      }
      this.setAnswerSilently(q.key, answer);
      this.persisted[q.key] = answer;
      if (answer === YesNo.Yes) {
        this.confirmedYes.add(q.key); // reveal the form (empty; new rows only)
      }
    });
  }

  /** Build the per-sub inline views, matching records to each sub by formType. */
  private buildSubViews(rest: Question[], records: ActiveRecords): void {
    this.subViews.clear();
    rest.forEach((q) => {
      switch (q.formType) {
        case InvestmentFormType.Unlisted:
          this.subViews.set(q.formType, { question: q, formType: q.formType, records: records.unlisted, recordsOpen: false, formOpen: records.unlisted.length === 0 });
          break;
        case InvestmentFormType.Listed:
          this.subViews.set(q.formType, { question: q, formType: q.formType, records: records.listed, recordsOpen: false, formOpen: records.listed.length === 0 });
          break;
        case InvestmentFormType.RealEstate:
          this.subViews.set(q.formType, { question: q, formType: q.formType, records: records.realEstate, recordsOpen: false, formOpen: records.realEstate.length === 0 });
          break;
        default:
          break;
      }
    });
  }

  private setAnswerSilently(key: QuestionKey, value: YesNo): void {
    this.registerAnswer(key);
    this.answers.controls[key]?.setValue(value);
  }

  private emptyRecords(): ActiveRecords {
    return { unlisted: [], listed: [], realEstate: [] };
  }

  private activeFilter(): HistoryFilter {
    return { quarter: this.currentQuarter as Quarter, year: this.currentYear, status: HistoryStatus.Active };
  }

  // ---------------------------------------------------------------------------
  // Answering / branching
  // ---------------------------------------------------------------------------

  onAnswer(question: Question, index: number, value: YesNo): void {
    this.registerAnswer(question.key);
    this.answers.controls[question.key]?.setValue(value);
    if (this.showUnanswered && this.allSubQuestionsAnswered()) {
      this.showUnanswered = false;
    }
    this.cdr.markForCheck();

    const unchanged = this.persisted[question.key] === value;

    if (index === 0) {
      if (value === YesNo.Yes) {
        this.gateAnswered = true;
        if (unchanged) {
          this.ensureRemainingLoaded();
        } else {
          this.loadRemainingForYes(question);
        }
      } else {
        // Gate NO — allowed only when NO active records exist anywhere.
        if (this.hasAnyActiveRecords()) {
          this.answers.controls[question.key]?.setValue(YesNo.Yes);
          this.gateAnswered = true;
          this.cdr.markForCheck();
          this.dialog.alert("Please cancel all your active records before changing to 'No'.", 'ALERT');
          return;
        }
        // Allowed: keep sub data in memory (hidden by template); write on Submit.
        this.gateAnswered = true;
        this.cdr.markForCheck();
      }
      return;
    }

    if (unchanged) {
      // Sub unchanged -> reflect form visibility only, no insertFeedback.
      if (value === YesNo.Yes) {
        this.confirmedYes.add(question.key);
      } else {
        this.confirmedYes.delete(question.key);
        this.clearRowsFor(question);
      }
      this.cdr.markForCheck();
      return;
    }

    // Sub changed.
    if (value === YesNo.No && this.recordCountFor(question) > 0) {
      // Can't set NO while this question has active records.
      this.answers.controls[question.key]?.setValue(YesNo.Yes);
      this.confirmedYes.add(question.key);
      this.cdr.markForCheck();
      this.dialog.alert("Please cancel this question's active records before changing to 'No'.", 'ALERT');
      return;
    }
    this.persistFeedback(question, value);
  }

  /** Load sub-questions without persisting (gate already YES). */
  private ensureRemainingLoaded(): void {
    if (this.questions.length > 1) {
      return;
    }
    this.loader.show();
    this.service
      .getRemainingQuestions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (rest) => {
          this.setRemainingQuestions(rest);
          this.buildSubViews(rest, this.emptyRecords());
          this.loader.hide();
          this.cdr.markForCheck();
        },
        error: () => {
          this.loader.hide();
          this.dialog.alert('Unable to load the questions. Please try again.');
        },
      });
  }

  /** Gate = YES (changed): insertInitialAnswer -> getRemainingQuestions. */
  private loadRemainingForYes(question: Question): void {
    const request: InitialAnswerRequest = {
      CURRYEAR1: this.currentYear,
      QUARTER: this.currentQuarter,
      INITIALQUESTIONID: question.apiId,
      USERANSWER: YesNo.Yes,
    };

    this.loader.show();
    this.service
      .insertInitialAnswer(request)
      .pipe(
        switchMap((ok) => (ok ? this.service.getRemainingQuestions().pipe(map((rest) => ({ ok, rest }))) : of({ ok, rest: [] as Question[] }))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ ok, rest }) => {
          this.loader.hide();
          if (!ok) {
            this.revertAnswer(question.key);
            this.gateAnswered = false;
            this.dialog.alert('Unable to save your answer. Please try again.');
            return;
          }
          this.gateAnswered = true;
          this.persisted[question.key] = YesNo.Yes;
          this.setRemainingQuestions(rest);
          this.buildSubViews(rest, this.emptyRecords()); // fresh YES -> no records yet
          this.cdr.markForCheck();
        },
        error: () => {
          this.revertAnswer(question.key);
          this.gateAnswered = false;
          this.loader.hide();
          this.dialog.alert('Unable to save your answer. Please try again.');
        },
      });
  }

  /** Sub feedback (changed): insertFeedback, check `data` flag, reveal/hide form. */
  private persistFeedback(question: Question, value: YesNo): void {
    const request: FeedbackRequest = {
      CURRYEAR1: this.currentYear,
      QUARTER: this.currentQuarter,
      QUESTIONID: question.apiId,
      USERFEEDBACK: value,
    };

    this.loader.show();
    this.service
      .insertFeedback(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.loader.hide();
          if (!updated) {
            // Rejected -> roll back to the previously saved value.
            const prev = this.persisted[question.key] ?? null;
            this.answers.controls[question.key]?.setValue(prev);
            if (prev === YesNo.Yes) {
              this.confirmedYes.add(question.key);
            } else {
              this.confirmedYes.delete(question.key);
            }
            this.cdr.markForCheck();
            this.dialog.alert('This change could not be saved. Please try again.');
            return;
          }
          this.persisted[question.key] = value;
          if (value === YesNo.Yes) {
            this.confirmedYes.add(question.key);
          } else {
            this.confirmedYes.delete(question.key);
            this.clearRowsFor(question);
          }
          this.cdr.markForCheck();
        },
        error: () => {
          this.revertAnswer(question.key);
          this.loader.hide();
          this.dialog.alert('Unable to save your answer. Please try again.');
        },
      });
  }

  private setRemainingQuestions(rest: Question[]): void {
    this.questions = [this.questions[0], ...rest];
    rest.forEach((q) => this.registerAnswer(q.key));
  }

  private revertAnswer(key: string): void {
    this.answers.controls[key]?.setValue(this.persisted[key] ?? null);
    this.confirmedYes.delete(key);
    this.cdr.markForCheck();
  }

  private registerAnswer(key: QuestionKey): void {
    if (!this.answers.controls[key]) {
      this.answers.addControl(key, new FormControl<YesNo | null>(null));
    }
  }

  // ---------------------------------------------------------------------------
  // Inline records (returning users)
  // ---------------------------------------------------------------------------

  private subViewFor(question: Question): SubQuestionView | undefined {
    return question.formType ? this.subViews.get(question.formType) : undefined;
  }

  /** Active securities records for a sub-question (Unlisted/Listed). */
  securitiesRecords(question: Question): SecuritiesHistoryRow[] {
    const view = this.subViewFor(question);
    return view && !isRealEstateSub(view) ? view.records : [];
  }

  /** Active real-estate records for a sub-question. */
  realEstateRecords(question: Question): RealEstateHistoryRow[] {
    const view = this.subViewFor(question);
    return view && isRealEstateSub(view) ? view.records : [];
  }

  recordCountFor(question: Question): number {
    return this.subViewFor(question)?.records.length ?? 0;
  }

  recordsOpenFor(question: Question): boolean {
    return this.subViewFor(question)?.recordsOpen ?? false;
  }

  /** Form is open by default for first-time users (no view) or when 0 records. */
  formOpenFor(question: Question): boolean {
    const view = this.subViewFor(question);
    return view ? view.formOpen : true;
  }

  toggleRecords(question: Question): void {
    const view = this.subViewFor(question);
    if (view) {
      view.recordsOpen = !view.recordsOpen;
      this.cdr.markForCheck();
    }
  }

  toggleForm(question: Question): void {
    const view = this.subViewFor(question);
    if (view) {
      view.formOpen = !view.formOpen;
      this.cdr.markForCheck();
    }
  }

  /** Back out of an optional "add new record": discard its rows and collapse. */
  cancelAddNew(question: Question): void {
    this.clearRowsFor(question);
    const view = this.subViewFor(question);
    if (view) {
      view.formOpen = false;
    }
    this.cdr.markForCheck();
  }

  /** Does this question's form have at least one row with real input? */
  private hasNonEmptyRow(question: Question): boolean {
    return this.rowsFor(question).controls.some((g) => !this.isRowEmpty(g as FormGroup));
  }

  private isRowEmpty(group: FormGroup): boolean {
    return Object.entries(group.controls).every(([key, control]) => {
      if (key === 'totalAmount') {
        return true; // computed / disabled — ignore
      }
      const value = control.value;
      return value === null || value === undefined || value === '';
    });
  }

  private hasAnyActiveRecords(): boolean {
    let total = 0;
    this.subViews.forEach((v) => (total += v.records.length));
    return total > 0;
  }

  /** Cancel an inline record; on success re-load that type's active records. */
  onCancelRecord(question: Question, row: SecuritiesHistoryRow | RealEstateHistoryRow): void {
    this.dialog.confirm('Are you sure you want to cancel this declaration?', 'CONFIRMATION').then((confirmed) => {
      if (!confirmed) {
        return;
      }
      const input = HistoryStatus.Inactive;
      let action$: Observable<boolean>;
      switch (question.formType) {
        case InvestmentFormType.Listed:
          action$ = this.service.cancelStockRecord(row.id, input, row.rowNumber);
          break;
        case InvestmentFormType.Unlisted:
          action$ = this.service.cancelUnlistRecord(row.id, input, row.rowNumber);
          break;
        case InvestmentFormType.RealEstate:
          action$ = this.service.cancelRealRecord(row.id, input, row.rowNumber);
          break;
        default:
          return;
      }
      this.loader.show();
      action$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (cancelled) => {
          if (cancelled && question.formType) {
            this.reloadRecordsFor(question.formType);
          } else {
            this.loader.hide();
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

  private reloadRecordsFor(formType: InvestmentFormType): void {
    const filter = this.activeFilter();
    const req$: Observable<SecuritiesHistoryRow[] | RealEstateHistoryRow[]> =
      formType === InvestmentFormType.RealEstate
        ? this.service.getRealData(filter)
        : formType === InvestmentFormType.Listed
        ? this.service.getStockData(filter)
        : this.service.getUnlistedData(filter);

    req$.pipe(finalize(() => this.loader.hide()), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (rows) => {
        const view = this.subViews.get(formType);
        if (view) {
          // Narrow the union so `records` is the correct row type.
          if (isRealEstateSub(view)) {
            view.records = rows as RealEstateHistoryRow[];
          } else {
            view.records = rows as SecuritiesHistoryRow[];
          }
          if (rows.length === 0) {
            // All cancelled -> collapse the (empty) table and open the form so
            // the user can add again or now choose No.
            view.recordsOpen = false;
            view.formOpen = true;
          }
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.dialog.alert('Unable to refresh records. Please try again.');
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Forms
  // ---------------------------------------------------------------------------

  securitiesRowsFor(question: Question): FormArray<FormGroup<SecuritiesControls>> {
    return question.formType === InvestmentFormType.Listed ? this.listedRows : this.unlistedRows;
  }

  private rowsFor(question: Question): FormArray {
    if (question.formType === InvestmentFormType.RealEstate) {
      return this.realEstateRows;
    }
    return question.formType === InvestmentFormType.Listed ? this.listedRows : this.unlistedRows;
  }

  private clearRowsFor(question: Question): void {
    switch (question.formType) {
      case InvestmentFormType.Listed:
        this.listedRows.clear();
        break;
      case InvestmentFormType.Unlisted:
        this.unlistedRows.clear();
        break;
      case InvestmentFormType.RealEstate:
        this.realEstateRows.clear();
        break;
      default:
        break;
    }
  }

  private clearAllRows(): void {
    this.unlistedRows.clear();
    this.listedRows.clear();
    this.realEstateRows.clear();
  }

  /** True (and marks touched) if any NON-EMPTY new row is incomplete. A fully
   *  empty row is ignored — it's an untouched/optional slot, not an error. */
  private hasInvalidForms(): boolean {
    let invalid = false;
    [this.unlistedRows, this.listedRows, this.realEstateRows].forEach((rows) => {
      rows.controls.forEach((group) => {
        if (!this.isRowEmpty(group) && group.invalid) {
          group.markAllAsTouched();
          this.forceRequiredDisplay([group]);
          invalid = true;
        }
      });
    });
    return invalid;
  }

  private hasFutureDateForms(): boolean {
    let invalid = false;
    [this.unlistedRows, this.listedRows, this.realEstateRows].forEach((rows) => {
      rows.controls.forEach((group) => {
        if (this.isRowEmpty(group)) {
          return;
        }
        const formGroup = group as FormGroup;
        ['transactionDate', 'purchaseSaleDate'].forEach((key) => {
          const control = formGroup.get(key);
          if (control?.hasError('maxDate')) {
            control.markAsTouched();
            invalid = true;
          }
        });
      });
    });
    return invalid;
  }

  private forceRequiredDisplay(rows: AbstractControl[]): void {
    rows.forEach((group) => {
      const controls = (group as FormGroup).controls;
      Object.keys(controls).forEach((key) => {
        const control = controls[key];
        if (control.enabled && control.invalid && !control.value) {
          control.setErrors({ ...(control.errors ?? {}), required: true });
          control.markAsTouched();
        }
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Validation helpers
  // ---------------------------------------------------------------------------

  isAnswered(key: string): boolean {
    const value = this.answers.controls[key]?.value;
    return value === YesNo.Yes || value === YesNo.No;
  }

  private subQuestions(): Question[] {
    return this.questions.slice(1);
  }

  private allSubQuestionsAnswered(): boolean {
    return this.subQuestions().every((q) => this.isAnswered(q.key));
  }

  /**
   * First YES sub-question that is neither backed by an existing record nor by a
   * new row — such a question must get at least one record or be set to No.
   */
  private firstYesSubMissingRecord(): Question | null {
    return (
      this.subQuestions().find(
        (q) => this.isYes(q.key) && this.recordCountFor(q) === 0 && !this.hasNonEmptyRow(q),
      ) ?? null
    );
  }

  private focusCard(key: string): void {
    setTimeout(() => {
      const el = this.el.nativeElement.querySelector<HTMLElement>(`.qd-card[data-question="${key}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus({ preventScroll: true });
      }
    });
  }

  private focusFirstUnanswered(): void {
    const missing = this.subQuestions().find((q) => !this.isAnswered(q.key));
    if (missing) {
      this.focusCard(missing.key);
    }
  }

  /** Focus the first input of a specific question's (open) new-record form. */
  private focusFormField(key: string): void {
    setTimeout(() => {
      const wrap = this.el.nativeElement.querySelector<HTMLElement>(`.qd-newform[data-form="${key}"]`);
      const field = wrap?.querySelector<HTMLElement>('input, select, textarea, [formcontrolname]');
      if (field) {
        field.scrollIntoView({ behavior: 'smooth', block: 'center' });
        field.focus({ preventScroll: true });
      } else {
        this.focusCard(key); // fallback
      }
    });
  }

  private focusFirstInvalidField(): void {
    setTimeout(() => {
      const el = this.el.nativeElement.querySelector<HTMLElement>('[formcontrolname].ng-invalid');
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  get canSubmit(): boolean {
    return this.gateAnswered;
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  /** Reset re-pulls the saved server state (discards unsaved new rows). */
  reset(): void {
    this.confirmedYes.clear();
    this.subViews.clear();
    this.gateAnswered = false;
    this.showUnanswered = false;
    this.clearAllRows();
    Object.keys(this.answers.controls).forEach((k) => this.answers.removeControl(k));
    Object.keys(this.persisted).forEach((k) => delete this.persisted[k]);
    this.previousFeedback = {};
    this.questions = [];
    this.loaded = false;
    this.loadInitial();
  }

  submit(): void {
    const gate = this.questions[0];
    if (!gate) {
      return;
    }
    const gateAnswer = this.answers.controls[gate.key]?.value ?? null;

    let request$: Observable<boolean>;

    if (gateAnswer === YesNo.No) {
      // Safety: gate NO requires zero active records.
      if (this.hasAnyActiveRecords()) {
        this.dialog.alert("Please cancel all your active records before changing to 'No'.", 'ALERT');
        return;
      }
      // Every sub that isn't already NO must be set to NO first (covers YES and
      // any still-unanswered sub), then the gate goes NO.
      const subsToNo = this.subQuestions().filter((q) => this.persisted[q.key] !== YesNo.No);
      const gateNeedsWrite = this.persisted[gate.key] !== YesNo.No;
      if (!subsToNo.length && !gateNeedsWrite) {
        this.submitted.emit();
        return;
      }
      const feedback$ = subsToNo.length
        ? forkJoin(
            subsToNo.map((q) =>
              this.service
                .insertFeedback({ CURRYEAR1: this.currentYear, QUARTER: this.currentQuarter, QUESTIONID: q.apiId, USERFEEDBACK: YesNo.No })
                .pipe(map((ok) => ({ q, ok }))),
            ),
          )
        : of([] as { q: Question; ok: boolean }[]);
      request$ = feedback$.pipe(
        switchMap((results) => {
          if (results.some((r) => !r.ok)) {
            return of(false); 
          }
          results.forEach((r) => (this.persisted[r.q.key] = YesNo.No));
          if (!gateNeedsWrite) {
            return of(true);
          }
          return this.service
            .insertInitialAnswer({ CURRYEAR1: this.currentYear, QUARTER: this.currentQuarter, INITIALQUESTIONID: gate.apiId, USERANSWER: YesNo.No })
            .pipe(tap((ok) => { if (ok) { this.persisted[gate.key] = YesNo.No; } }));
        }),
      );
    } else {
      // YES -> (1) every sub-question must be answered.
      if (!this.allSubQuestionsAnswered()) {
        this.showUnanswered = true;
        this.answers.markAllAsTouched();
        this.cdr.markForCheck();
        this.dialog.alert('Please answer all the questions.', 'ALERT').then(() => this.focusFirstUnanswered());
        return;
      }
      // (2) a YES sub with no existing record must have at least one real
      //     (non-empty) new row — an untouched seeded row doesn't count, so an
      //     "Add new record" opened by mistake never satisfies it silently.
      const missing = this.firstYesSubMissingRecord();
      if (missing) {
        this.dialog
          .alert("Please add at least one record for the selected question, or choose 'No'.", 'ALERT')
          .then(() => this.focusFormField(missing.key));
        return;
      }
      // (3) any new rows entered must be complete.
      if (this.hasFutureDateForms()) {
        this.cdr.markForCheck();
        this.dialog.alert('Future transaction dates are not allowed.', 'ALERT').then(() => this.focusFirstInvalidField());
        return;
      }
      if (this.hasInvalidForms()) {
        this.cdr.markForCheck();
        this.dialog.alert('Please fill all required fields.', 'ALERT').then(() => this.focusFirstInvalidField());
        return;
      }
      request$ = this.service.insertStockRecord(this.buildStockRecord());
    }

    this.loader.show();
    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (updated) => {
        this.loader.hide();
        if (updated) {
          this.submitted.emit();
        } else {
          this.dialog.alert('Submission could not be saved. Please try again.');
        }
      },
      error: () => {
        this.loader.hide();
        this.dialog.alert('Submission failed. Please try again.');
      },
    });
  }

  /** Final payload — ONLY the new, non-empty form rows (existing records
   *  untouched; untouched/empty seeded rows are excluded). */
  private buildStockRecord(): StockRecordRequest {
    return {
      listedStockDetails: this.serializeRows(this.listedRows, serializeSecuritiesRow),
      nonListedStockDetails: this.serializeRows(this.unlistedRows, serializeSecuritiesRow),
      realEstateDetails: this.serializeRows(this.realEstateRows, serializeRealEstateRow),
      quarter: this.currentQuarter,
      curryear: this.currentYear,
    };
  }

  private serializeRows(arr: FormArray<any>, serialize: (raw: any) => string): string[] {
    const out: string[] = [];
    arr.controls.forEach((group: any) => {
      if (!this.isRowEmpty(group as FormGroup)) {
        out.push(serialize((group as FormGroup).getRawValue()));
      }
    });
    return out;
  }

  // ---------------------------------------------------------------------------
  // Template helpers
  // ---------------------------------------------------------------------------

  get gateKey(): QuestionKey | undefined {
    return this.questions[0]?.key;
  }

  get gateIsYes(): boolean {
    return this.gateKey ? this.isYes(this.gateKey) : false;
  }

  isYes(key: QuestionKey): boolean {
    return this.answers.controls[key]?.value === YesNo.Yes;
  }

  isNo(key: QuestionKey): boolean {
    return this.answers.controls[key]?.value === YesNo.No;
  }

  isSelected(key: QuestionKey, value: YesNo): boolean {
    return this.answers.controls[key]?.value === value;
  }

  showForm(question: Question): boolean {
    return question.formType != null && this.confirmedYes.has(question.key);
  }

  isSecurities(question: Question): boolean {
    return question.formType === InvestmentFormType.Unlisted || question.formType === InvestmentFormType.Listed;
  }

  isRealEstate(question: Question): boolean {
    return question.formType === InvestmentFormType.RealEstate;
  }

  titleFor(question: Question): string {
    return question.formType ? INVESTMENT_FORM_TITLE[question.formType] : '';
  }

  investeeLabelFor(question: Question): string {
    return question.formType === InvestmentFormType.Listed
      ? 'Name of Listed Investee Company'
      : 'Name of Unlisted Investee Company';
  }

  hasPreviousRecord(question: Question): boolean {
    return this.previousFeedback[question.apiId] === YesNo.Yes;
  }

  tooltipText(question: Question): string {
    return this.hasPreviousRecord(question)
      ? 'View previously added record for this Quarter'
      : 'Not filled in this Quarter';
  }

  goToHistory(): void {
    this.viewHistory.emit();
  }
}
