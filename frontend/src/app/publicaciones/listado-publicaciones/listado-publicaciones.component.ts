import { Component, OnInit, inject } from '@angular/core'; // Importa Component, OnInit y la función inject para inyectar dependencias
import { CommonModule } from '@angular/common'; // Importa CommonModule para usar directivas comunes en la plantilla
import { HttpClient, HttpParams } from '@angular/common/http'; // Importa HttpClient para realizar solicitudes HTTP y HttpParams para manejar parámetros de consulta
import { RouterModule } from '@angular/router'; // Importa RouterModule para la navegación
import { AuthService } from '../../core/services/auth.service'; // Importa el servicio de autenticación
import { FormsModule } from '@angular/forms'; // Importa FormsModule para manejar formularios

@Component({
  selector: 'app-listado-publicaciones', // Selector CSS para usar este componente en plantillas HTML
  standalone: true, // Indica que este es un componente autónomo, no requiere un NgModule
  imports: [CommonModule, RouterModule, FormsModule], // Módulos que este componente necesita para funcionar
  templateUrl: './listado-publicaciones.component.html', // Ruta al archivo HTML de la plantilla del componente
  styleUrls: ['./listado-publicaciones.component.css'] // Ruta al archivo CSS de estilos específicos del componente
})
export class ListadoPublicacionesComponent implements OnInit {
  publicaciones: any[] = []; // Array para almacenar las publicaciones
  filtroCategoria: string = ''; // Propiedad para el filtro de categoría
  filtroEstilo: string = ''; // Propiedad para el filtro de estilo
  busquedaAutor: string = ''; // Propiedad para la búsqueda por autor

  private http = inject(HttpClient); // Inyecta HttpClient para realizar solicitudes HTTP
  private authService = inject(AuthService); // Inyecta AuthService para manejar la autenticación

  ngOnInit(): void {
    this.cargarPublicaciones(); // Carga las publicaciones al inicializar el componente
  }

  /**
   * Carga las publicaciones aplicando los filtros y parámetros de búsqueda.
   */
  cargarPublicaciones(): void {
    let params = new HttpParams(); // Crea un nuevo objeto HttpParams para manejar los parámetros de consulta

    // Añade el filtro de categoría si está definido
    if (this.filtroCategoria) {
      params = params.append('id_categoria', this.filtroCategoria);
    }
    // Añade el filtro de estilo si está definido
    if (this.filtroEstilo) {
      params = params.append('id_estilo', this.filtroEstilo);
    }
    // Añade la búsqueda por autor si está definida y tiene al menos 2 caracteres
    if (this.busquedaAutor && this.busquedaAutor.trim().length >= 2) {
      const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.'-]{2,50}$/; // Expresión regular para validar el nombre del autor
      if (!regex.test(this.busquedaAutor.trim())) {
        alert('El nombre de autor contiene caracteres inválidos.'); // Alerta si el nombre del autor no es válido
        return; // Sale de la función si el nombre no es válido
      }
      params = params.append('autor', this.busquedaAutor.trim()); // Añade el nombre del autor a los parámetros
    }

    // Realiza la solicitud GET para cargar las publicaciones
    this.http.get<any[]>('http://localhost/final/public/publicaciones/listar_publicaciones.php', { params }).subscribe({
      next: (data) => {
        this.publicaciones = data; // Almacena las publicaciones en el array
      },
      error: (error) => {
        console.error('Error al cargar las publicaciones:', error); // Muestra un error en la consola si la solicitud falla
      }
    });
  }

  /**
   * Verifica si el usuario actual es el autor de la publicación.
   * @param idAutor - ID del autor a verificar
   * @returns true si el usuario actual es el autor, false en caso contrario
   */
  esAutor(idAutor: number): boolean {
    return this.authService.obtenerUsuario()?.id === idAutor; // Compara el ID del autor con el ID del usuario actual
  }
}

/**
 * Notas adicionales:
 * 1. Este componente muestra una lista de publicaciones y permite filtrar por categoría, estilo y autor.
 * 2. Asegúrate de que la API esté configurada para manejar las solicitudes de listado de publicaciones correctamente.
 * 3. La validación del nombre del autor asegura que solo se acepten caracteres permitidos.
 */
