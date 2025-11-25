import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http'; 
import { FormsModule } from '@angular/forms'; 

// Define el componente de Angular
@Component({
  standalone: true, // Indica que el componente es "standalone" (autónomo)
  selector: 'app-usuarios', // Selector CSS para usar este componente
  imports: [CommonModule, RouterModule, FormsModule], // Módulos que este componente utiliza
  templateUrl: './usuarios.component.html', // Ruta al archivo HTML de la plantilla
  styleUrls: ['./usuarios.component.css'] // Rutas a los archivos CSS de estilos
})
export class UsuariosComponent implements OnInit { // Implementa la interfaz OnInit para el ciclo de vida
  // Propiedades del componente
  usuarios: any[] = []; // Almacena la lista de usuarios
  usuarioSeleccionado: any = null; // Almacena el usuario actualmente seleccionado para edición
  error: string | null = null; // Almacena mensajes de error
  mensaje: string | null = null; // Almacena mensajes de éxito

  // Constructor del componente, inyecta servicios necesarios
  constructor(
    private auth: AuthService, // Servicio para autenticación
    private http: HttpClient // Cliente HTTP para hacer peticiones a la API
  ) {}

  // Método del ciclo de vida que se ejecuta al inicializar el componente
  ngOnInit(): void {
    this.cargarUsuarios(); // Carga la lista de usuarios al iniciar
  }
  
  // Carga la lista de usuarios desde la API
  cargarUsuarios(): void {
    const token = this.auth.obtenerToken(); // Obtiene el token de autenticación
    // Si no hay token, muestra un error y redirige al login
    if (!token) {
      this.error = 'No autenticado. Redirigiendo al login.';
      this.auth.cerrarSesion(); 
      return;
    }

    // Configura las cabeceras HTTP con el token de autorización
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Realiza una petición GET para listar usuarios
    this.http.get<{usuarios: any[]}>('http://localhost/final/public/api/listar_usuarios.php', { headers }).subscribe({
      next: (res) => {
        this.usuarios = res.usuarios; // Asigna los usuarios recibidos a la propiedad 'usuarios'
        this.error = null; // Limpia cualquier error anterior
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err); // Log del error en consola
        this.error = err.error?.error || 'Error al cargar usuarios.'; // Muestra un mensaje de error
        this.usuarios = []; // Vacía la lista de usuarios en caso de error
      }
    });
  }

  // Selecciona un usuario para editar
  seleccionarUsuarioParaEditar(usuario: any): void {
    this.usuarioSeleccionado = { ...usuario }; // Crea una copia del usuario para evitar mutaciones directas
    this.error = null; // Limpia mensajes de error
    this.mensaje = null; // Limpia mensajes de éxito
  }

  // Guarda los cambios de un usuario editado
  guardarCambiosUsuario(): void {
    // Verifica si hay un usuario seleccionado para guardar
    if (!this.usuarioSeleccionado || !this.usuarioSeleccionado.id) {
      this.error = 'No hay usuario seleccionado para guardar.';
      return;
    }

    const token = this.auth.obtenerToken(); // Obtiene el token de autenticación
    // Si no hay token, muestra un error y redirige al login
    if (!token) {
      this.error = 'No autenticado. Redirigiendo al login.';
      this.auth.cerrarSesion();
      return;
    }

    // Configura las cabeceras HTTP con el token y el tipo de contenido JSON
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' 
    });

    // Prepara el cuerpo de la petición con los datos del usuario a actualizar
    const body: any = { id: this.usuarioSeleccionado.id };
    if (this.usuarioSeleccionado.nombre) {
      body.nombre = this.usuarioSeleccionado.nombre;
    }
    if (this.usuarioSeleccionado.email) {
      body.email = this.usuarioSeleccionado.email;
    }
    if (this.usuarioSeleccionado.rol) {
      body.rol = this.usuarioSeleccionado.rol;
    }
    // Si se proporcionó una nueva clave, la añade al cuerpo de la petición
    if (this.usuarioSeleccionado.nuevaClave) {
      body.clave = this.usuarioSeleccionado.nuevaClave;
    }

    // Realiza una petición PATCH para actualizar el usuario
    this.http.patch(`http://localhost/final/public/api/actualizar_usuario.php`, body, { headers }).subscribe({
      next: () => {
        this.mensaje = 'Usuario actualizado con éxito.'; // Muestra mensaje de éxito
        this.error = null; // Limpia errores
        this.usuarioSeleccionado = null; // Limpia el formulario de edición
        this.cargarUsuarios(); // Recarga la lista de usuarios para reflejar los cambios
      },
      error: (err) => {
        console.error('Error al actualizar usuario:', err); // Log del error
        this.error = err.error?.error || 'Error al actualizar usuario.'; // Muestra mensaje de error
        this.mensaje = null; // Limpia mensajes de éxito
      }
    });
  }

  // Elimina un usuario
  eliminarUsuario(id: number): void {
    // Pide confirmación antes de eliminar
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }

    const token = this.auth.obtenerToken(); // Obtiene el token de autenticación
    // Si no hay token, muestra un error y redirige al login
    if (!token) {
      this.error = 'No autenticado. Redirigiendo al login.';
      this.auth.cerrarSesion();
      return;
    }

    // Configura las cabeceras HTTP con el token y el tipo de contenido JSON
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' 
    });

    // Realiza una petición DELETE para eliminar el usuario
    this.http.delete(`http://localhost/final/public/api/borrar_usuario.php`, { body: { id: id }, headers }).subscribe({
      next: () => {
        this.mensaje = 'Usuario eliminado con éxito.'; // Muestra mensaje de éxito
        this.error = null; // Limpia errores
        this.cargarUsuarios(); // Recarga la lista de usuarios
      },
      error: (err) => {
        console.error('Error al eliminar usuario:', err); // Log del error
        this.error = err.error?.error || 'Error al eliminar usuario.'; // Muestra mensaje de error
        this.mensaje = null; // Limpia mensajes de éxito
      }
    });
  }

  // Cierra la sesión del usuario
  cerrarSesion() {
    this.auth.cerrarSesion(); // Llama al método de cerrar sesión del servicio de autenticación
  }
}
