// /login/login.component.ts

import { Component, Inject, PLATFORM_ID } from '@angular/core'; // Importa Component, Inject y PLATFORM_ID para la creación del componente
import { CommonModule, ViewportScroller, isPlatformBrowser } from '@angular/common'; // Importa módulos comunes y herramientas para el desplazamiento y verificación de plataforma
import { FormsModule } from '@angular/forms'; // Importa FormsModule para manejar formularios
import { AuthService } from '../../core/services/auth.service'; // Importa el servicio de autenticación
import { Router, RouterModule } from '@angular/router'; // Importa Router para la navegación

// Define el componente de inicio de sesión
@Component({
  standalone: true, // Indica que el componente es "standalone" (autónomo)
  selector: 'app-login', // Selector CSS para usar este componente
  imports: [CommonModule, FormsModule, RouterModule], // Módulos que este componente utiliza
  templateUrl: './login.component.html', // Ruta al archivo HTML de la plantilla
  styleUrls: ['./login.component.css'] // Ruta al archivo CSS de estilos
})
export class LoginComponent {
  email = ''; // Almacena el email ingresado por el usuario
  clave = ''; // Almacena la clave ingresada por el usuario
  error: string | null = null; // Almacena mensajes de error
  mostrarClave = false; // Controla la visibilidad de la clave

  // Constructor del componente, inyecta servicios necesarios
  constructor(
    private auth: AuthService, // Servicio para autenticación
    private router: Router, // Servicio para la navegación
    private scroller: ViewportScroller, // Servicio para el desplazamiento de la vista
    @Inject(PLATFORM_ID) private platformId: Object // Inyección para verificar si estamos en el navegador
  ) {}

  // Devuelve el tipo de input para la clave (texto o contraseña)
  tipoInputClave(): string {
    return this.mostrarClave ? 'text' : 'password'; // Si mostrarClave es verdadero, devuelve 'text', de lo contrario 'password'
  }

  // Método para iniciar sesión
  iniciarSesion() {
    // Llama al método de login del servicio de autenticación
    this.auth.login(this.email, this.clave).subscribe({
      next: (res: any) => {
        this.auth.guardarToken(res.token); // Guarda el token recibido en el almacenamiento
        this.router.navigate(['/home']); // Navega a la ruta de inicio después del login
      },
      error: () => {
        this.error = 'Email o clave incorrectos'; // Muestra un mensaje de error si las credenciales son incorrectas
      }
    });
  }

  // Función para el desplazamiento suave hacia el formulario de inicio de sesión
  scrollToLoginForm(): void {
    // Desplazamiento manual si ViewportScroller está disponible
    const element = document.getElementById('login-form'); // Busca el elemento con ID 'login-form'
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' }); // Desplaza suavemente hacia el elemento
    } else {
      console.warn('Elemento con ID "login-form" no encontrado para el scroll.'); // Muestra advertencia si el elemento no se encuentra
    }
  }
}
