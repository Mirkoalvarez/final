// frontend\src\app\publicaciones\formulario-publicacion\formulario-publicacion.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core'; // Importa los decoradores y tipos necesarios
import { CommonModule } from '@angular/common'; // Importa CommonModule para usar directivas comunes en la plantilla
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // Importa módulos y clases para formularios reactivos
import { RouterModule } from '@angular/router'; // Importa RouterModule para la navegación
import { FormsModule } from '@angular/forms'; // Importa FormsModule para manejar formularios

@Component({
  selector: 'app-formulario-publicacion', // Selector CSS para usar este componente en plantillas HTML
  standalone: true, // Indica que este es un componente autónomo, no requiere un NgModule
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule], // Módulos que este componente necesita para funcionar
  templateUrl: './formulario-publicacion.component.html', // Ruta al archivo HTML de la plantilla del componente
  styleUrls: ['./formulario-publicacion.component.css'] // Ruta al archivo CSS de estilos específicos del componente
})
export class FormularioPublicacionComponent implements OnInit, OnChanges {
  @Input() valoresIniciales: any = null; // Valores iniciales para el formulario, recibidos como input
  @Output() alEnviar = new EventEmitter<FormData>(); // Evento que se emite al enviar el formulario

  form: FormGroup; // Grupo de formularios para manejar los campos del formulario
  borrarImagenActual: boolean = false; // Indica si se debe borrar la imagen actual
  borrarArchivoActual: boolean = false; // Indica si se debe borrar el archivo actual
  formularioEnviado: boolean = false; // Indica si el formulario ha sido enviado

  constructor(private fb: FormBuilder) {
    // Inicializa el formulario con validaciones
    this.form = this.fb.group({
      titulo: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-Z0-9\s.,!?'"()-]+$/) // Validación personalizada para el título
      ]],
      descripcion: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(2000),
        Validators.pattern(/^[a-zA-Z0-9\s.,!?'"()-]+$/) // Validación personalizada para la descripción
      ]],
      imagen: [null], // Campo para la imagen
      archivo: [null], // Campo para el archivo
      id_categoria: ['', Validators.required], // Campo para la categoría
      id_estilo: ['', Validators.required], // Campo para el estilo
    });
  }

  ngOnInit(): void {
    console.log('FormularioPublicacionComponent inicializado'); // Mensaje en consola al inicializar el componente
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Maneja los cambios en los valores iniciales
    if (changes['valoresIniciales'] && this.valoresIniciales) {
      this.form.patchValue({
        titulo: this.valoresIniciales.titulo, // Rellena el campo título
        descripcion: this.valoresIniciales.descripcion, // Rellena el campo descripción
        id_categoria: this.valoresIniciales.id_categoria, // Rellena el campo categoría
        id_estilo: this.valoresIniciales.id_estilo, // Rellena el campo estilo
      });
      this.borrarImagenActual = false; // Resetea la bandera de borrar imagen
      this.borrarArchivoActual = false; // Resetea la bandera de borrar archivo
    }
  }

  /**
   * Maneja el cambio de archivos en los campos de entrada.
   * @param event - Evento del cambio de archivo
   * @param campo - Nombre del campo que se está actualizando
   */
  onFileChange(event: any, campo: string) {
    const file = event.target.files[0]; // Obtiene el primer archivo seleccionado
    if (file) {
      this.form.get(campo)?.setValue(file); // Establece el archivo en el campo correspondiente
      if (campo === 'imagen') {
        this.borrarImagenActual = false; // Resetea la bandera de borrar imagen si se selecciona una nueva
      } else if (campo === 'archivo') {
        this.borrarArchivoActual = false; // Resetea la bandera de borrar archivo si se selecciona uno nuevo
      }
    } else {
      this.form.get(campo)?.setValue(null); // Resetea el campo si no se selecciona ningún archivo
    }
  }

  /**
   * Envía el formulario si es válido.
   */
  submitForm() {
    this.form.markAllAsTouched(); // Marca todos los campos como tocados
    this.formularioEnviado = true; // Indica que el formulario ha sido enviado

    if (this.form.valid) {
      const formData = new FormData(); // Crea un nuevo objeto FormData
      for (const key in this.form.value) {
        if (this.form.value.hasOwnProperty(key)) {
          const value = this.form.value[key];
          if (value instanceof File) {
            formData.append(key, value, value.name); // Añade el archivo al FormData
          } else if (value !== null && value !== undefined) {
            formData.append(key, String(value)); // Añade otros valores al FormData
          }
        }
      }

      // Añade banderas para borrar imagen o archivo si es necesario
      if (this.borrarImagenActual) {
        formData.append('imagen_borrar', 'true');
      }
      if (this.borrarArchivoActual) {
        formData.append('archivo_borrar', 'true');
      }

      this.alEnviar.emit(formData); // Emite el evento con el FormData
    } else {
      console.warn('Formulario inválido. Revisa los campos.'); // Mensaje de advertencia si el formulario no es válido
    }
  }
}

/**
 * Notas adicionales:
 * 1. Este componente maneja la creación y edición de publicaciones a través de un formulario.
 * 2. Asegúrate de que las validaciones sean adecuadas para los requisitos de tu aplicación.
 * 3. El uso de FormData permite enviar archivos y datos de formulario de manera eficiente.
 */
