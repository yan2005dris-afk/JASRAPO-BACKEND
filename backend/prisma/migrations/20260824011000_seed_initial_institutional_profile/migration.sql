INSERT INTO "perfiles_institucionales" (
    "version",
    "vigente_desde",
    "nombre_legal",
    "nombre_comercial",
    "siglas",
    "ruc",
    "decreto_numero",
    "registro_oficial_numero",
    "registro_oficial_fecha",
    "fecha_fundacion",
    "direccion",
    "ubicacion",
    "correo",
    "telefonos",
    "representantes",
    "logo_referencia",
    "marca_agua_referencia",
    "textos_legales"
) VALUES (
    'v1',
    '1970-01-01T00:00:00.000Z',
    'Junta Administradora del Sistema Regional de Agua Potable',
    'OLÓN',
    'JASRAPO',
    '2490016050001',
    '3327',
    '802',
    '1979-03-29',
    '1982-09-11',
    'Av. Santa Lucía e Intiñan (esquina)',
    jsonb_build_object(
        'localidad', 'Olón',
        'parroquia', 'Colonche',
        'canton', 'Santa Elena',
        'provincia', 'Santa Elena',
        'pais', 'Ecuador'
    ),
    'juntaaguaolon2017@yahoo.com',
    jsonb_build_array(
        jsonb_build_object('etiqueta', 'Teléfono', 'numero', '2788051'),
        jsonb_build_object('etiqueta', 'Presidencia', 'numero', '0983717499'),
        jsonb_build_object('etiqueta', 'Tesorería', 'numero', '0999896280'),
        jsonb_build_object('etiqueta', 'Secretaría', 'numero', '0998945560')
    ),
    jsonb_build_array(
        jsonb_build_object(
            'nombres', 'Sr. Humberto Salinas Neira',
            'identificacion', '0915233670',
            'cargo', 'Representante JASRAPO',
            'esPrincipal', true
        )
    ),
    jsonb_build_object(
        'contenedor', 'institutional-assets',
        'clave', 'profiles/v1/logo.jpeg',
        'tipoContenido', 'image/jpeg'
    ),
    jsonb_build_object(
        'contenedor', 'institutional-assets',
        'clave', 'profiles/v1/logo.jpeg',
        'tipoContenido', 'image/jpeg'
    ),
    jsonb_build_object(
        'convenioPago', jsonb_build_object(
            'introduccionOficina', 'En las oficinas de la Junta del Sistema Regional de Agua Potable Olón a los',
            'compromisoUsuario', 'se realiza el presente convenio donde se compromete el usuario de la guía',
            'identificacionUsuario', 'a nombre del Sr(a)',
            'cuotasMensuales', 'comprometiéndose a cancelar en cuotas',
            'inicioConvenio', 'mensuales más el consumo generado por meses consecutivos, convenio que rige a partir del periodo',
            'cumplimiento', 'Al dar fiel cumplimiento a lo acordado.',
            'pagoEfectivo', 'Las cuotas se cancelan en efectivo a partir de',
            'pagosPosteriores', 'en adelante y así los meses posteriores hasta cancelar la deuda de',
            'primeraCuota', 'Comprometiéndose a cancelar la primera cuota de',
            'cierre', 'Atentamente'
        ),
        'actaResponsabilidad', jsonb_build_object(
            'introduccionOficina', 'En las oficinas de la Junta Administradora del Sistema Regional de Agua Potable Olón',
            'compromisoUsuario', 'en mi calidad de usuario, asumo el compromiso de cumplir con lo establecido en la Institución:',
            'clausulas', jsonb_build_array(
                'No utilizar el Agua para otros fines, ya que es mi obligación priorizar el líquido vital para el consumo humano en esta época de escasez (Emergencia Hídrica) como lo manda la Ley Orgánica de Recursos Hídricos Uso y Aprovechamiento del Agua en su Artículo # 86 de los Usos del Agua cuya prioridad A es para el Consumo Humano.',
                'En caso de no cumplir la Junta Administradora del Sistema Regional de Agua Potable "Olón" tiene la potestad de sancionar y reflejar en las planillas sin previa notificación.',
                'No obstruir, manipular, ni mover el medidor de la ubicación respectiva sin previo aviso evitando ser sancionado por infracciones por la Junta Administradora del Sistema Regional de Agua Potable "Olón".',
                'No proveer del líquido vital a terceros ya que cada medidor es para un solo domicilio.',
                'Por morosidad durante un año perderá los derechos de usuario, se retirará el medidor y a futuro que desee solicitar una nueva guía deberá cancelar el valor adeudado que refleja en el sistema para de esta manera proceder con los trámites de rigor para la obtención del nuevo medidor.'
            ),
            'cierre', 'Este compromiso se asume para su cumplimiento dentro de las leyes y reglamentos internos de la Junta y garantía del uso del agua.'
        )
    )
)
ON CONFLICT ("version") DO NOTHING;

COMMENT ON COLUMN "perfiles_institucionales"."version" IS
    'El perfil v1 conserva el documento legal canónico aprobado en PDF-03; una corrección oficial requiere una nueva versión.';
