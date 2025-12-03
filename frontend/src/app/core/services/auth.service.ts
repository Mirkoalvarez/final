import { Injectable } from '@angular/core'; // Importa Injectable para poder inyectar este servicio
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Importa HttpClient para realizar solicitudes HTTP y HttpHeaders para configurar encabezados
import { inject } from '@angular/core'; // Importa la funciИn inject para inyectar dependencias
import { Router } from '@angular/router'; // Importa Router para la navegaciИn programケtica

@Injectable({
  providedIn: 'root', // Indica que este servicio estケ disponible en toda la aplicaciИn
})
export class AuthService {
  private apiUrl = 'http://localhost/final/public/api'; // URL base de la API
  private http = inject(HttpClient); // Inyecta HttpClient para realizar solicitudes HTTP
  private router = inject(Router); // Inyecta Router para permitir la navegaciИn

  /**
   * Registra un nuevo usuario en la aplicaciИn.
   * @param nombre - Nombre del usuario
   * @param email - Email del usuario
   * @param clave - Contraseヵa del usuario
   * @returns Observable con la respuesta del servidor
   */
  registro(nombre: string, email: string, clave: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json' // Establece el tipo de contenido a JSON
    });

    const body = JSON.stringify({ nombre, email, clave }); // Crea el cuerpo de la solicitud

    return this.http.post(`${this.apiUrl}/crear_usuario.php`, body, { headers }); // Realiza la solicitud POST para registrar al usuario
  }

  /**
   * Inicia sesiИn de un usuario en la aplicaciИn.
   * @param email - Email del usuario
   * @param clave - Contraseヵa del usuario
   * @returns Observable con el token de autenticaciИn
   */
  login(email: string, clave: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json' // Establece el tipo de contenido a JSON
    });

    const body = JSON.stringify({ email, clave }); // Crea el cuerpo de la solicitud

    return this.http.post<{ token: string }>(`${this.apiUrl}/autenticar.php`, body, { headers }); // Realiza la solicitud POST para autenticar al usuario
  }

  /**
   * Guarda el token de autenticaciИn en localStorage.
   * @param token - Token de autenticaciИn a guardar
   */
  guardarToken(token: string) {
    localStorage.setItem('token', token); // Almacena el token en localStorage
  }

  /**
   * Obtiene el token de autenticaciИn desde localStorage.
   * @returns El token si existe, o null si no
   */
  obtenerToken(): string | null {
    return localStorage.getItem('token'); // Devuelve el token almacenado
  }

  /**
   * Cierra la sesiИn del usuario, eliminando el token y redirigiendo al login.
   */
  cerrarSesion() {
    localStorage.removeItem('token'); // Elimina el token de localStorage
    this.router.navigate(['/login']); // Redirige al usuario a la pケgina de login
  }

  /**
   * Verifica si el usuario estケ autenticado.
   * @returns true si el usuario estケ autenticado, false en caso contrario
   */
  estaAutenticado(): boolean {
    return !!this.obtenerToken(); // Devuelve true si hay un token almacenado
  }

  /**
   * Obtiene el rol del usuario desde el token.
   * @returns El rol del usuario si existe, o null si no
   */
  obtenerRol(): string | null {
    const token = this.obtenerToken(); // Obtiene el token
    if (!token) return null; // Si no hay token, devuelve null

    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decodifica el token para obtener el payload
      return payload.rol ?? null; // Devuelve el rol del payload o null si no existe
    } catch (e) {
      console.error('Error al decodificar token:', e); // Muestra un error en la consola si hay un problema al decodificar
      return null; // Devuelve null en caso de error
    }
  }

  /**
   * Obtiene la informaciИn del usuario desde el token.
   * @returns El payload del usuario si existe, o null si no
   */
  obtenerUsuario(): any | null {
    const token = this.obtenerToken(); // Obtiene el token
    if (!token) return null; // Si no hay token, devuelve null

    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decodifica el token para obtener el payload
      return payload; // Devuelve el payload del usuario
    } catch (e) {
      console.error('Error al decodificar token:', e); // Muestra un error en la consola si hay un problema al decodificar
      return null; // Devuelve null en caso de error
    }
  }
}

/**
 * Notas adicionales:
 * 1. Este servicio maneja la autenticaciИn de usuarios, incluyendo registro, inicio de sesiИn y gestiИn de tokens.
 * 2. Asegカrate de que la API estゼ configurada para manejar las solicitudes de registro y autenticaciИn correctamente.
 * 3. Este servicio se puede inyectar en otros componentes o servicios donde se necesite gestionar la autenticaciИn.
 */
