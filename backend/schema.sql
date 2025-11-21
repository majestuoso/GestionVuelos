CREATE DATABASE IF NOT EXISTS sistema_vuelos;
USE sistema_vuelos;
SET default_storage_engine=INNODB;

-- 1. Pasajeros
CREATE TABLE Pasajeros (
    id_pasajero INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    dni VARCHAR(20) NOT NULL UNIQUE, -- evita duplicados
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Vuelos
CREATE TABLE Vuelos (
    id_vuelo INT AUTO_INCREMENT PRIMARY KEY,
    numero_vuelo VARCHAR(10) NOT NULL, -- ej: AR1300
    origen VARCHAR(100) NOT NULL,
    destino VARCHAR(100) NOT NULL,
    fecha_hora_salida DATETIME NOT NULL,
    capacidad INT NOT NULL,
    asientos_disponibles INT NOT NULL,
    estado VARCHAR(20) DEFAULT 'Programado', -- Programado, En curso, Demorado, Finalizado
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Reservas (con asiento elegido)
CREATE TABLE Reservas (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    id_vuelo INT NOT NULL,
    id_pasajero INT NOT NULL,
    asiento VARCHAR(5) NOT NULL, -- ej: 12A o número simple
    fecha_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'CONFIRMADA', -- CONFIRMADA, CANCELADA, CAMBIADA

    FOREIGN KEY (id_pasajero) REFERENCES Pasajeros(id_pasajero) ON DELETE CASCADE,
    FOREIGN KEY (id_vuelo) REFERENCES Vuelos(id_vuelo) ON DELETE CASCADE,

    -- restricción: no se puede repetir asiento en el mismo vuelo
    UNIQUE (id_vuelo, asiento)
);

-- 4. Historial de Cambios
CREATE TABLE Historial_Cambios (
    id_cambio INT AUTO_INCREMENT PRIMARY KEY,
    id_reserva INT NOT NULL,
    id_vuelo_anterior INT NOT NULL,
    id_vuelo_nuevo INT NOT NULL,
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_reserva) REFERENCES Reservas(id_reserva) ON DELETE CASCADE
);
