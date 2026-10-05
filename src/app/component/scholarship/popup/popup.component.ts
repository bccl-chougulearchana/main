import { Component, OnDestroy, OnInit } from '@angular/core';
import { PopupService } from '../../../services/scholarship/shared/popup.service';
import { Subscription } from 'rxjs';
declare const bootstrap: any;
@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [],
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.scss'
})

export class PopupComponent implements OnInit, OnDestroy {

  private popupSub!: Subscription;

  constructor(private popupService: PopupService) {}

  ngOnInit(): void {

    /* OPEN MODAL */
    this.popupSub = this.popupService.openPopup$.subscribe(() => {
      const modal = document.getElementById('infoModal');
      if (modal) {
        modal.classList.add('show');
      }
    });

    /* CLOSE: close button & backdrop */
    document.addEventListener('click', this.handleClose);

    /* CLOSE: ESC key */
    document.addEventListener('keydown', this.handleEsc);
  }

  ngOnDestroy(): void {
    this.popupSub?.unsubscribe();
    document.removeEventListener('click', this.handleClose);
    document.removeEventListener('keydown', this.handleEsc);
  }



  handleClose = (event: any) => {
    const modal = document.getElementById('infoModal');

    if (!modal) return;

    // Close button
    if (event.target?.classList.contains('btn-close')) {
      modal.classList.remove('show');
    }

    // Backdrop click
    if (event.target === modal) {
      modal.classList.remove('show');
    }
  };

  handleEsc = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      document.getElementById('infoModal')?.classList.remove('show');
    }
  };
}