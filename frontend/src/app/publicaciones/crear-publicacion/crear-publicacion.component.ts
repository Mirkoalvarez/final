import { Component } from '@angular/core'; // Importa Component para definir el componente
import { CommonModule } from '@angular/common'; // Importa CommonModule para usar directivas comunes en la plantilla
import { FormularioPublicacionComponent } from '../formulario-publicacion/formulario-publicacion.component'; // Importa el componente de formulario de publicación
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Importa HttpClient para realizar solicitudes HTTP y HttpHeaders para configurar encabezados
import { Router } from '@angular/router'; // Importa Router para la navegación programática

@Component({
  selector: 'app-crear-publicacion', // Selector CSS para usar este componente en plantillas HTML
  standalone: true, // Indica que este es un componente autónomo, no requiere un NgModule
  imports: [CommonModule, FormularioPublicacionComponent], // Módulos y componentes que este componente necesita para funcionar
  template: `
    <app-formulario-publicacion (alEnviar)="crearPublicacion($event)"></app-formulario-publicacion>
  `
}) // Plantilla que incluye el formulario de publicación
export class CrearPublicacionComponent {
  // Constructor que inyecta HttpClient y Router
  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Maneja la creación de una nueva publicación.
   * @param formData - Los datos del formulario enviados desde el componente de formulario de publicación
   */
  crearPublicacion(formData: FormData) {
    const token = localStorage.getItem('token'); // Obtiene el token de autenticación del localStorage

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}` // Establece el encabezado de autorización con el token
    });

    // Realiza la solicitud POST para crear la publicación
    this.http.post('http://localhost/final/public/publicaciones/crear_publicacion.php', formData, { headers })
      .subscribe({
        next: () => {
          alert('Publicación creada con éxito'); // Muestra un mensaje de éxito
          this.router.navigate(['/publicaciones']); // Redirige a la lista de publicaciones
        },
        error: (error) => {
          console.error('Error al crear publicación', error); // Muestra un error en la consola
          alert('Ocurrió un error al crear la publicación'); // Muestra un mensaje de error al usuario
        }
      });
  }
}

/**
 * Notas adicionales:
 * 1. Este componente permite a los usuarios crear nuevas publicaciones a través de un formulario.
 * 2. Asegúrate de que el componente FormularioPublicacion emita el evento 'alEnviar' con los datos del formulario.
 * 3. La URL de la API debe estar configurada correctamente para manejar la creación de publicaciones.
 */
