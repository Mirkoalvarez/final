// src/app/core/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core'; // Importa Injectable para poder inyectar este interceptor como un servicio
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpErrorResponse
} from '@angular/common/http'; // Importa las interfaces necesarias para manejar solicitudes HTTP
import { Observable, throwError } from 'rxjs'; // Importa Observable y throwError para manejar flujos de datos y errores
import { catchError } from 'rxjs/operators'; // Importa catchError para manejar errores en flujos de datos
import { AuthService } from '../services/auth.service'; // Importa el servicio de autenticación para acceder al token
import { Router } from '@angular/router'; // Importa Router para redirigir al usuario

@Injectable() // Marca la clase como un servicio inyectable
export class AuthInterceptor implements HttpInterceptor {

    // Constructor que inyecta AuthService y Router
    constructor(private authService: AuthService, private router: Router) {}

    /**
     * Intercepta las solicitudes HTTP para añadir el token de autenticación
     * y manejar errores de autenticación.
     * @param request - La solicitud HTTP que se va a interceptar
     * @param next - El siguiente manejador en la cadena de interceptores
     * @returns Un Observable que emite el evento de la solicitud HTTP
     */
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Clona la solicitud para añadir el token si existe
        const token = this.authService.obtenerToken(); // Obtiene el token de autenticación
        if (token) {
            // Si hay un token, lo añade a los encabezados de la solicitud
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}` // Establece el encabezado de autorización
                }
            });
        }

        // Maneja la respuesta de la solicitud
        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                // Si el error es 401 (Unauthorized) y no es la ruta de login/autenticación
                // (para evitar bucles infinitos si el login falla con 401)
                if (error.status === 401 && !request.url.includes('/autenticar.php')) {
                    console.warn('Token expirado o inválido. Cerrando sesión...'); // Mensaje de advertencia en la consola
                    this.authService.cerrarSesion(); // Llama al método para limpiar el token y redirigir
                    // Opcional: Puedes mostrar un mensaje al usuario
                    alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.'); // Alerta al usuario
                }
                return throwError(() => error); // Re-lanza el error para que el componente lo maneje si es necesario
            })
        );
    }
}

/**
 * Notas adicionales:
 * 1. Este interceptor se debe registrar en el módulo principal para que Angular lo use en todas las solicitudes HTTP.
 * 2. Asegúrate de que el AuthService tenga métodos para obtener el token y cerrar sesión.
 * 3. Este interceptor ayuda a manejar la autenticación de manera centralizada y a mejorar la experiencia del usuario.
 */
