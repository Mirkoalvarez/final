import { ApplicationConfig } from '@angular/core'; // Importa ApplicationConfig para configurar la aplicación
import { provideRouter } from '@angular/router'; // Importa provideRouter para configurar el enrutador
import { routes } from './app.routes'; // Importa las rutas definidas en app.routes
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http'; // Importa funciones y constantes para configurar el cliente HTTP
import { importProvidersFrom } from '@angular/core'; // Importa importProvidersFrom para importar módulos
import { FormsModule } from '@angular/forms'; // Importa FormsModule para manejar formularios
import { AuthInterceptor } from './core/interceptors/auth.interceptor'; // Importa el interceptor de autenticación

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), // Proporciona el enrutador con las rutas definidas
    provideHttpClient(withInterceptorsFromDi()), // Configura provideHttpClient para usar interceptores basados en inyección de dependencias
    importProvidersFrom(FormsModule), // Importa el módulo de formularios
    // Registrar el interceptor de autenticación
    {
      provide: HTTP_INTERCEPTORS, // Proporciona el token para los interceptores HTTP
      useClass: AuthInterceptor, // Usa la clase AuthInterceptor
      multi: true // Importante: permite múltiples interceptores
    }
  ]
};

/**
 * Notas adicionales:
 * 1. Esta configuración es esencial para establecer el enrutamiento y el manejo de solicitudes HTTP en la aplicación.
 * 2. Asegúrate de que el interceptor de autenticación esté correctamente implementado para manejar la autenticación en las solicitudes.
 * 3. La opción 'multi: true' permite que se puedan registrar múltiples interceptores, lo que es útil para manejar diferentes aspectos de las solicitudes HTTP.
 */
