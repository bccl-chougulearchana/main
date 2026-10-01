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
 * Presentational table for Unlisted investment history.
 * Same shape as Stock; only the title and investee-company label differ.
 */
@Component({
  selector: 'app-unlisted-history',
  standalone: true,
  imports: [CommonModule, CustomTableDirective],
  templateUrl: './unlisted-history.component.html',
  styleUrl: './unlisted-history.component.scss',
})
export class UnlistedHistoryComponent implements OnChanges {
  @Input() rows: SecuritiesHistoryRow[] = [];
  @Input() showActions = true;
  @Output() cancel = new EventEmitter<SecuritiesHistoryRow>();

  readonly title = 'Unlisted Investment Declaration';
  tableColumns: TableColumn[] = securitiesHistoryColumns('Name of Unlisted Investee Company');
  tableData: TableRow[] = [];
  private _init = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showActions'] || !this._init) {
      this.tableColumns = securitiesHistoryColumns('Name of Unlisted Investee Company', this.showActions);
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
