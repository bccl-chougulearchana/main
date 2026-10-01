import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { INVESTMENT_API } from '../../core/constants/investment-declaration.constant';
import { HistoryStatus, InvestmentFormType, QuestionKey, Quarter, YesNo } from '../../core/enums/investment-declaration.enum';
import {
  ApiEnvelope,
  ApiResponse,
  FeedbackRequest,
  HistoryFilter,
  InitialAnswerRequest,
  Question,
  RawQuestionRow,
  RealEstateHistoryRow,
  SecuritiesHistoryRow,
  StockRecordRequest,
} from '../../core/modals/investment-declaration.model';

/**
 * A raw history row as returned by getStockData/getRealData/getUnlistedData.
 * Assumed to be a keyed object; adjust once the real response is confirmed.
 */
type HistoryApiRow = Record<string, string | number | null>;

/**
 * Feature API service. Keeps transport + response-shaping out of components.
 * Backend wraps every payload as [{ status, data }], so reads are unwrapped
 * here and the components only ever see typed domain models.
 */
@Injectable({ providedIn: 'root' })
export class InvestmentDeclarationService {
  constructor(private readonly http: HttpClient) {}

  // ---------------------------------------------------------------------------
  // Questionnaire flow
  // ---------------------------------------------------------------------------

  /** Step 1 — list roles (called before the initial question). */
  /** Raw role response — caller inspects res[0].data[0][0] for the auth flag. */
  listRoles(): Observable<ApiResponse<string[][]>> {
    return this.http.post<ApiResponse<string[][]>>(INVESTMENT_API.listRole, '');
  }

  /** Gate question for the current quarter. */
  getFirstQuestion(quarter: string): Observable<Question> {
    const params = new HttpParams().set('QUARTER', quarter);
    return this.http
      .post<ApiResponse<RawQuestionRow[]>>(INVESTMENT_API.firstQuestion, params)
      .pipe(
        map((res) => {
          const [id, text] = this.unwrap(res)[0];
          return { id: Number(id), apiId: id, key: QuestionKey.Transactions, text, formType: null };
        }),
      );
  }

  /** Persist the gate answer (YES/NO). Resolves to the backend `data` flag
   *  (true = saved/updated, false = rejected — status is 'success' either way). */
  insertInitialAnswer(request: InitialAnswerRequest): Observable<boolean> {
    const params = new HttpParams()
      .set('CURRYEAR1', request.CURRYEAR1)
      .set('QUARTER', request.QUARTER)
      .set('INITIALQUESTIONID', request.INITIALQUESTIONID)
      .set('USERANSWER', request.USERANSWER);
    return this.http
      .post<ApiResponse<unknown>>(INVESTMENT_API.insertInitialAnswer, params)
      .pipe(map((res) => this.readUpdated(res)));
  }

  /** Remaining questions (only after the gate answer = YES). */
  getRemainingQuestions(): Observable<Question[]> {
    return this.http
      .post<ApiResponse<RawQuestionRow[]>>(INVESTMENT_API.remainingQuestions, '')
      .pipe(map((res) => this.unwrap(res).map((row) => this.toQuestion(row))));
  }

  /** Previous gate answer for the quarter (Yes/No), or null if none saved yet. */
  getAnswer(currYear: number, quarter: string): Observable<YesNo | null> {
    const params = new HttpParams().set('QUARTER', quarter).set('YEAR', currYear);
    return this.http
      .post<ApiResponse<string[][]>>(INVESTMENT_API.getanswer, params)
      .pipe(map((res) => this.toYesNo(this.unwrap(res)[0]?.[2])));
  }

  /**
   * Previous sub-question feedback for the quarter, as a map of
   * questionId (matches Question.apiId) -> Yes/No.
   */
  getFeedback(currYear: number, quarter: string): Observable<Record<string, YesNo>> {
    const params = new HttpParams().set('currYear', currYear).set('QUARTER', quarter);
    return this.http.post<ApiResponse<string[][]>>(INVESTMENT_API.getfeedback, params).pipe(
      map((res) => {
        const out: Record<string, YesNo> = {};
        this.unwrap(res).forEach((row) => {
          const id = row?.[0];
          const answer = this.toYesNo(row?.[2]);
          if (id != null && answer) {
            out[String(id)] = answer;
          }
        });
        return out;
      }),
    );
  }

  private toYesNo(value: unknown): YesNo | null {
    if (value == null) {
      return null;
    }
    const v = String(value).trim().toLowerCase();
    if (v === 'yes') {
      return YesNo.Yes;
    }
    if (v === 'no') {
      return YesNo.No;
    }
    return null;
  }

  /** Persist an answer to a remaining question. Resolves to the `data` flag
   *  (false = rejected, e.g. Yes->No blocked because active records exist). */
  insertFeedback(request: FeedbackRequest): Observable<boolean> {
    const params = new HttpParams()
      .set('CURRYEAR1', request.CURRYEAR1)
      .set('QUARTER', request.QUARTER)
      .set('QUESTIONID', request.QUESTIONID)
      .set('USERFEEDBACK', request.USERFEEDBACK);
    return this.http
      .post<ApiResponse<unknown>>(INVESTMENT_API.insertFeedback, params)
      .pipe(map((res) => this.readUpdated(res)));
  }
 /** Final submission — inserts only the newly added rows. Resolves to `data`. */
  insertStockRecord(request: StockRecordRequest): Observable<boolean> {
    // const params = new HttpParams()
    //   .set('listedStockDetails', JSON.stringify(request.listedStockDetails))
    //   .set('nonListedStockDetails', JSON.stringify(request.nonListedStockDetails))
    //   .set('realEstateDetails', JSON.stringify(request.realEstateDetails))
    //   .set('quarter', request.quarter)
    //   .set('curryear1', request.curryear);
   
       let params = new HttpParams()
      .set('quarter', request.quarter)
       .set('curryear1', request.curryear);
      request.listedStockDetails.forEach((row:any) => (params = params.append('listedStockDetails', row)));
      request.nonListedStockDetails.forEach((row:any) => (params = params.append('nonListedStockDetails', row)));
      request.realEstateDetails.forEach((row:any) => (params = params.append('realEstateDetails', row)));
    return this.http
      .post<ApiResponse<unknown>>(INVESTMENT_API.insertStockRecord, params)
      .pipe(map((res) => this.readUpdated(res)));
  }


  // insertStockRecord(request: StockRecordRequest): Observable<void> {
  //   const body = {
  //     listedStockDetails: request.listedStockDetails,
  //     nonListedStockDetails: request.nonListedStockDetails,
  //     realEstateDetails: request.realEstateDetails,
  //     quarter: request.quarter,
  //     curryear1: request.curryear,
  //   };
  //   return this.http
  //     .post<ApiResponse<unknown>>(INVESTMENT_API.insertStockRecord, body)
  //     .pipe(map((res) => this.ensureSuccess(res)));
  // }


  // insertStockRecord(request: StockRecordRequest): Observable<void> {
  //   let params = new HttpParams()
  //     .set('quarter', request.quarter)
  //     .set('curryear1', request.curryear);
  //   params = this.appendList(params, 'listedStockDetails', request.listedStockDetails);
  //   params = this.appendList(params, 'nonListedStockDetails', request.nonListedStockDetails);
  //   params = this.appendList(params, 'realEstateDetails', request.realEstateDetails);
  //   return this.http
  //     .post<ApiResponse<unknown>>(INVESTMENT_API.insertStockRecord, params)
  //     .pipe(map((res) => this.ensureSuccess(res)));
  // }

  // private appendList(params: HttpParams, key: string, rows: string[]): HttpParams {
  //   if (rows.length === 0) {
  //     return params.append(key, '');
  //   }
  //   return rows.reduce((acc, row) => acc.append(key, row), params);
  // }


//   insertStockRecord(request: StockRecordRequest): Observable<void> {
//     const body = {
//       listedStockDetails: this.ensureList(request.listedStockDetails),
//       nonListedStockDetails: this.ensureList(request.nonListedStockDetails),
//       realEstateDetails: this.ensureList(request.realEstateDetails),
//       quarter: request.quarter,
//       curryear1: request.curryear,
//     };
//     return this.http
//       .post<ApiResponse<unknown>>(INVESTMENT_API.insertStockRecord, body)
//       .pipe(map((res) => this.ensureSuccess(res)));
//   }
 
//  private ensureList(rows: string[]): string[] {
//     return rows.length ? rows : [''];
//   }


  getStockData(filter: HistoryFilter): Observable<SecuritiesHistoryRow[]> {
    return this.http
      .post<ApiResponse<string[][]>>(INVESTMENT_API.stockData, this.historyParams(filter))
      .pipe(map((res) => this.unwrap(res).map((row) => this.toSecuritiesHistory(row))));
  }

  getUnlistedData(filter: HistoryFilter): Observable<SecuritiesHistoryRow[]> {
    return this.http
      .post<ApiResponse<string[][]>>(INVESTMENT_API.unlistedData, this.historyParams(filter))
      .pipe(map((res) => this.unwrap(res).map((row) => this.toSecuritiesHistory(row))));
  }

  getRealData(filter: HistoryFilter): Observable<RealEstateHistoryRow[]> {
    return this.http
      .post<ApiResponse<string[][]>>(INVESTMENT_API.realData, this.historyParams(filter))
      .pipe(map((res) => this.unwrap(res).map((row) => this.toRealEstateHistory(row))));
  }

  cancelStockRecord(decryptTxnId: string, input: string, rowNumber: string): Observable<boolean> {
    const params = new HttpParams()
      .set('decryptTxnId', decryptTxnId)
      .set('input', input)
      .set('rowNumber', rowNumber);
    return this.http
      .post<ApiResponse<unknown>>(INVESTMENT_API.cancelStock, params)
      .pipe(map((res) => this.readUpdated(res)));
  }

  cancelUnlistRecord(decryptTxnId: string, input: string, rowNumber: string): Observable<boolean> {
    const params = new HttpParams()
      .set('decryptTxnId', decryptTxnId)
      .set('input', input)
      .set('rowNumber', rowNumber);
    return this.http
      .post<ApiResponse<unknown>>(INVESTMENT_API.cancelUnlisted, params)
      .pipe(map((res) => this.readUpdated(res)));
  }

  cancelRealRecord(decryptTxnId: string, input: string, viewRowNumberReal: string): Observable<boolean> {
    const params = new HttpParams()
      .set('decryptTxnId', decryptTxnId)
      .set('input', input)
      .set('viewRowNumberReal', viewRowNumberReal);
    return this.http
      .post<ApiResponse<unknown>>(INVESTMENT_API.cancelReal, params)
      .pipe(map((res) => this.readUpdated(res)));
  }

  /** Shared QUARTER / YEAR / STATUS params for the three history reads. */
  private historyParams(filter: HistoryFilter): HttpParams {
    return new HttpParams()
      .set('QUARTER', filter.quarter ?? '')
      .set('YEAR', filter.year != null ? String(filter.year) : '')
      .set('STATUS', filter.status ?? '');
  }

  // ---------------------------------------------------------------------------
  // Mapping / helpers
  // ---------------------------------------------------------------------------

  private toQuestion(row: RawQuestionRow): Question {
    const [id, text, type] = row;
    const formType = this.parseFormType(type);
    return { id: Number(id), apiId: id, key: this.keyForFormType(formType), text, formType };
  }

  /** "1)UNLISTED" / "2)STOCKINVESTMENT" / "3)REALESTATE" -> form type. */
  private parseFormType(type?: string): InvestmentFormType | null {
    const token = type?.split(')').pop()?.trim().toUpperCase();
    switch (token) {
      case 'UNLISTED':
        return InvestmentFormType.Unlisted;
      case 'STOCKINVESTMENT':
        return InvestmentFormType.Listed;
      case 'REALESTATE':
        return InvestmentFormType.RealEstate;
      default:
        return null;
    }
  }

  private keyForFormType(formType: InvestmentFormType | null): QuestionKey {
    switch (formType) {
      case InvestmentFormType.Unlisted:
        return QuestionKey.Unlisted;
      case InvestmentFormType.Listed:
        return QuestionKey.Listed;
      case InvestmentFormType.RealEstate:
        return QuestionKey.RealEstate;
      default:
        return QuestionKey.Transactions;
    }
  }

  // --- History row mapping -----------------------------------------------------
  // Rows arrive as string[] (array-of-arrays). Securities order is confirmed from
  // getUnlistedData/getStockData:
  //  0 TXNID | 1 owner | 2 direct/indirect | 3 relationship | 4 tranType |
  //  5 shares | 6 investee | 7 date | 8 rate | 9 prevPrice | 10 total |
  //  11 workedIn | 12 remarks | 13 status | 14 rowNumber

  private toSecuritiesHistory(row: string[]): SecuritiesHistoryRow {
    return {
      id: this.str(row[0]),
      ownerName: this.str(row[1]),
      dealingType: this.str(row[2]),
      relationship: this.str(row[3]),
      transactionType: this.str(row[4]),
      noOfShares: this.num(row[5]),
      investeeCompany: this.str(row[6]),
      transactionDate: this.str(row[7]),
      ratePerShare: this.num(row[8]),
      totalAmount: this.num(row[10]),
      status: this.mapStatus(row[13]),
      rowNumber: this.str(row[14]),
    };
  }

  // Real-estate SELECT order (0-based):
  //  0 TXNID | 1 owner | 2 direct/indirect | 3 relationship | 4 sale/purchase |
  //  5 propertyType | 6 society | 7 builtUpArea | 8 developedBy | 9 location |
  //  10 date | 11 pricePerFt | 12 total | 13 createdBy | 14 createdOn |
  //  15 modifiedBy | 16 modifiedOn | 17 quarter | 18 year | 19 remarks |
  //  20 status | 21 rowNumber | 22 marketPrice
  private toRealEstateHistory(row: string[]): RealEstateHistoryRow {
    return {
      id: this.str(row[0]),
      ownerName: this.str(row[1]),
      dealingType: this.str(row[2]),
      relationship: this.str(row[3]),
      transactionType: this.str(row[4]),
      propertyTypeMisc: this.str(row[5]),
      societyName: this.str(row[6]),
      builtUpArea: this.num(row[7]),
      developedBy: this.str(row[8]),
      locationState: this.str(row[9]),
      purchaseSaleDate: this.str(row[10]),
      pricePerSqFt: this.num(row[11]),
      totalAmount: this.num(row[12]),
      status: this.mapStatus(row[20]),
      rowNumber: this.str(row[21]),
    };
  }

  private mapStatus(value: string | undefined): HistoryStatus {
    return this.str(value).toUpperCase().startsWith('A') ? HistoryStatus.Active : HistoryStatus.Inactive;
  }

  /** String value; treats null / the literal "null" as empty. */
  private str(value: unknown): string {
    if (value == null) {
      return '';
    }
    const s = String(value);
    return s === 'null' ? '' : s;
  }

  private num(value: unknown): number | null {
    if (value == null || value === '' || value === 'null') {
      return null;
    }
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  }


  /** Take the single envelope from an array-wrapped or bare response. */
  private firstEnvelope(res: unknown): ApiEnvelope<unknown> | null {
    if (Array.isArray(res)) {
      return (res[0] as ApiEnvelope<unknown>) ?? null;
    }
    if (res && typeof res === 'object' && 'status' in res) {
      return res as ApiEnvelope<unknown>;
    }
    return null;
  }

  private unwrap<T>(res: ApiResponse<T>): T {
    const env = this.firstEnvelope(res);
    if (!env || env.status !== 'success') {
      throw new Error(env?.message ?? 'Request failed');
    }
    return env.data as T;
  }

  /**
   * For write endpoints (insert / cancel). The backend always returns
   * status 'success'; the real outcome is the boolean `data` flag
   * (true = saved/updated, false = rejected/not performed). A non-success
   * status is a genuine transport error and throws.
   */
  private readUpdated(res: ApiResponse<unknown>): boolean {
    const env = this.firstEnvelope(res);
    if (!env || env.status !== 'success') {
      throw new Error(env?.message ?? 'Request failed');
    }
    return env.data === true;
  }
}