// /src/app/publicaciones/editar-publicacion/editar-publicacion.component.ts
import { Component, OnInit, inject } from '@angular/core'; // Importa Component, OnInit y la función inject para inyectar dependencias
import { ActivatedRoute, Router } from '@angular/router'; // Importa ActivatedRoute para acceder a parámetros de la ruta y Router para la navegación
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Importa HttpClient para realizar solicitudes HTTP y HttpHeaders para configurar encabezados
import { CommonModule } from '@angular/common'; // Importa CommonModule para usar directivas comunes en la plantilla
import { FormularioPublicacionComponent } from '../formulario-publicacion/formulario-publicacion.component'; // Importa el componente de formulario de publicación
import { AuthService } from '../../core/services/auth.service'; // Importa el servicio de autenticación

@Component({
  selector: 'app-editar-publicacion', // Selector CSS para usar este componente en plantillas HTML
  standalone: true, // Indica que este es un componente autónomo, no requiere un NgModule
  imports: [CommonModule, FormularioPublicacionComponent], // Módulos y componentes que este componente necesita para funcionar
  template: `
    <p *ngIf="error" style="color: red;">{{ error }}</p> 
    <p *ngIf="mensaje" style="color: green;">{{ mensaje }}</p>
    <app-formulario-publicacion
      [valoresIniciales]="publicacion" 
      (alEnviar)="editarPublicacion($event)"> 
    </app-formulario-publicacion>
  `
})
//1° p Muestra un mensaje de error si existe
//2° p Muestra un mensaje de éxito si existe
//3° fun alEnviar Maneja el evento de envío del formulario
//4° Pasa los valores iniciales al formulario
export class EditarPublicacionComponent implements OnInit {
  publicacion: any = null; // Objeto para almacenar los detalles de la publicación
  idPublicacion!: string; // ID de la publicación a editar
  error: string | null = null; // Mensaje de error
  mensaje: string | null = null; // Mensaje de éxito

  private route = inject(ActivatedRoute); // Inyecta ActivatedRoute para acceder a los parámetros de la ruta
  private http = inject(HttpClient); // Inyecta HttpClient para realizar solicitudes HTTP
  private router = inject(Router); // Inyecta Router para la navegación programática
  private authService = inject(AuthService); // Inyecta AuthService para manejar la autenticación

  ngOnInit(): void {
    this.idPublicacion = this.route.snapshot.paramMap.get('id')!; // Obtiene el ID de la publicación desde los parámetros de la ruta
    this.cargarPublicacionParaEditar(); // Carga los datos de la publicación para editar
  }

  /**
   * Carga los datos de la publicación que se va a editar.
   */
  cargarPublicacionParaEditar(): void {
    const token = this.authService.obtenerToken(); // Obtiene el token de autenticación
    if (!token) {
      this.error = 'No autenticado. Redirigiendo al login.'; // Mensaje de error si no está autenticado
      this.authService.cerrarSesion(); // Cierra la sesión
      return; // Sale de la función
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}` // Establece el encabezado de autorización
    });

    // Realiza la solicitud GET para cargar la publicación
    this.http.get(`http://localhost/final/public/publicaciones/publicacion.php?id=${this.idPublicacion}`, { headers })
      .subscribe({
        next: (data: any) => {
          this.publicacion = data; // Almacena los datos de la publicación
          this.error = null; // Resetea el mensaje de error
        },
        error: (err) => {
          console.error('Error al cargar publicación:', err); // Muestra un error en la consola
          this.error = err.error?.error || 'No se pudo cargar la publicación. Inténtalo de nuevo.'; // Mensaje de error
          this.publicacion = null; // Resetea la publicación en caso de error
        }
      });
  }

  /**
   * Maneja la edición de la publicación.
   * @param formData - Los datos del formulario enviados desde el componente de formulario de publicación
   */
  editarPublicacion(formData: FormData) {
    this.error = null; // Resetea el mensaje de error
    this.mensaje = null; // Resetea el mensaje de éxito

    const token = this.authService.obtenerToken(); // Obtiene el token de autenticación
    if (!token) {
      this.error = 'No autenticado. Redirigiendo al login.'; // Mensaje de error si no está autenticado
      this.authService.cerrarSesion(); // Cierra la sesión
      return; // Sale de la función
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}` // Establece el encabezado de autorización
      // NO establecer 'Content-Type': 'application/json' aquí.
      // El navegador lo establecerá automáticamente como 'multipart/form-data'
      // cuando se envía un objeto FormData.
    });

    // Asegúrate de que el ID de la publicación se incluya en el FormData
    formData.append('id', this.idPublicacion); // Añade el ID de la publicación al FormData

    // Cambiar de patch a post si el backend fue modificado para aceptar POST con FormData
    // Si el backend sigue siendo PATCH, el navegador no enviará FormData correctamente.
    // La forma más sencilla es cambiar el backend a POST para actualizaciones con archivos.
    this.http.post(`http://localhost/final/public/publicaciones/actualizar_publicacion.php`, formData, { headers })
      .subscribe({
        next: () => {
          this.mensaje = 'Publicación actualizada con éxito.'; // Mensaje de éxito
          setTimeout(() => this.router.navigate(['/publicaciones']), 1500); // Redirige a la lista de publicaciones después de 1.5 segundos
        },
        error: (err) => {
          console.error('Error al actualizar publicación:', err); // Muestra un error en la consola
          this.error = err.error?.error || 'Ocurrió un error al actualizar la publicación.'; // Mensaje de error
        }
      });
  }
}

/**
 * Notas adicionales:
 * 1. Este componente permite a los usuarios editar una publicación existente.
 * 2. Asegúrate de que la API esté configurada para manejar las solicitudes de actualización correctamente.
 * 3. El uso de FormData permite enviar archivos y datos de formulario de manera eficiente.
 */
