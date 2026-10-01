import { ComponentRef, Inject, Injectable, ViewContainerRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ConfirmDialogComponent } from '../../shared/shared-components/confirm-dialog/confirm-dialog.component'

@Injectable({
  providedIn: 'root'
})
export class CommonDialogService {
  private vcr!: ViewContainerRef;
  private openDialogCount = 0;
  private scrollY = 0;
  private previousBodyOverflow = '';
  private previousBodyPosition = '';
  private previousBodyTop = '';
  private previousBodyWidth = '';
  private historyLocked = false;
  private releasingHistoryLock = false;
  private readonly dialogHistoryStateKey = '__commonDialogOpen';

  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  setViewContainerRef(vcr: ViewContainerRef) {
    this.vcr = vcr;
  }

  confirm(message: string, title = 'CONFIRMATION'): Promise<boolean> {
    return new Promise(resolve => {
      const cmpRef = this.openDialog();
      cmpRef.instance.message = message;
      cmpRef.instance.title = title;
      cmpRef.instance.type = 'confirm';
      cmpRef.instance.closed.subscribe(async result => {
        cmpRef.destroy();
        await this.closeDialog();
        resolve(result === 'ok');
      });
    });
  }

  alert(message: string, title = 'ALERT'): Promise<void> {
    return new Promise(resolve => {
      const cmpRef = this.openDialog();
      cmpRef.instance.message = message;
      cmpRef.instance.title = title;
      cmpRef.instance.type = 'alert';
      cmpRef.instance.closed.subscribe(async () => {
        cmpRef.destroy();
        await this.closeDialog();
        resolve();
      });
    });
  }

  private openDialog(): ComponentRef<ConfirmDialogComponent> {
    if (this.openDialogCount === 0) {
      this.lockPage();
      this.lockBrowserBack();
    }

    this.openDialogCount += 1;
    return this.vcr.createComponent(ConfirmDialogComponent);
  }

  private async closeDialog(): Promise<void> {
    this.openDialogCount = Math.max(0, this.openDialogCount - 1);

    if (this.openDialogCount === 0) {
      this.unlockPage();
      await this.unlockBrowserBack();
    }
  }

  private lockPage(): void {
    const body = this.document.body;
    this.scrollY = window.scrollY || this.document.documentElement.scrollTop || 0;
    this.previousBodyOverflow = body.style.overflow;
    this.previousBodyPosition = body.style.position;
    this.previousBodyTop = body.style.top;
    this.previousBodyWidth = body.style.width;

    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${this.scrollY}px`;
    body.style.width = '100%';
  }

  private unlockPage(): void {
    const body = this.document.body;
    body.style.overflow = this.previousBodyOverflow;
    body.style.position = this.previousBodyPosition;
    body.style.top = this.previousBodyTop;
    body.style.width = this.previousBodyWidth;
    window.scrollTo(0, this.scrollY);
  }

  private lockBrowserBack(): void {
    if (this.historyLocked) {
      return;
    }

    this.historyLocked = true;
    window.history.pushState(
      { ...(window.history.state || {}), [this.dialogHistoryStateKey]: true },
      '',
      window.location.href,
    );
    window.addEventListener('popstate', this.onPopState);
  }

  private unlockBrowserBack(): Promise<void> {
    if (!this.historyLocked) {
      return Promise.resolve();
    }

    window.removeEventListener('popstate', this.onPopState);
    this.historyLocked = false;

    if (window.history.state?.[this.dialogHistoryStateKey]) {
      return new Promise(resolve => {
        let resolved = false;
        const finish = () => {
          if (resolved) {
            return;
          }
          resolved = true;
          this.releasingHistoryLock = false;
          window.removeEventListener('popstate', finish);
          resolve();
        };

        this.releasingHistoryLock = true;
        window.addEventListener('popstate', finish);
        window.history.back();
        window.setTimeout(finish, 100);
      });
    }

    return Promise.resolve();
  }

  private readonly onPopState = (): void => {
    if (this.releasingHistoryLock) {
      this.releasingHistoryLock = false;
      return;
    }

    if (this.openDialogCount > 0) {
      window.history.pushState(
        { ...(window.history.state || {}), [this.dialogHistoryStateKey]: true },
        '',
        window.location.href,
      );
    }
  };

}
