import { Component, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-listado-publicaciones',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './listado-publicaciones.component.html',
  styleUrls: ['./listado-publicaciones.component.css']
})
export class ListadoPublicacionesComponent implements OnInit {
  publicaciones: any[] = [];
  filtroCategoria: string = '';
  filtroEstilo: string = '';
  busquedaAutor: string = '';
  mostrarScrollTop = false;

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  ngOnInit(): void {
    // Sincroniza estado inicial (por si llegas con scroll previo)
    this.actualizarBotonScroll();
    this.cargarPublicaciones();
  }

  /**
   * Carga las publicaciones aplicando los filtros y parámetros de búsqueda.
   */
  cargarPublicaciones(): void {
    let params = new HttpParams();

    if (this.filtroCategoria) {
      params = params.append('id_categoria', this.filtroCategoria);
    }

    if (this.filtroEstilo) {
      params = params.append('id_estilo', this.filtroEstilo);
    }

    if (this.busquedaAutor && this.busquedaAutor.trim().length >= 2) {
      const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.'-]{2,50}$/;
      if (!regex.test(this.busquedaAutor.trim())) {
        alert('El nombre de autor contiene caracteres inválidos.');
        return;
      }
      params = params.append('autor', this.busquedaAutor.trim());
    }

    this.http.get<any[]>('http://localhost/final/public/publicaciones/listar_publicaciones.php', { params }).subscribe({
      next: (data) => {
        this.publicaciones = data;
      },
      error: (error) => {
        console.error('Error al cargar las publicaciones:', error);
      }
    });
  }

  esAutor(idAutor: number): boolean {
    return this.authService.obtenerUsuario()?.id === idAutor;
  }

  irArriba(): void {
    // Forzar scroll al tope en todos los navegadores
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  @HostListener('window:scroll')
  @HostListener('document:scroll')
  actualizarBotonScroll(): void {
    const scrollTop =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    this.mostrarScrollTop = scrollTop > 120;
  }
}
