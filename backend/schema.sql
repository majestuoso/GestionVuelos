CREATE DATABASE IF NOT EXISTS sistema_vuelos;
USE sistema_vuelos;
SET default_storage_engine=INNODB;

-- 1. Pasajeros: Agregué UNIQUE en DNI para evitar duplicados
CREATE TABLE Pasajeros (
    id_pasajero INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    dni VARCHAR(20) NOT NULL UNIQUE, -- VARCHAR es mejor para DNI (por si empieza con 0)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Como el profe
);

CREATE TABLE Vuelos (
    id_vuelo INT AUTO_INCREMENT PRIMARY KEY,
    numero_vuelo VARCHAR(10) NOT NULL, -- VARCHAR permite letras (ej: AR1300)
    origen VARCHAR(100) NOT NULL,
    destino VARCHAR(100) NOT NULL,
    fecha_hora_salida DATETIME NOT NULL, -- Importante: Fecha Y Hora
    capacidad INT NOT NULL,
    asientos_disponibles INT NOT NULL, -- Ayuda mucho al backend
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Reservas (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    id_vuelo INT NOT NULL,  
    id_pasajero INT NOT NULL,           
    fecha_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Automático
    estado VARCHAR(20) DEFAULT 'CONFIRMADA', -- CONFIRMADA, CANCELADA, CAMBIADA
    
    FOREIGN KEY (id_pasajero) REFERENCES Pasajeros(id_pasajero) ON DELETE CASCADE,
    FOREIGN KEY (id_vuelo) REFERENCES Vuelos(id_vuelo) ON DELETE CASCADE
);

CREATE TABLE Historial_Cambios (
    id_cambio INT AUTO_INCREMENT PRIMARY KEY,
    id_reserva INT NOT NULL,
    id_vuelo_anterior INT NOT NULL,
    id_vuelo_nuevo INT NOT NULL,
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_reserva) REFERENCES Reservas(id_reserva) ON DELETE CASCADE
);