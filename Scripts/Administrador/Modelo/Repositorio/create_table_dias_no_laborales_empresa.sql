CREATE TABLE dias_no_laborales_empresa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_empresa INT NOT NULL,
  dia_mes CHAR(5) NOT NULL,

  CONSTRAINT fk_dias_no_laborales_empresa_empresa
    FOREIGN KEY (id_empresa) REFERENCES Empresa(id)
    ON DELETE CASCADE,

  UNIQUE KEY uk_dias_no_laborales_empresa (id_empresa, dia_mes),
  INDEX idx_dias_no_laborales_empresa (id_empresa)
);
