import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-perfil',
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  usuario: any = {
    nombre: '',
    email: '',
    rol: ''
  };
  nuevaClave: string = '';
  repetirClave: string = '';
  mensaje: string | null = null;
  error: string | null = null;
  mostrarClave = false;
  mostrarRepetirClave = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    const token = this.authService.obtenerToken();
    if (!token) {
      this.error = 'No autenticado. Por favor, inicie sesión.';
      this.authService.cerrarSesion();
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<any>('http://localhost/final/public/perfil/obtener_perfil.php', { headers }).subscribe({
      next: (data) => {
        this.usuario = data;
        this.error = null;
      },
      error: (err) => {
        console.error('Error al cargar el perfil:', err);
        this.error = err.error?.error || 'Error al cargar el perfil.';
        this.mensaje = null;
        if (err.status === 401 || err.status === 403) {
          this.authService.cerrarSesion();
        }
      }
    });
  }

  guardarCambios(): void {
    this.mensaje = null;
    this.error = null;

    const token = this.authService.obtenerToken();
    if (!token) {
      this.error = 'No autenticado. Por favor, inicie sesión.';
      this.authService.cerrarSesion();
      return;
    }

    if (this.nuevaClave && !this.contrasenaSegura()) {
      this.error = 'La nueva contraseña no cumple con los requisitos de seguridad.';
      return;
    }

    if (this.nuevaClave && !this.contrasenasCoinciden()) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const body: any = {
      nombre: this.usuario.nombre,
      email: this.usuario.email
    };

    if (this.nuevaClave) {
      body.clave = this.nuevaClave;
    }

    this.http.patch('http://localhost/final/public/perfil/actualizar_perfil.php', body, { headers }).subscribe({
      next: (res: any) => {
        this.mensaje = res.mensaje || 'Perfil actualizado correctamente.';
        this.error = null;
        this.nuevaClave = '';
        this.repetirClave = '';
        // Si el email fue actualizado, el token actual podría ser inválido.
        // Se recomienda forzar un nuevo login o actualizar el token si el backend lo permite.
        // Por simplicidad, aquí solo recargamos el perfil.
        this.cargarPerfil();
      },
      error: (err) => {
        console.error('Error al actualizar el perfil:', err);
        this.error = err.error?.error || 'Error al actualizar el perfil.';
        this.mensaje = null;
        if (err.status === 401 || err.status === 403) {
          this.authService.cerrarSesion();
        }
      }
    });
  }

  // Validaciones
  emailValido(): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return regex.test(this.usuario.email);
  }

  contrasenaSegura(): boolean {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
    return regex.test(this.nuevaClave);
  }

  contrasenasCoinciden(): boolean {
    return this.nuevaClave === this.repetirClave;
  }

  // Funciones para mostrar/ocultar contraseña
  tipoInputClave(): string {
    return this.mostrarClave ? 'text' : 'password';
  }

  tipoInputRepetirClave(): string {
    return this.mostrarRepetirClave ? 'text' : 'password';
  }
}
