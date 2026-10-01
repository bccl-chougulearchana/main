import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomTableDirective } from '../../../shared/shared-directives/custom-table.directive'; 
import {
  securitiesHistoryColumns,
  formatTableDate,
} from '../../../core/constants/investment-declaration.constant';
import {
  SecuritiesHistoryRow,
  TableColumn,
  TableRow,
} from '../../../core/modals/investment-declaration.model';

/**
 * Presentational table for Stock (listed) investment history.
 * Receives rows from the History page; emits a cancel event by record id.
 */
@Component({
  selector: 'app-stock-history',
  standalone: true,
  imports: [CommonModule, CustomTableDirective],
  templateUrl: './stock-history.component.html',
  styleUrl: './stock-history.component.scss',
})
export class StockHistoryComponent implements OnChanges {
  @Input() rows: SecuritiesHistoryRow[] = [];
  @Input() showActions = true;
  @Output() cancel = new EventEmitter<SecuritiesHistoryRow>();

  readonly title = 'Stock Investment Declaration';
  tableColumns: TableColumn[] = securitiesHistoryColumns('Name of Listed Investee Company');
  tableData: TableRow[] = [];
  private _init = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showActions'] || !this._init) {
      this.tableColumns = securitiesHistoryColumns('Name of Listed Investee Company', this.showActions);
      this._init = true;
    }
    const mapped: TableRow[] = (this.rows ?? []).map((row, index) => {
      const cells: TableRow = {
        srNo: index + 1,
        ownerName: row.ownerName,
        dealingType: row.dealingType,
        relationship: row.relationship,
        transactionType: row.transactionType,
        noOfShares: row.noOfShares,
        investeeCompany: row.investeeCompany,
        transactionDate: formatTableDate(row.transactionDate),
        ratePerShare: row.ratePerShare,
        totalAmount: row.totalAmount,
      };
      if (this.showActions) {
        cells['actions'] = [
          {
            label: 'Cancel',
            tooltip: 'Cancel this declaration',
            callback: () => this.cancel.emit(row),
          },
        ];
      }
      return cells;
    });
    this.tableData = mapped;
  }
}