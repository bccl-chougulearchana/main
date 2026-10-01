import { formatDate } from '@angular/common';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { HistoryStatus, InvestmentFormType, Quarter } from '../enums/investment-declaration.enum';
import { AppSettings } from '../modals/appsettings';
import { RealEstateRow, SecuritiesRow, TableColumn } from '../modals/investment-declaration.model';
/**
 * Static configuration for the Investment / Trading Disclosure feature.
 * Centralised so copy, dropdown sets and endpoints live in one place.
 */

/**
 * API endpoint paths. These are placeholders for the real backend routes
 * consumed via SharedApiService — no backend is faked here, only the contract.
 * >>> Replace with the actual paths. <<<
 */
export const INVESTMENT_API = {
  listRole: AppSettings.API_DISCLOSURELISTROLE,
  firstQuestion: AppSettings.API_GETINITIALQUESTION,
  insertInitialAnswer: AppSettings.API_INSERTINITIALANWSER,
  remainingQuestions: AppSettings.API_GETQUESTION,
  getanswer: AppSettings.API_GETANSWER,
  getfeedback: AppSettings.API_GETFEEDBACK,
  insertFeedback: AppSettings.API_INSERTFEEDBACK,
  insertStockRecord: AppSettings.API_INSERTSTOCKRECORD,
  stockData: AppSettings.API_GETSTOCKDATA,
  realData: AppSettings.API_GETREALDATA,
  unlistedData: AppSettings.API_GETUNLISTEDDATA,
  cancelStock: AppSettings.API_CANCELSTOCKDATA,
  cancelReal: AppSettings.API_CANCELREALDATA,
  cancelUnlisted: AppSettings.API_CANCELUNLISTEDDATA,
} as const;

/** Declaration copy (from the design). */
export const DECLARATION_TEXT =
  'I hereby confirm that all the above details are true and correct.';

export const DECLARATION_NOTES: readonly string[] = [
  'Investment in SIP, mutual funds tax saving / portfolio management scheme are exempted',
  'Above is just by kind of information and it is not to be construed as approval',
];

export const DECLARATION_FOOTNOTE =
  '*To be filled in by an employee within 24 hours, in case he has not undertaken ' +
  'any of the transactions stated in cause 1/2 above.';

/**
 * Dropdown option sets. Hard-coded from the design for now —
 * swap to master-data/API-driven options if the backend provides them.
 */
export const DEALING_TYPE_OPTIONS = ['Directly', 'Indirectly'] as const;
export const RELATIONSHIP_OPTIONS = ['Dependent', 'Independent'] as const;
export const TRANSACTION_TYPE_OPTIONS = ['Purchase', 'Sale'] as const;

/**
 * Card titles per investment form.
 * NOTE: the Figma reuses the "Unlisted Entities Investment Declaration" label
 * on all three cards (likely a copy-paste). Sensible distinct titles are used
 * below — change if the business wants the single shared label instead.
 */
export const INVESTMENT_FORM_TITLE: Record<InvestmentFormType, string> = {
  [InvestmentFormType.Unlisted]: 'Unlisted Entities Investment Declaration',
  [InvestmentFormType.Listed]: 'Listed Stock Investment Declaration',
  [InvestmentFormType.RealEstate]: 'Real Estate Investment Declaration',
};


// ---------------------------------------------------------------------------
// History
// ---------------------------------------------------------------------------

/**
 * Filter option sets in the { label, id } shape consumed by `libSelect`.
 * The `id` is the value bound to the form control. No "All" row — the select
 * shows its placeholder until a concrete option is chosen.
 */
export const QUARTER_OPTIONS = [
  { label: 'Jan-Mar', id: Quarter.JanMar },
  { label: 'Apr-Jun', id: Quarter.AprJun },
  { label: 'Jul-Sep', id: Quarter.JulSep },
  { label: 'Oct-Dec', id: Quarter.OctDec },
];

export const STATUS_OPTIONS = [
  { label: 'Active', id: HistoryStatus.Active },
  { label: 'Inactive', id: HistoryStatus.Inactive },
];

/** Year list for the filter — adjust range as the business needs. */
export const YEAR_OPTIONS = (() => {
  const current = new Date().getFullYear();
  const years = [ current, current - 1, current - 2];
  return years.map((y) => ({ label: String(y), id: y }));
})();

/**
 * Column config for the securities history tables (Stock & Unlisted).
 * They differ only by the investee-company label, so the columns are built
 * from one place — no duplication.
 */
export function securitiesHistoryColumns(investeeLabel: string, includeActions = true): TableColumn[] {
  const columns: TableColumn[] = [
    { key: 'srNo', label: 'Sr No.' },
    { key: 'ownerName', label: 'Name of Share Owner' },
    { key: 'dealingType', label: 'Directly/Indirectly' },
    { key: 'relationship', label: 'Relationship with Employee' },
    { key: 'transactionType', label: 'Type of Transaction' },
    { key: 'noOfShares', label: 'No of shares' },
    { key: 'investeeCompany', label: investeeLabel },
    { key: 'transactionDate', label: 'Date of Transaction' },
    { key: 'ratePerShare', label: 'Rate per share' },
    { key: 'totalAmount', label: 'Total Amount' },
  ];
  if (includeActions) {
    columns.push({ key: 'actions', label: 'Action', isAction: true });
  }
  return columns;
}

/** Column config for the real-estate history table. */
export function realEstateHistoryColumns(includeActions = true): TableColumn[] {
  const columns: TableColumn[] = [
    { key: 'srNo', label: 'Sr No.' },
    { key: 'ownerName', label: 'Name of Share Owner' },
    { key: 'dealingType', label: 'Directly/Indirectly' },
    { key: 'relationship', label: 'Relationship with Employee' },
    { key: 'transactionType', label: 'Type of Transactions' },
    { key: 'propertyTypeMisc', label: 'Property Type/Misc' },
    { key: 'societyName', label: 'Name of society' },
    { key: 'builtUpArea', label: 'Built Up Area' },
    { key: 'developedBy', label: 'Developed By' },
    { key: 'locationState', label: 'Location Name/State' },
    { key: 'purchaseSaleDate', label: 'Date of Purchase/Sale' },
    { key: 'pricePerSqFt', label: 'Actual Price/sq. ft in Rs.' },
    { key: 'totalAmount', label: 'Total Amount in Rs.' },
  ];
  if (includeActions) {
    columns.push({ key: 'actions', label: 'Action', isAction: true });
  }
  return columns;
}

/** Format an ISO date string for table display (e.g. "04 Nov 2025"). */
export function formatTableDate(value: string | null): string {
  if (!value) {
    return '';
  }
  try {
    return formatDate(value, 'dd MMM yyyy', 'en-US');
  } catch {
    return value;
  }
}

// ---------------------------------------------------------------------------
// Investment forms — dropdowns (libSelect {label,id}) + Add/Delete rules
// ---------------------------------------------------------------------------

export const DEALING_TYPE_SELECT: { label: string; id: string }[] = [
  { label: 'Directly', id: 'Directly' },
  { label: 'Indirectly', id: 'Indirectly' },
];

export const RELATIONSHIP_SELECT: { label: string; id: string }[] = [
  { label: 'Dependent', id: 'Dependent' },
  { label: 'Independent', id: 'Independent' },
];

export const TRANSACTION_TYPE_SELECT: { label: string; id: string }[] = [
  { label: 'Purchase', id: 'Purchase' },
  { label: 'Sale', id: 'Sale' },
];

/** Add shows only on the last row; Delete shows only when more than one row exists. */
export function showAddButton(index: number, length: number): boolean {
  return index === length - 1;
}
export function showDeleteButton(length: number): boolean {
  return length > 1;
}

export function maxIsoDateValidator(maxDate: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string | null;
    if (!value || value <= maxDate) {
      return null;
    }
    return { maxDate: { max: maxDate, actual: value } };
  };
}
// ---------------------------------------------------------------------------
// insertStockRecord row serialization — each row becomes ONE comma-joined
// string. The backend splits on "," so a cell must not contain a comma;
// embedded commas are replaced with a space as a stopgap.
// ---------------------------------------------------------------------------
function csvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).replace(/,/g, ' ');
}

/** YYYY-MM-DD -> DD-MM-YYYY (leaves anything else untouched). */
// export function formatDateToDDMMYYYY(dateStr: string | null | undefined): string {
//   if (!dateStr) {
//     return '';
//   }
//   const parts = dateStr.split('-');
//   if (parts.length === 3) {
//     return `${parts[2]}-${parts[1]}-${parts[0]}`;
//   }
//   return dateStr;
// }
export function formatDateToDDMMMYYYY(dateStr: string | null | undefined): string {
  if (!dateStr) {
    return '';
  }

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const parts = dateStr.split('-');

  if (parts.length === 3) {
    const [year, month, day] = parts;
    const monthName = months[Number(month) - 1];

    return `${day}-${monthName}-${year}`;
  }

  return dateStr;
}

/**
 * Securities row -> backend column order:
 * OWNERNAME, EMPRELATIONSHIP, TRANTYPE, NOOFSHARE, COMPNAME, DIRECT,
 * TRANDATE, RATEPERSHARE, SHAREMKTPRICEPREDAY, TOTALAMT
 * (SHAREMKTPRICEPREDAY isn't captured by the form -> sent empty.)
 */
export function serializeSecuritiesRow(row: SecuritiesRow): string {
  return [
    row.ownerName,
    row.relationship,
    row.transactionType,
    row.noOfShares,
    row.investeeCompany,
    row.dealingType,
    formatDateToDDMMMYYYY(row.transactionDate),
    row.ratePerShare,
    '0', // SHAREMKTPRICEPREDAY — not in the form
    row.totalAmount,
  ]
    .map(csvCell)
    .join(',');
}

/**
 * Real-estate row -> comma-joined string in form order. NOTE: the provided
 * backend stub splits real-estate rows using the securities columns, so the
 * backend's real-estate parsing must be aligned to this order.
 */
export function serializeRealEstateRow(row: RealEstateRow): string {
  return [
    row.ownerName,       // 0  OWNERNAMEREAL
    row.dealingType,     // 1  DIRECTREAL
    row.relationship,    // 2  RELATIONREAL
    row.transactionType, // 3  SALEREAL
    row.propertyTypeMisc, // 4 PROPTYPREAL
    row.societyName,     // 5  NAMEOFSOCIETY
    row.builtUpArea,     // 6  BUILTUPREAL
    row.developedBy,     // 7  DEVELOPEDREAL
    row.locationState,   // 8  LOCATIONREAL
    formatDateToDDMMMYYYY(row.purchaseSaleDate), // 9 DATEREAL
    row.pricePerSqFt,    // 10 ACTUALREAL
    '0',                 // 11 MKTPRICEREAL — not captured by the form
    row.totalAmount,     // 12 TOTALAMTREAL
  ]
    .map(csvCell)
    .join(',');
}
