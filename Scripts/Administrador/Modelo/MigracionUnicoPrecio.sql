-- Ejecutar una sola vez sobre la base de datos de la aplicación.
ALTER TABLE Empresa
  ADD COLUMN unicoPrecio TINYINT(1) NOT NULL DEFAULT 1;

UPDATE Empresa
SET unicoPrecio = 1;
