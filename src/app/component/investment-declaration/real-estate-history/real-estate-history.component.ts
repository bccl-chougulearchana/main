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
  realEstateHistoryColumns,
  formatTableDate,
} from '../../../core/constants/investment-declaration.constant';
import {
  RealEstateHistoryRow,
  TableColumn,
  TableRow,
} from '../../../core/modals/investment-declaration.model';

/**
 * Presentational table for Real Estate investment history.
 */
@Component({
  selector: 'app-real-estate-history',
  standalone: true,
  imports: [CommonModule, CustomTableDirective],
  templateUrl: './real-estate-history.component.html',
  styleUrl: './real-estate-history.component.scss',
})
export class RealEstateHistoryComponent implements OnChanges {
  @Input() rows: RealEstateHistoryRow[] = [];
  @Input() showActions = true;
  @Output() cancel = new EventEmitter<RealEstateHistoryRow>();

  readonly title = 'Real Estate Investment Declaration';
  tableColumns: TableColumn[] = realEstateHistoryColumns();
  tableData: TableRow[] = [];
  private _init = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showActions'] || !this._init) {
      this.tableColumns = realEstateHistoryColumns(this.showActions);
      this._init = true;
    }
    const mapped: TableRow[] = (this.rows ?? []).map((row, index) => {
      const cells: TableRow = {
        srNo: index + 1,
        ownerName: row.ownerName,
        dealingType: row.dealingType,
        relationship: row.relationship,
        transactionType: row.transactionType,
        propertyTypeMisc: row.propertyTypeMisc,
        societyName: row.societyName,
        builtUpArea: row.builtUpArea,
        developedBy: row.developedBy,
        locationState: row.locationState,
        purchaseSaleDate: formatTableDate(row.purchaseSaleDate),
        pricePerSqFt: row.pricePerSqFt,
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
