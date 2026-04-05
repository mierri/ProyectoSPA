import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideSpanishCalendarI18n, ThemeService } from './core';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideSpanishCalendarI18n(),
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [ThemeService],
      useFactory: (themeService: ThemeService) => () => themeService.initializeTheme()
    }
  ]
};
