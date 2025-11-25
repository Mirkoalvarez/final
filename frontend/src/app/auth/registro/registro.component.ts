// registro/registro.ts

import { Component, Inject, PLATFORM_ID } from '@angular/core'; // Importa Component, Inject y PLATFORM_ID para la creación del componente y la inyección de dependencias.
import { CommonModule, ViewportScroller, isPlatformBrowser } from '@angular/common'; // Importa CommonModule para directivas comunes, ViewportScroller para el desplazamiento de la vista, y isPlatformBrowser para verificar el entorno de ejecución.
import { FormsModule } from '@angular/forms'; // Importa FormsModule para habilitar el two-way data binding en formularios.
import { AuthService } from '../../core/services/auth.service'; // Importa el servicio de autenticación para manejar el registro de usuarios.
import { Router, RouterModule } from '@angular/router'; // Importa Router para la navegación y RouterModule para las directivas de enrutamiento.

// Decorador @Component que define las propiedades del componente.
@Component({
  standalone: true, // Indica que este es un componente autónomo, no requiere un NgModule.
  selector: 'app-registro', // Selector CSS para usar este componente en plantillas HTML.
  imports: [CommonModule, FormsModule, RouterModule], // Módulos que este componente necesita para funcionar.
  templateUrl: './registro.component.html', // Ruta al archivo HTML de la plantilla del componente.
  styleUrl: './registro.component.css' // Ruta al archivo CSS de estilos específicos del componente.
})

// Clase del componente RegistroComponent.
export class RegistroComponent {
  // Propiedades del componente para almacenar los datos del formulario y mensajes.
  nombre = ''; // Almacena el nombre ingresado por el usuario.
  email = ''; // Almacena el email ingresado por el usuario.
  clave = ''; // Almacena la clave ingresada por el usuario.
  mensaje = ''; // Almacena mensajes de éxito para el usuario.
  error = ''; // Almacena mensajes de error para el usuario.

  repetirClave: string = ''; // Almacena la confirmación de la clave.
  mostrarClave = false; // Controla la visibilidad del campo de clave.
  mostrarRepetirClave = false; // Controla la visibilidad del campo de repetir clave.

  // Constructor del componente, inyecta los servicios necesarios.
  constructor(
    private auth: AuthService, // Inyecta AuthService para manejar la lógica de autenticación.
    private router: Router, // Inyecta Router para la navegación programática.
    private scroller: ViewportScroller, // Inyecta ViewportScroller para controlar el desplazamiento de la vista.
    @Inject(PLATFORM_ID) private platformId: Object // Inyecta PLATFORM_ID para determinar si la aplicación se ejecuta en un navegador.
  ) {}

  /**
   * Determina el tipo de input para el campo de clave.
   * @returns 'text' si mostrarClave es verdadero, de lo contrario 'password'.
   */
  tipoInputClave(): string {
    return this.mostrarClave ? 'text' : 'password';
  }

  /**
   * Determina el tipo de input para el campo de repetir clave.
   * @returns 'text' si mostrarRepetirClave es verdadero, de lo contrario 'password'.
   */
  tipoInputRepetir(): string {
    return this.mostrarRepetirClave ? 'text' : 'password';
  }

  // ------> VALIDACIONES <------
  /**
   * Valida el formato del email.
   * @returns true si el email es válido, false en caso contrario.
   */
  emailValido(): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/; // Expresión regular para validar el formato del email.
    return regex.test(this.email); // Comprueba si el email coincide con la expresión regular.
  }

  /**
   * Valida la seguridad de la contraseña.
   * Requiere al menos 6 caracteres, una mayúscula, una minúscula y un número.
   * @returns true si la contraseña es segura, false en caso contrario.
   */
  contrasenaSegura(): boolean {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/; // Expresión regular para validar la seguridad de la contraseña.
    return regex.test(this.clave); // Comprueba si la clave cumple con los requisitos de seguridad.
  }

  /**
   * Comprueba si las contraseñas ingresadas coinciden.
   * @returns true si la clave y repetirClave son idénticas, false en caso contrario.
   */
  contrasenasCoinciden(): boolean {
    return this.clave === this.repetirClave; // Compara los valores de clave y repetirClave.
  }

  /**
   * Valida el formato del nombre.
   * Permite letras, espacios, apóstrofes, guiones y tildes, con una longitud entre 2 y 50 caracteres.
   * @returns true si el nombre es válido, false en caso contrario.
   */
  nombreValido(): boolean {
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.'-]{2,50}$/.test(this.nombre.trim()); // Comprueba si el nombre coincide con la expresión regular.
  }

 // ------> FUN REGISTRARSE <------
  /**
   * Maneja el proceso de registro de un nuevo usuario.
   * Realiza validaciones y llama al servicio de autenticación.
   */
  registrarse() {
    this.mensaje = ''; // Limpia cualquier mensaje de éxito anterior.
    this.error = ''; // Limpia cualquier mensaje de error anterior.

    // Verifica si las contraseñas coinciden antes de proceder.
    if (!this.contrasenasCoinciden()) {
      alert('Las contraseñas no coinciden'); // Muestra una alerta si no coinciden.
      return; // Detiene la ejecución de la función.
    }

    // Llama al método de registro del AuthService.
    this.auth.registro(this.nombre, this.email, this.clave).subscribe({
      next: () => {
        this.mensaje = 'Usuario registrado. Redirigiendo...'; // Establece un mensaje de éxito.
        // Redirige al usuario a la página de login después de 2 segundos.
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        // Maneja el error, mostrando un mensaje específico del servidor o uno genérico.
        this.error = err.error?.error || 'Error al registrarse';
      }
    });
  }

  /**
   * Desplaza la vista suavemente hacia el formulario de registro.
   */
  scrollToRegistroForm(): void {
    const element = document.getElementById('registro-form'); // Obtiene el elemento del formulario por su ID.
    if (element) {
      // Si el elemento existe, realiza un desplazamiento suave hacia él.
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Muestra una advertencia si el elemento no se encuentra.
      console.warn('Elemento con ID "registro-form" no encontrado para el scroll.');
    }
  }
}
