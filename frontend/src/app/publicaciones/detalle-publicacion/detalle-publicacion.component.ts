// frontend\src\app\publicaciones\detalle-publicacion\detalle-publicacion.component.ts
import { Component, inject } from '@angular/core'; // Importa Component y la función inject para inyectar dependencias
import { CommonModule } from '@angular/common'; // Importa CommonModule para usar directivas comunes en la plantilla
import { HttpClient } from '@angular/common/http'; // Importa HttpClient para realizar solicitudes HTTP
import { ActivatedRoute, RouterModule } from '@angular/router'; // Importa ActivatedRoute para acceder a parámetros de la ruta y RouterModule para la navegación
import { AuthService } from '../../core/services/auth.service'; // Importa el servicio de autenticación
import { FormsModule } from '@angular/forms'; // Importa FormsModule para manejar formularios

@Component({
  selector: 'app-detalle-publicacion', // Selector CSS para usar este componente en plantillas HTML
  standalone: true, // Indica que este es un componente autónomo, no requiere un NgModule
  imports: [CommonModule, RouterModule, FormsModule], // Módulos que este componente necesita para funcionar
  templateUrl: 'detalle-publicacion.component.html', // Ruta al archivo HTML de la plantilla del componente
  styleUrls: ['detalle-publicacion.component.css'] // Ruta al archivo CSS de estilos específicos del componente
})
export class DetallePublicacionComponent {
  publicacion: any = {}; // Objeto para almacenar los detalles de la publicación
  comentarios: any[] = []; // Array para almacenar los comentarios de la publicación
  nuevoComentario: string = ''; // Variable para almacenar el nuevo comentario
  idPublicacion: string | null = ''; // ID de la publicación actual
  usuarioActual: any = null; // Información del usuario actual
  comentarioEditado: string = ''; // Texto del comentario que se está editando
  comentarioAEditar: number | null = null; // ID del comentario que se está editando
  errorComentario: string = ''; // Mensaje de error para el nuevo comentario
  errorComentarioEditado: string = ''; // Mensaje de error para el comentario editado

  private http = inject(HttpClient); // Inyecta HttpClient para realizar solicitudes HTTP
  private route = inject(ActivatedRoute); // Inyecta ActivatedRoute para acceder a los parámetros de la ruta
  private authService = inject(AuthService); // Inyecta AuthService para manejar la autenticación

  constructor() {
    this.usuarioActual = this.authService.obtenerUsuario(); // Obtiene la información del usuario actual
    this.idPublicacion = this.route.snapshot.paramMap.get('id'); // Obtiene el ID de la publicación desde los parámetros de la ruta
    
    if (this.idPublicacion) {
      this.cargarDatos(this.idPublicacion); // Carga los datos de la publicación si el ID es válido
    }
  }

  /**
   * Carga los datos de la publicación y sus comentarios.
   * @param idPublicacion - ID de la publicación a cargar
   */
  cargarDatos(idPublicacion: string): void {
    // Carga los detalles de la publicación
    this.http.get(`http://localhost/final/public/publicaciones/publicacion.php?id=${idPublicacion}`)
      .subscribe({
        next: (data: any) => {
          this.publicacion = data; // Almacena los datos de la publicación
        },
        error: (error) => {
          console.error('Error al cargar la publicación:', error); // Muestra un error en la consola
          this.publicacion = {}; // Resetea la publicación en caso de error
        }
      });
    
    // Carga los comentarios de la publicación
    this.http.get(`http://localhost/final/public/comentarios/listar_por_publicacion.php?id=${idPublicacion}`)
      .subscribe(
        (data: any) => {
          this.comentarios = data || []; // Almacena los comentarios o un array vacío si no hay comentarios
        },
        (error) => {
          console.error('Error al cargar comentarios:', error); // Muestra un error en la consola
        }
      );
  }

  // ------> VALIDACIONES <------
  /**
   * Valida el texto de un comentario.
   * @param texto - Texto del comentario a validar
   * @returns true si el comentario es válido, false en caso contrario
   */
  comentarioValido(texto: string): boolean {
    const regex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,!?'"()-]{2,500}$/; // Expresión regular para validar el comentario
    return regex.test(texto.trim()); // Devuelve true si el texto cumple con la expresión regular
  }

  // ------> EDICIÓN DE COMENTARIO <------
  /**
   * Inicia el proceso de edición de un comentario.
   * @param idComentario - ID del comentario a editar
   * @param texto - Texto del comentario a editar
   */
  editarComentario(idComentario: number, texto: string): void {
    this.comentarioAEditar = idComentario; // Almacena el ID del comentario a editar
    this.comentarioEditado = texto; // Almacena el texto del comentario a editar
    this.errorComentarioEditado = ''; // Resetea el mensaje de error
  }

  /**
   * Guarda el comentario editado.
   */
  guardarComentarioEditado(): void {
    this.errorComentarioEditado = ''; // Resetea el mensaje de error

    if (!this.comentarioValido(this.comentarioEditado)) {
      this.errorComentarioEditado = 'El comentario contiene caracteres no permitidos o no cumple con el mínimo de 2 caracteres.'; // Mensaje de error si el comentario no es válido
      return; // Sale de la función si el comentario no es válido
    }

    const token = localStorage.getItem('token'); // Obtiene el token de autenticación
    const headers = { Authorization: `Bearer ${token}` }; // Establece el encabezado de autorización
    const body = {
        id: this.comentarioAEditar, // ID del comentario a editar
        texto: this.comentarioEditado // Nuevo texto del comentario
    };
    
    // Realiza la solicitud PATCH para actualizar el comentario
    this.http.patch('http://localhost/final/public/comentarios/actualizar_comentario.php', body, { headers })
      .subscribe({
        next: () => {
          this.comentarioEditado = ''; // Resetea el texto del comentario editado
          this.comentarioAEditar = null; // Resetea el ID del comentario a editar
          this.cargarDatos(this.idPublicacion!); // Recarga los datos de la publicación
        },
        error: (err) => console.error('Error al actualizar comentario:', err) // Muestra un error en la consola
      });
  }

  // ------> PUBLICAR NUEVO COMENTARIO <------
  /**
   * Publica un nuevo comentario.
   */
  publicarComentario(): void {
    this.errorComentario = ''; // Resetea el mensaje de error

    if (!this.comentarioValido(this.nuevoComentario)) {
      this.errorComentario = 'El comentario debe tener entre 2 y 500 caracteres y contener solo caracteres permitidos.'; // Mensaje de error si el comentario no es válido
      return; // Sale de la función si el comentario no es válido
    }
    
    const token = localStorage.getItem('token'); // Obtiene el token de autenticación
    const headers = { Authorization: `Bearer ${token}` }; // Establece el encabezado de autorización
    const body = {
      id_publicacion: this.idPublicacion, // ID de la publicación a la que se añade el comentario
      contenido: this.nuevoComentario // Contenido del nuevo comentario
    };

    // Realiza la solicitud POST para crear un nuevo comentario
    this.http.post('http://localhost/final/public/comentarios/crear_comentario.php', body, { headers })
      .subscribe({
        next: () => {
          this.nuevoComentario = ''; // Resetea el texto del nuevo comentario
          this.cargarDatos(this.idPublicacion!); // Recarga los datos de la publicación
        },
        error: (err) => console.error('Error al publicar comentario:', err) // Muestra un error en la consola
      });
  }

  // ------> PERMISOS <------
  /**
   * Verifica si el usuario puede editar o eliminar la publicación.
   * @returns true si el usuario puede editar o eliminar, false en caso contrario
   */
  puedeEditarEliminarPublicacion(): boolean {
    if (!this.usuarioActual) return false; // Si no hay usuario actual, no puede editar o eliminar
    return this.usuarioActual.id === this.publicacion.id_usuario || this.authService.obtenerRol() === 'admin'; // Permite si es el autor o un administrador
  }

  /**
   * Verifica si el usuario puede editar o eliminar un comentario.
   * @param idUsuarioComentario - ID del usuario que hizo el comentario
   * @returns true si el usuario puede editar o eliminar, false en caso contrario
   */
  puedeEditarEliminarComentario(idUsuarioComentario: number): boolean {
    if (!this.usuarioActual) return false; // Si no hay usuario actual, no puede editar o eliminar
    return this.usuarioActual.id === idUsuarioComentario || this.authService.obtenerRol() === 'admin'; // Permite si es el autor o un administrador
  }

  /**
   * Elimina un comentario.
   * @param idComentario - ID del comentario a eliminar
   */
  eliminarComentario(idComentario: number): void {
    if (!confirm('¿Eliminar este comentario?')) return; // Confirma la eliminación del comentario
    
    const token = localStorage.getItem('token'); // Obtiene el token de autenticación
    const headers = { Authorization: `Bearer ${token}` }; // Establece el encabezado de autorización

    // Realiza la solicitud DELETE para eliminar el comentario
    this.http.delete('http://localhost/final/public/comentarios/eliminar_comentario.php', 
      { body: { id: idComentario }, headers })
      .subscribe({
        next: () => this.cargarDatos(this.idPublicacion!), // Recarga los datos de la publicación
        error: (err) => console.error('Error al eliminar:', err) // Muestra un error en la consola
      });
  }

  /**
   * Elimina la publicación.
   */
  eliminarPublicacion(): void {
    if (!confirm('¿Eliminar esta publicación?')) return; // Confirma la eliminación de la publicación
    
    const token = localStorage.getItem('token'); // Obtiene el token de autenticación
    const headers = { Authorization: `Bearer ${token}` }; // Establece el encabezado de autorización

    // Realiza la solicitud DELETE para eliminar la publicación
    this.http.delete('http://localhost/final/public/publicaciones/eliminar_publicacion.php', 
      { body: { id: this.publicacion.id }, headers })
      .subscribe({
        next: () => window.location.href = '/publicaciones', // Redirige a la lista de publicaciones
        error: (err) => console.error('Error al eliminar publicación:', err) // Muestra un error en la consola
      });
  }
}

/**
 * Notas adicionales:
 * 1. Este componente muestra los detalles de una publicación, incluyendo comentarios y permite la edición y eliminación de comentarios.
 * 2. Asegúrate de que las rutas de la API estén configuradas correctamente para manejar las solicitudes.
 * 3. La validación de comentarios asegura que solo se acepten caracteres permitidos y que el texto tenga una longitud adecuada.
 */
