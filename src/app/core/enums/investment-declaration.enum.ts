/**
 * Enums for the Investment / Trading Disclosure feature.
 * Keep all string-literal domain values here so components, models and
 * constants share a single source of truth (no magic strings).
 */

/** YES / NO answer for every questionnaire question. */
export enum YesNo {
 Yes = 'Yes',
  No = 'No',
}

/**
 * Stable key for each question. The backend may add/re-order questions,
 * but these keys decide which investment form (if any) a question reveals,
 * so they must stay stable and map 1:1 with the API.
 */
export enum QuestionKey {
  /** Q1 – gate question. NO collapses straight to the declaration. */
  Transactions = 'TRANSACTIONS',
  /** Q2 – reveals the Unlisted Entities investment form. */
  Unlisted = 'UNLISTED',
  /** Q3 – reveals the Listed Stock investment form (same fields as Q2). */
  Listed = 'LISTED',
  /** Q4 – reveals the Real Estate investment form (different fields). */
  RealEstate = 'REAL_ESTATE',
}

/**
 * The three investment form variants. Unlisted and Listed share an identical
 * field set; Real Estate differs. Used to configure the single reusable
 * FormArray block built in Section 2.
 */
export enum InvestmentFormType {
  Unlisted = 'UNLISTED',
  Listed = 'LISTED',
  RealEstate = 'REAL_ESTATE',
}

/** Investment category — used to route the Cancel action to the right API. */
export enum InvestmentCategory {
  Stock = 'STOCK',
  Unlisted = 'UNLISTED',
  RealEstate = 'REAL_ESTATE',
}

/** Quarters used by the History filters. */
export enum Quarter {
  JanMar = 'JAN-MAR',
  AprJun = 'APR-JUN',
  JulSep = 'JUL-SEP',
  OctDec = 'OCT-DEC',
}

/** Declaration status used by the History filter. */
export enum HistoryStatus {
  Active = 'A',
  Inactive = 'C',
}