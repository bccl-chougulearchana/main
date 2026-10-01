import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination-controls',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination-controls.component.html',
  styleUrl: './pagination-controls.component.scss'
})
export class PaginationControlsComponent {
  @Input() totalItems = 0;
  @Input() pageSize = 6;
  @Input() currentPage = 1;
  @Input() label = 'items';
  @Input() maxVisiblePages = 5;

  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / Math.max(1, this.pageSize)));
  }

  get safeCurrentPage(): number {
    return Math.min(Math.max(1, this.currentPage), this.totalPages);
  }

  get startItem(): number {
    if (this.totalItems === 0) {
      return 0;
    }

    return ((this.safeCurrentPage - 1) * this.pageSize) + 1;
  }

  get endItem(): number {
    return Math.min(this.safeCurrentPage * this.pageSize, this.totalItems);
  }

  get pageNumbers(): number[] {
    const visibleCount = Math.min(Math.max(1, this.maxVisiblePages), this.totalPages);
    const half = Math.floor(visibleCount / 2);
    let start = Math.max(1, this.safeCurrentPage - half);
    const endOverflow = start + visibleCount - 1 - this.totalPages;

    if (endOverflow > 0) {
      start = Math.max(1, start - endOverflow);
    }

    return Array.from({ length: visibleCount }, (_, index) => start + index);
  }

  selectPage(page: number): void {
    const nextPage = Math.min(Math.max(1, page), this.totalPages);

    if (nextPage === this.safeCurrentPage) {
      return;
    }

    this.pageChange.emit(nextPage);
  }
}
