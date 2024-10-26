import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideToastr } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';


export const appConfig: ApplicationConfig = {
  providers: [
     provideZoneChangeDetection({ eventCoalescing: true }),
     provideRouter(routes),
     provideToastr({
      positionClass: 'toast-top-right', 
      timeOut: 3000,                    
      closeButton: true,              
      progressBar: true,               
    }),  
     importProvidersFrom(BrowserAnimationsModule), provideAnimationsAsync()
  ]
};
