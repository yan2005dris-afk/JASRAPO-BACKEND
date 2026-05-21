-- Add unique constraint on catalogo_retenciones.codigo
ALTER TABLE catalogo_retenciones ADD CONSTRAINT catalogo_retenciones_codigo_key UNIQUE (codigo);

-- Add FK: comprobantes.tipo_comprobante → sri_tipo_comprobante.codigo
ALTER TABLE comprobantes ADD CONSTRAINT comprobantes_tipo_comprobante_fkey
  FOREIGN KEY (tipo_comprobante) REFERENCES sri_tipo_comprobante(codigo) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add FK: comprobantes.doc_modificado_tipo → sri_tipo_comprobante.codigo
ALTER TABLE comprobantes ADD CONSTRAINT comprobantes_doc_modificado_tipo_fkey
  FOREIGN KEY (doc_modificado_tipo) REFERENCES sri_tipo_comprobante(codigo) ON DELETE SET NULL ON UPDATE CASCADE;

-- Add FK: secuenciales.tipo_comprobante → sri_tipo_comprobante.codigo
ALTER TABLE secuenciales ADD CONSTRAINT secuenciales_tipo_comprobante_fkey
  FOREIGN KEY (tipo_comprobante) REFERENCES sri_tipo_comprobante(codigo) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add FK: comprobante_retenciones.codigo_retencion → catalogo_retenciones.codigo
ALTER TABLE comprobante_retenciones ADD CONSTRAINT comprobante_retenciones_codigo_retencion_fkey
  FOREIGN KEY (codigo_retencion) REFERENCES catalogo_retenciones(codigo) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add FK: comprobante_retenciones.cod_doc_sustento → catalogo_documentos_sustento.codigo
ALTER TABLE comprobante_retenciones ADD CONSTRAINT comprobante_retenciones_cod_doc_sustento_fkey
  FOREIGN KEY (cod_doc_sustento) REFERENCES catalogo_documentos_sustento(codigo) ON DELETE SET NULL ON UPDATE CASCADE;

-- Add FK: comprobante_retenciones.forma_pago → catalogo_formas_pago.codigo
ALTER TABLE comprobante_retenciones ADD CONSTRAINT comprobante_retenciones_forma_pago_fkey
  FOREIGN KEY (forma_pago) REFERENCES catalogo_formas_pago(codigo) ON DELETE SET NULL ON UPDATE CASCADE;
