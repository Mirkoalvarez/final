import { Component } from '@angular/core'; // Importa Component para definir el componente
import { CommonModule } from '@angular/common'; // Importa CommonModule para usar directivas comunes en la plantilla
import { RouterModule } from '@angular/router'; // Importa RouterModule para habilitar la navegación en la aplicación
import { AuthService } from '../core/services/auth.service'; // Importa el servicio de autenticación para gestionar la sesión del usuario

@Component({
  standalone: true, // Indica que este es un componente autónomo, no requiere un NgModule
  selector: 'app-home', // Selector CSS para usar este componente en plantillas HTML
  imports: [CommonModule, RouterModule], // Módulos que este componente necesita para funcionar
  templateUrl: './home.component.html', // Ruta al archivo HTML de la plantilla del componente
  styleUrl: './home.component.css' // Ruta al archivo CSS de estilos específicos del componente
})
export class HomeComponent {
  // Constructor que inyecta el servicio de autenticación
  constructor(private auth: AuthService) {}

  /**
   * Cierra la sesión del usuario llamando al método del servicio de autenticación.
   */
  cerrarSesion() {
    this.auth.cerrarSesion(); // Llama al método cerrarSesion del AuthService para cerrar la sesión
  }
}

/**
 * Notas adicionales:
 * 1. Este componente representa la página de inicio de la aplicación.
 * 2. El método cerrarSesion() se puede vincular a un botón en la plantilla para permitir al usuario cerrar sesión.
 * 3. Asegúrate de que la plantilla y los estilos estén correctamente configurados para una buena experiencia de usuario.
 */
