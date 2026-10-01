import {
  Directive,
  ElementRef,
  Input,
  NgZone,
  Renderer2,
  OnChanges,
  DoCheck,
  OnDestroy,
  SimpleChanges
} from '@angular/core';

interface TableColumn {
  key: string;
  label: string;
  isAction?: boolean;
  isLink?: boolean;
  actions?: TableAction[];
}

interface TableAction {
  label?: string;
  icon?: string;
  callback: (row: any) => void;
  tooltip?: string;
  className?: string;
}

@Directive({
  selector: '[libCustomTableNU]',
  standalone: true
})
export class CustomTableDirective implements OnChanges, DoCheck, OnDestroy {

  @Input('libCustomTableNU') data: any[] = [];
  @Input() columns: TableColumn[] = [];

  private listeners: (() => void)[] = [];
  private building = false;
  // Coalesces multiple input changes in the same CD pass into ONE build,
  // and defers it out of change detection so the DOM mutation can't re-enter.
  private buildScheduled = false;
  private destroyed = false;
  private dataSignature = '';

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private zone: NgZone
  ) {}

  /* ---------------- CHANGE HANDLING ---------------- */

  ngOnChanges(changes: SimpleChanges): void {
    const dataChanged =
      changes['data'] &&
      changes['data'].currentValue !== changes['data'].previousValue;

    const columnsChanged =
      changes['columns'] &&
      changes['columns'].currentValue !== changes['columns'].previousValue;

    if (dataChanged || columnsChanged) {
      this.dataSignature = this.createDataSignature();
      this.scheduleBuild();
    }
  }

  ngDoCheck(): void {
    const nextSignature = this.createDataSignature();
    if (nextSignature !== this.dataSignature) {
      this.dataSignature = nextSignature;
      this.scheduleBuild();
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.cleanupListeners();
  }

  /* ---------------- BUILD SCHEDULING ---------------- */

  /**
   * Schedule a single rebuild, run OUTSIDE the Angular zone. Building the table
   * is pure DOM work (Renderer2) that Angular doesn't need to know about; doing
   * it in-zone made every build trigger an app-wide change-detection tick, which
   * in turn made form-control directives (e.g. custom selects) re-emit their
   * valueChanges — feeding a re-render/search loop that froze the page. Running
   * outside the zone breaks that cycle. Click handlers re-enter the zone so
   * Angular still reacts to them (see buildTable).
   */
  private scheduleBuild(): void {
    if (this.buildScheduled) return;
    this.buildScheduled = true;
    this.zone.runOutsideAngular(() => {
      Promise.resolve().then(() => {
        this.buildScheduled = false;
        if (!this.destroyed) {
          this.buildTable();
        }
      });
    });
  }

  /* ---------------- TABLE BUILD ---------------- */

  private buildTable(): void {
    if (this.building) return;
    this.building = true;

    try {
      const host = this.el.nativeElement;
      const rows = Array.isArray(this.data) ? [...this.data] : [];
      const columns = Array.isArray(this.columns) ? [...this.columns] : [];

      // cleanup listeners first
      this.cleanupListeners();

      // clear DOM safely
      while (host.firstChild) {
        this.renderer.removeChild(host, host.firstChild);
      }

      if (rows.length === 0 || columns.length === 0) return;

      const wrapper = this.renderer.createElement('div');
      this.renderer.setStyle(wrapper, 'overflowX', 'auto');
      this.renderer.setStyle(wrapper, 'width', '100%');

      const table = this.renderer.createElement('table');
      this.renderer.setStyle(table, 'width', '100%');
      this.renderer.setStyle(table, 'borderCollapse', 'collapse');
      this.renderer.setStyle(table, 'fontFamily', 'Open Sans, sans-serif');
      this.renderer.setStyle(table, 'fontSize', '14px');
      this.renderer.setStyle(table, 'minWidth', '600px');

      /* ---------- HEADER ---------- */

      const thead = this.renderer.createElement('thead');
      const headerRow = this.renderer.createElement('tr');

      columns.forEach(col => {
        const th = this.renderer.createElement('th');
        this.renderer.setStyle(th, 'padding', '10px');
        this.renderer.setStyle(th, 'borderBottom', '1px solid #ccc');
        this.renderer.setStyle(th, 'textAlign', 'left');
        this.renderer.setStyle(th, 'whiteSpace', 'nowrap');
        this.renderer.appendChild(th, this.renderer.createText(col.label));
        this.renderer.appendChild(headerRow, th);
      });

      this.renderer.appendChild(thead, headerRow);
      this.renderer.appendChild(table, thead);

      /* ---------- BODY ---------- */

      const tbody = this.renderer.createElement('tbody');

      rows.forEach(row => {
        const tr = this.renderer.createElement('tr');

        columns.forEach(col => {
          const td = this.renderer.createElement('td');
          this.renderer.setStyle(td, 'padding', '10px');
          this.renderer.setStyle(td, 'borderBottom', '1px solid #eee');
          this.renderer.setStyle(td, 'whiteSpace', 'nowrap');

          /* ----- ACTION COLUMN ----- */
          if (col.isAction) {
            const actionWrapper = this.renderer.createElement('div');
            this.renderer.setStyle(actionWrapper, 'display', 'flex');
            this.renderer.setStyle(actionWrapper, 'gap', '6px');

            const actions = row?.[col.key];
            if (Array.isArray(actions)) {
              actions.forEach(action => {
                if (!action || typeof action.callback !== 'function') {
                  return;
                }
                const btn = this.renderer.createElement('button');
                this.renderer.setAttribute(btn, 'type', 'button');
                this.renderer.setStyle(btn, 'padding', '5px 10px');
                this.renderer.setStyle(btn, 'border', 'none');
                this.renderer.setStyle(btn, 'borderRadius', '4px');
                this.renderer.setStyle(btn, 'cursor', 'pointer');
                this.renderer.setStyle(btn, 'color', '#fff');
                this.renderer.setStyle(btn, 'backgroundColor', '#00bfff');
                this.renderer.setStyle(btn, 'display', 'flex');
                this.renderer.setStyle(btn, 'alignItems', 'center');
                this.renderer.setStyle(btn, 'gap', '4px');

                if (action.className) {
                  this.renderer.setAttribute(btn, 'class', action.className);
                }
                if (action.tooltip) {
                  this.renderer.setAttribute(btn, 'title', action.tooltip);
                }
                if (action.icon) {
                  this.renderer.appendChild(
                    btn,
                    this.renderer.createText(action.icon)
                  );
                }
                if (action.label) {
                  this.renderer.appendChild(
                    btn,
                    this.renderer.createText(action.label)
                  );
                }

                // Re-enter the Angular zone on click so change detection runs.
                this.listeners.push(
                  this.renderer.listen(btn, 'click', () =>
                    this.zone.run(() => action.callback(row))
                  )
                );

                this.renderer.appendChild(actionWrapper, btn);
              });
            }

            this.renderer.appendChild(td, actionWrapper);
          }

          /* ----- LINK COLUMN ----- */
          else if (col.isLink && row?.[col.key]?.label) {
            const link = this.renderer.createElement('span');
            this.renderer.setStyle(link, 'color', '#1976d2');
            this.renderer.setStyle(link, 'cursor', 'pointer');
            this.renderer.setStyle(link, 'textDecoration', 'underline');

            this.renderer.appendChild(
              link,
              this.renderer.createText(row[col.key].label)
            );

            if (typeof row[col.key].callback === 'function') {
              this.listeners.push(
                this.renderer.listen(link, 'click', () =>
                  this.zone.run(() => row[col.key].callback(row))
                )
              );
            }

            this.renderer.appendChild(td, link);
          }

          /* ----- NORMAL CELL ----- */
          else {
            this.renderer.appendChild(
              td,
              this.renderer.createText(this.toDisplayText(row?.[col.key]))
            );
          }

          this.renderer.appendChild(tr, td);
        });

        this.renderer.appendChild(tbody, tr);
      });

      this.renderer.appendChild(table, tbody);
      this.renderer.appendChild(wrapper, table);
      this.renderer.appendChild(host, wrapper);

    } finally {
      this.building = false;
    }
  }

  /* ---------------- CLEANUP ---------------- */

  private cleanupListeners(): void {
    this.listeners.forEach(off => off());
    this.listeners = [];
  }

  private createDataSignature(): string {
    if (!Array.isArray(this.data)) {
      return 'no-data';
    }

    return JSON.stringify(
      this.data.map((row) => {
        if (!row || typeof row !== 'object') {
          return row;
        }

        return Object.keys(row)
          .sort()
          .reduce<Record<string, unknown>>((acc, key) => {
            const value = row[key];
            if (Array.isArray(value)) {
              acc[key] = value.map((item) => ({
                icon: item?.icon,
                label: item?.label,
                tooltip: item?.tooltip,
                className: item?.className,
              }));
            } else if (value && typeof value === 'object') {
              acc[key] = {
                label: value.label,
                tooltip: value.tooltip,
              };
            } else {
              acc[key] = value;
            }
            return acc;
          }, {});
      })
    );
  }

  private toDisplayText(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    return '';
  }
}
