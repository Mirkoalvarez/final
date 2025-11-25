// can-create-publication.guard.ts
import { inject } from '@angular/core'; // Importación para la inyección de dependencias en funciones
import { CanActivateFn, Router } from '@angular/router'; // Importación para el guard de ruta y navegación
import { AuthService } from '../core/services/auth.service'; // Importación del servicio de autenticación

/**
 * Guard que verifica si el usuario puede crear una publicación
 * Permite el acceso solo si el usuario está autenticado
 */
export const canCreatePublicationGuard: CanActivateFn = () => {
    const auth = inject(AuthService); // Inyecta el servicio de autenticación

    // Verifica si el usuario está autenticado
    if (auth.estaAutenticado()) {
        return true; // Permite el acceso si está autenticado
    } else {
        // Opcional: redirigir a una página de acceso denegado o al home
        // Aquí se puede agregar lógica para redirigir a una página específica
        // router.navigate(['/acceso-denegado']); // Descomentar para redirigir a una página de acceso denegado
        return false; // Niega el acceso si no está autenticado
    }
};

/**
 * Notas adicionales:
 * 1. Este guard se puede usar en las rutas del RouterModule para proteger la creación de publicaciones.
 * 2. Ejemplo de uso en rutas:
 *    { path: 'crear-publicacion', component: CrearPublicacionComponent, canActivate: [canCreatePublicationGuard] }
 * 3. La función estaAutenticado() del AuthService debe implementar la lógica
 *    para verificar si existe una sesión activa (ej. validar token en localStorage).
 */
