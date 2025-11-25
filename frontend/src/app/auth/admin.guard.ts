import { inject } from '@angular/core'; // Importa la función inject para inyectar dependencias en funciones.
import { CanActivateFn, Router } from '@angular/router'; // Importa CanActivateFn para definir guardias de ruta y Router para la navegación.
import { AuthService } from '../core/services/auth.service'; // Importa el servicio de autenticación para manejar la lógica de autenticación.

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService); // Inyecta el servicio de autenticación para acceder a sus métodos.
  const router = inject(Router); // Inyecta el Router para permitir la navegación programática.

  const token = auth.obtenerToken(); // Obtiene el token de autenticación del servicio.

  // Verifica si el token no existe.
  if (!token) {
    router.navigate(['/login']); // Redirige al usuario a la página de login si no hay token.
    return false; // Deniega el acceso.
  }

  try {
    // Decodifica el token para obtener el payload (carga útil).
    const payload = JSON.parse(atob(token.split('.')[1]));

    // Verifica si el rol del usuario es 'admin'.
    if (payload.rol === 'admin') {
      return true; // Permite el acceso si el rol es 'admin'.
    } else {
      router.navigate(['/home']); // Redirige a la página de inicio si el rol no es 'admin'.
      return false; // Deniega el acceso.
    }
  } catch (e) {
    // Maneja errores en caso de que el token sea inválido.
    console.error('Token inválido:', e); // Muestra un mensaje de error en la consola.
    router.navigate(['/login']); // Redirige al usuario a la página de login.
    return false; // Deniega el acceso.
  }
};
