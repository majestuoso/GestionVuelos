-- Crear base de datos
CREATE DATABASE IF NOT EXISTS sistema_vuelos;
USE sistema_vuelos;
SET default_storage_engine=INNODB;

-- 1. Tabla Pasajeros
CREATE TABLE IF NOT EXISTS Pasajeros (
    id_pasajero INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    dni VARCHAR(20) NOT NULL UNIQUE, -- evita duplicados
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla Vuelos
CREATE TABLE IF NOT EXISTS Vuelos (
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

-- 3. Tabla Reservas
CREATE TABLE IF NOT EXISTS Reservas (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    id_vuelo INT NOT NULL,
    id_pasajero INT NOT NULL,
    asiento VARCHAR(5) NOT NULL, -- ej: 12A
    fecha_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'CONFIRMADA', -- CONFIRMADA, CANCELADA, CAMBIADA

    FOREIGN KEY (id_pasajero) REFERENCES Pasajeros(id_pasajero) ON DELETE CASCADE,
    FOREIGN KEY (id_vuelo) REFERENCES Vuelos(id_vuelo) ON DELETE CASCADE,

    -- restricción: no se puede repetir asiento en el mismo vuelo
    UNIQUE (id_vuelo, asiento)
);

-- 4. Tabla Historial de Cambios
CREATE TABLE IF NOT EXISTS Historial_Cambios (
    id_cambio INT AUTO_INCREMENT PRIMARY KEY,
    id_reserva INT NOT NULL,
    id_vuelo_anterior INT NOT NULL,
    id_vuelo_nuevo INT NOT NULL,
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_reserva) REFERENCES Reservas(id_reserva) ON DELETE CASCADE
);

-- ============================
-- TRIGGERS PARA DISPONIBILIDAD
-- ============================

DELIMITER //

-- Al insertar reserva: descontar asiento disponible
CREATE TRIGGER reserva_insert AFTER INSERT ON Reservas
FOR EACH ROW
BEGIN
  UPDATE Vuelos
  SET asientos_disponibles = asientos_disponibles - 1
  WHERE id_vuelo = NEW.id_vuelo;
END;
//

-- Al eliminar reserva: devolver asiento disponible
CREATE TRIGGER reserva_delete AFTER DELETE ON Reservas
FOR EACH ROW
BEGIN
  UPDATE Vuelos
  SET asientos_disponibles = asientos_disponibles + 1
  WHERE id_vuelo = OLD.id_vuelo;
END;
//

-- Al actualizar reserva: si cambia de vuelo, devolver asiento al viejo vuelo y descontar en el nuevo
CREATE TRIGGER reserva_update AFTER UPDATE ON Reservas
FOR EACH ROW
BEGIN
  IF OLD.id_vuelo <> NEW.id_vuelo THEN
    UPDATE Vuelos
    SET asientos_disponibles = asientos_disponibles + 1
    WHERE id_vuelo = OLD.id_vuelo;

    UPDATE Vuelos
    SET asientos_disponibles = asientos_disponibles - 1
    WHERE id_vuelo = NEW.id_vuelo;

    -- registrar cambio en historial
    INSERT INTO Historial_Cambios (id_reserva, id_vuelo_anterior, id_vuelo_nuevo)
    VALUES (NEW.id_reserva, OLD.id_vuelo, NEW.id_vuelo);
  END IF;
END;
//

DELIMITER ;
