import { FormControl } from '@angular/forms';
import { HistoryStatus, InvestmentCategory, InvestmentFormType, QuestionKey, Quarter, YesNo } from '../enums/investment-declaration.enum';
import { from } from 'rxjs';

/**
 * Interfaces for the Investment / Trading Disclosure feature.
 * No `any` anywhere — every API contract and form value is typed.
 */

/** A single questionnaire question (mapped from the API rows). */
export interface Question {
  id: number;
  apiId: string;                        // server id used by insertInitialAnswer / insertFeedback
  key: QuestionKey;                     // unique UI key for the answers FormRecord
  text: string;
  formType: InvestmentFormType | null;  // which form a YES reveals (null for the gate question)
}

/** Logged-in employee details shown (read-only) in the declaration block. */
export interface EmployeeDetails {
  name: string;
  sapId: string;
  email: string;
}

/** Typed control for one YES/NO answer. */
export type AnswerControl = FormControl<YesNo | null>;

/**
 * Securities row — shared by the Unlisted (Q2) and Listed (Q3) forms,
 * which have an identical field set. `totalAmount` is derived
 * (noOfShares * ratePerShare) and never edited directly.
 */
export interface SecuritiesRow {
  ownerName: string | null;
  dealingType: string | null;      // Directly / Indirectly
  relationship: string | null;     // Relationship with Employee
  transactionType: string | null;  // Type of Transaction
  noOfShares: number | null;
  investeeCompany: string | null;  // Name of (Un)listed Investee Company
  transactionDate: string | null;
  ratePerShare: number | null;
  totalAmount: number | null;      // = noOfShares * ratePerShare (read-only)
}

/**
 * Real estate row (Q4) — different fields, same FormArray behaviour.
 * `totalAmount` is derived (builtUpArea * pricePerSqFt).
 */
export interface RealEstateRow {
  ownerName: string | null;
  dealingType: string | null;       // Directly / Indirectly
  relationship: string | null;      // Relationship with Employee
  transactionType: string | null;   // Type of Transactions
  propertyTypeMisc: string | null;  // Property Type Misc
  societyName: string | null;       // Name of society
  builtUpArea: number | null;
  developedBy: string | null;
  locationState: string | null;     // Location Name/State
  purchaseSaleDate: string | null;  // Date of Purchase / Sale
  pricePerSqFt: number | null;      // Actual Price/sq. ft in Rs.
  totalAmount: number | null;       // = builtUpArea * pricePerSqFt (read-only)
}

/**
 * Submit payload. When Q1 = NO, only `answers` (with the single Q1 answer)
 * is populated. The three investment arrays are appended in Section 2.
 */
export interface DeclarationPayload {
  employee: EmployeeDetails;
  answers: Partial<Record<QuestionKey, YesNo>>;
  unlisted?: SecuritiesRow[];
  listed?: SecuritiesRow[];
  realEstate?: RealEstateRow[];
}

/** Response shape after a successful submit. */
export interface SubmitResponse {
  success: boolean;
  message?: string;
  referenceId?: string;
}

// ---------------------------------------------------------------------------
// History
// ---------------------------------------------------------------------------

/** Filter applied on the single History page. */
export interface HistoryFilter {
  quarter: Quarter | null;
  year: number | null;
  status: HistoryStatus | null;
}

/** A stored securities record (stock or unlisted) shown in History. */
export interface SecuritiesHistoryRow extends SecuritiesRow {
  id: string;            // TXNID (sent as decryptTxnId on cancel)
  rowNumber: string;     // ROWNUMBER (sent as rowNumber on cancel)
  status?: HistoryStatus;
  quarter?: Quarter;
  year?: number;
}

/** A stored real-estate record shown in History. */
export interface RealEstateHistoryRow extends RealEstateRow {
  id: string;            // TXNID (sent as decryptTxnId on cancel)
  rowNumber: string;     // ROWNUMBER (sent as viewRowNumberReal on cancel)
  status?: HistoryStatus;
  quarter?: Quarter;
  year?: number;
}

/** The three history blocks returned for a given filter. */
export interface HistoryResponse {
  stock: SecuritiesHistoryRow[];
  unlisted: SecuritiesHistoryRow[];
  realEstate: RealEstateHistoryRow[];
}

/** Payload for cancelling a stored declaration. */
export interface CancelRequest {
  category: InvestmentCategory;
  id: string;
}

// ---------------------------------------------------------------------------
// Questionnaire per-sub-question view model (returning-user flow)
// ---------------------------------------------------------------------------

/**
 * One sub-question rendered on the Questionnaire tab for a returning user.
 * Beneath each YES sub-question we show its EXISTING active records (read-only,
 * cancellable) and, separately, a form for NEW records only. Existing vs new is
 * implicit: `records` = already-saved (E), the form holds only new rows (N).
 *
 * Modeled as a discriminated union on `formType` so `records` is correctly typed
 * per category (securities vs real-estate) and the template can narrow via
 * `isRealEstateSub`.
 */
interface SubQuestionViewBase {
  /** The sub-question (its `formType` is never null). */
  question: Question;
  /** Inline "existing active records" table is expanded. */
  recordsOpen: boolean;
  /** New-record form is expanded (collapsed by default when records exist). */
  formOpen: boolean;
}

/** Unlisted (getUnlistedData) or Listed (getStockData) sub-question. */
export interface SecuritiesSubView extends SubQuestionViewBase {
  formType: InvestmentFormType.Unlisted | InvestmentFormType.Listed;
  /** Existing ACTIVE securities records for this quarter (cancellable). */
  records: SecuritiesHistoryRow[];
}

/** Real-estate (getRealData) sub-question. */
export interface RealEstateSubView extends SubQuestionViewBase {
  formType: InvestmentFormType.RealEstate;
  /** Existing ACTIVE real-estate records for this quarter (cancellable). */
  records: RealEstateHistoryRow[];
}

export type SubQuestionView = SecuritiesSubView | RealEstateSubView;

/** Narrowing guard: is this the real-estate sub-question? */
export function isRealEstateSub(sub: SubQuestionView): sub is RealEstateSubView {
  return sub.formType === InvestmentFormType.RealEstate;
}

/** Number of existing active records for a sub-question (drives the guards). */
export function subRecordCount(sub: SubQuestionView): number {
  return sub.records.length;
}

// ---- Generic types consumed by the CustomTableDirective ----
export interface TableLinkCell {
  label: string;
  tooltip?: string;
  callback: () => void;
}

export interface TableActionCell {
  icon?: string;
  label: string;
  tooltip?: string;
  callback: () => void;
}

export type TableCellValue = string | number | null | TableLinkCell | TableActionCell[];

export type TableRow = Record<string, TableCellValue>;

export interface TableColumn {
  key: string;
  label: string;
  isLink?: boolean;
  isAction?: boolean;
}

// ---------------------------------------------------------------------------
// API envelope & request payloads
// ---------------------------------------------------------------------------

/** Backend wraps every response as [{ status, data }]. */
export interface ApiEnvelope<T> {
  status: string;
  data: T;
  message?: string;
}
export type ApiResponse<T> = ApiEnvelope<T>[];

/** Raw question row: [id, text] (initial) or [id, text, type] (remaining). */
export type RawQuestionRow = string[];

export interface InitialAnswerRequest {
  CURRYEAR1: number;
  QUARTER: string;
  INITIALQUESTIONID: string;
  USERANSWER: string;
}

export interface FeedbackRequest {
  CURRYEAR1: number;
  QUARTER: string;
  QUESTIONID: string;
  USERFEEDBACK: string;
}

/** Final submission payload (insertStockRecord). */
export interface StockRecordRequest {
 listedStockDetails: string[];
  nonListedStockDetails: string[];
  realEstateDetails: string[];
  quarter: string;
  curryear: number;
}

// ---------------------------------------------------------------------------
// Typed reactive-form controls for the investment forms
// ---------------------------------------------------------------------------

/** Securities row controls — shared by the Unlisted and Listed forms. */
export interface SecuritiesControls {
  ownerName: FormControl<string | null>;
  dealingType: FormControl<string | null>;
  relationship: FormControl<string | null>;
  transactionType: FormControl<string | null>;
  noOfShares: FormControl<number | null>;
  investeeCompany: FormControl<string | null>;
  transactionDate: FormControl<string | null>;
  ratePerShare: FormControl<number | null>;
  totalAmount: FormControl<number | null>;
}

/** Real-estate row controls. */
export interface RealEstateControls {
  ownerName: FormControl<string | null>;
  dealingType: FormControl<string | null>;
  relationship: FormControl<string | null>;
  transactionType: FormControl<string | null>;
  propertyTypeMisc: FormControl<string | null>;
  societyName: FormControl<string | null>;
  builtUpArea: FormControl<number | null>;
  developedBy: FormControl<string | null>;
  locationState: FormControl<string | null>;
  purchaseSaleDate: FormControl<string | null>;
  pricePerSqFt: FormControl<number | null>;
  totalAmount: FormControl<number | null>;
}