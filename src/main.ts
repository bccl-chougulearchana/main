import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

/**
 * Timescape NU
 *
 * Author: Sahil Kengar
 * created DEC-2025
 * Role: Angular Developer
 */

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
