-- Move legacy reading evidence to its canonical work order before dropping the column.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM lecturas l
    LEFT JOIN ordenes_trabajo ot ON ot.lectura_id = l.lectura_id
    WHERE l.foto_url IS NOT NULL AND ot.orden_trabajo_id IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot migrate reading photos: orphan foto_url values exist without a linked work order';
  END IF;
END $$;

UPDATE ordenes_trabajo ot
SET evidencia_foto_url = l.foto_url
FROM lecturas l
WHERE ot.lectura_id = l.lectura_id
  AND l.foto_url IS NOT NULL
  AND ot.evidencia_foto_url IS NULL;

ALTER TABLE lecturas DROP COLUMN foto_url;
