import { Routes } from '@angular/router'; // Importa Routes para definir las rutas de la aplicación
import { authGuard } from './auth/auth.guard'; // Importa el guard de autenticación
import { adminGuard } from './auth/admin.guard'; // Importa el guard de administración
import { canCreatePublicationGuard } from '../app/auth/can-create-publicacion.guard'; // Importa el nuevo guard para la creación de publicaciones

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Redirige a la ruta de login por defecto
  { path: 'login', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) }, // Carga el componente de login
  { path: 'registro', loadComponent: () => import('./auth/registro/registro.component').then(m => m.RegistroComponent) }, // Carga el componente de registro
  
  {
    path: 'home',
    canActivate: [authGuard], // Protege la ruta con el guard de autenticación
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) // Carga el componente de home
  },
  {
    path: 'admin/usuarios',
    canActivate: [adminGuard], // Protegido por el adminGuard
    loadComponent: () => import('./admin/usuarios/usuarios.component').then(m => m.UsuariosComponent) // Carga el componente de usuarios
  },
  {
    path: 'perfil', // Nueva ruta para el perfil
    canActivate: [authGuard], // Protegida por el authGuard
    loadComponent: () => import('./perfil/perfil.component').then(m => m.PerfilComponent)
  },
  {
    path: 'publicaciones',
    canActivate: [authGuard], // Protege la ruta con el guard de autenticación
    children: [
      {
        path: '',
        loadComponent: () => import('./publicaciones/listado-publicaciones/listado-publicaciones.component').then(m => m.ListadoPublicacionesComponent), // Carga el componente de listado de publicaciones
      },
      {
        path: 'nueva',
        canActivate: [canCreatePublicationGuard], // Aplica el guard para la creación de publicaciones
        loadComponent: () => import('./publicaciones/crear-publicacion/crear-publicacion.component').then(m => m.CrearPublicacionComponent), // Carga el componente para crear una nueva publicación
      },
      {
        path: 'editar/:id',
        canActivate: [canCreatePublicationGuard], // Aplica el guard para la edición de publicaciones
        loadComponent: () => import('./publicaciones/editar-publicacion/editar-publicacion.component').then(m => m.EditarPublicacionComponent), // Carga el componente para editar una publicación
      },
      {
        path: ':id',
        loadComponent: () => import('./publicaciones/detalle-publicacion/detalle-publicacion.component').then(m => m.DetallePublicacionComponent), // Carga el componente de detalles de la publicación
      }
    ]
  }
];

/**
 * Notas adicionales:
 * 1. Esta configuración de rutas permite la navegación entre diferentes componentes de la aplicación.
 * 2. Los guards se utilizan para proteger rutas específicas y asegurar que solo los usuarios autorizados puedan acceder a ellas.
 * 3. La carga diferida de componentes mejora el rendimiento al cargar solo los componentes necesarios.
 */
