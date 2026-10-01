import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PopupService {
  private openPopupSource = new Subject<void>();
  openPopup$ = this.openPopupSource.asObservable();

  triggerPopup() {
    this.openPopupSource.next();
  }
}
