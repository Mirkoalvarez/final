import { inject } from '@angular/core'; // Importación para la inyección de dependencias en funciones
import { CanActivateFn, Router } from '@angular/router'; // Importación para el guard de ruta y navegación
import { AuthService } from '../core/services/auth.service'; // Importación del servicio de autenticación

/**
 * Guard de autenticación que protege rutas
 * Verifica si el usuario está autenticado antes de permitir el acceso
 */
export const authGuard: CanActivateFn = () => {
  // Inyectamos las dependencias necesarias
  const auth = inject(AuthService);  // Servicio para manejar la autenticación
  const router = inject(Router);     // Servicio para navegación programática

  // Verificamos el estado de autenticación
  if (auth.estaAutenticado()) {
    return true;  // Permite el acceso si está autenticado
  } else {
    router.navigate(['/login']);  // Redirige al login si no está autenticado
    return false; // Niega el acceso
  }
};

/**
 * Explicación adicional:
 * 1. Este guard se puede usar en las rutas del RouterModule para protegerlas
 * 2. Ejemplo de uso en rutas:
 *    { path: 'ruta-protegida', component: MiComponente, canActivate: [authGuard] }
 * 3. La función estaAutenticado() del AuthService debe implementar la lógica
 *    para verificar si existe una sesión activa (ej. validar token en localStorage)
 */
