import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import localePt from '@angular/common/locales/pt';

import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';

// Necessario para o pipe `| currency:'BRL'` imprimir R$ 1.234,56
// em vez do formato americano R$1,234.56.
registerLocaleData(localePt);

/**
 * Configuracao raiz da aplicacao: o mais proximo de um web.xml que existe
 * neste mundo. E aqui que voce "liga" cada recurso do Angular.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    // Este projeto nao tem zone.js instalado. Sem este provider o Angular
    // nem sobe - e por isso que todo estado de componente e signal().
    provideZonelessChangeDetection(),

    provideRouter(routes),

    // Obrigatorio para injetar HttpClient. Sem ele: NG0201 em runtime.
    provideHttpClient(withFetch()),

    { provide: LOCALE_ID, useValue: 'pt-BR' },

    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          // Sem isto o PrimeNG segue o tema do sistema operacional e os
          // componentes ficam escuros sobre o fundo claro da pagina.
          darkModeSelector: false,
        },
      },
      ripple: true,
    }),
  ],
};
