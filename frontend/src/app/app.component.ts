import { Component } from '@angular/core'; // Importa Component para definir el componente
import { CommonModule } from '@angular/common'; // Importa CommonModule para usar directivas comunes en la plantilla
import { RouterModule } from '@angular/router'; // Importa RouterModule para la navegación
import { AuthService } from './core/services/auth.service'; // Importa el servicio de autenticación

@Component({
  standalone: true, // Indica que este es un componente autónomo, no requiere un NgModule
  selector: 'app-root', // Selector CSS para usar este componente en plantillas HTML
  imports: [CommonModule, RouterModule], // Módulos que este componente necesita para funcionar
  templateUrl: './app.component.html', // Ruta al archivo HTML de la plantilla del componente
  styleUrls: ['./app.component.css'] // Ruta al archivo CSS de estilos específicos del componente
})
export class AppComponent {
  constructor(public auth: AuthService) {} // Inyecta el servicio de autenticación

  /**
   * Verifica si el usuario actual tiene el rol de administrador.
   * @returns true si el usuario es administrador, false en caso contrario
   */
  esAdmin(): boolean {
    return this.auth.obtenerRol() === 'admin'; // Compara el rol del usuario actual con 'admin'
  }
}

/**
 * Notas adicionales:
 * 1. Este componente es la raíz de la aplicación y maneja la autenticación del usuario.
 * 2. Asegúrate de que el servicio de autenticación esté correctamente configurado para obtener el rol del usuario.
 * 3. El método esAdmin() se puede utilizar en la plantilla para mostrar u ocultar elementos basados en el rol del usuario.
 */
