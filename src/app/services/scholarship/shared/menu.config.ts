import { BehaviorSubject } from 'rxjs';
import { PopupService } from './popup.service';

export interface MenuItem {
  label: string;
  route?: string;
  icon?: string;
  tooltip?: string;
  onClick?: () => void;
  children?: MenuItem[];
}

let popupServiceRef: PopupService | null = null;

const menuSubject = new BehaviorSubject<MenuItem[] | null>(null);
export const menu$ = menuSubject.asObservable();

let isProcessor = false;

export function setPopupService(service: PopupService) {
  if (popupServiceRef) return; 
  popupServiceRef = service;
}


export function setProcessorRole(value: boolean) {
  if (isProcessor === value) {
    return; 
  }

  isProcessor = value;
  emitMenu();
}

export function emitMenu() {
  menuSubject.next(buildMenu());
}
export function initMenu() {
  emitMenu();
}
function buildMenu(): MenuItem[] {
  const menu: MenuItem[] = [
    { label: 'NEW SCHOLARSHIP', route: '/portal/scholarship/new-scholarship' },
    { label: 'CHECK STATUS', route: '/portal/scholarship/check-status' }
  ];

  if (isProcessor) {
    menu.push(
      { label: 'PROCESS', route: '/portal/scholarship/process' },
      { label: 'VIEW SHORTLISTED', route: '/portal/scholarship/view-short-list' }
    );
  }

  menu.push({
    label: '',
    icon: 'ℹ️',
    tooltip: 'Additional Info',
    onClick: () => popupServiceRef?.triggerPopup()
  });

  return menu;
}
