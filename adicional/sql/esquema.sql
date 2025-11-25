-- Eliminar tablas si existen para reiniciar
DROP TABLE IF EXISTS comentarios;
DROP TABLE IF EXISTS publicaciones;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS estilos;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    clave TEXT NOT NULL,
    rol TEXT NOT NULL DEFAULT 'usuario', -- 'usuario' o 'admin'
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de categorías
CREATE TABLE categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE
);

-- Tabla de estilos
CREATE TABLE estilos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE
);

-- Tabla de publicaciones
CREATE TABLE publicaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    imagen TEXT, -- ruta o nombre del archivo
    archivo TEXT, -- opcional, puede ser PDF u otro tipo
    id_categoria INTEGER,
    id_estilo INTEGER,
    fecha_publicacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
    FOREIGN KEY (id_categoria) REFERENCES categorias(id),
    FOREIGN KEY (id_estilo) REFERENCES estilos(id)
);

-- Tabla de comentarios
CREATE TABLE comentarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_publicacion INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    texto TEXT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_publicacion) REFERENCES publicaciones(id),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);

-- Insertar categorías
INSERT OR IGNORE INTO categorias (nombre) VALUES 
('Pintura'),
('Escultura'),
('Muebles Antiguos');

-- Insertar estilos
INSERT OR IGNORE INTO estilos (nombre) VALUES 
('Barroco'),
('Renacimiento'),
('Art Nouveau');

-- Insertar publicaciones
INSERT OR IGNORE INTO publicaciones (id_usuario, titulo, descripcion, imagen, archivo, id_categoria, id_estilo) VALUES 
(2, 'Cuadro Barroco de 1700', 'Obra en óleo sobre lienzo.', 'barroco.jpg', NULL, 1, 1),
(3, 'Silla Renacentista', 'Mueble original del siglo XVI.', 'silla.jpg', NULL, 3, 2);

-- Insertar comentarios
INSERT OR IGNORE INTO comentarios (id_publicacion, id_usuario, texto) VALUES 
(1, 3, '¡Qué obra tan interesante!'),
(2, 2, 'Estoy interesado en esta silla, ¿puede enviarme más detalles?');
