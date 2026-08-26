export interface InstitutionalAssetReference {
  contenedor: string;
  clave: string;
  tipoContenido: string;
}

export interface InstitutionalLocation {
  localidad: string;
  parroquia: string;
  canton: string;
  provincia: string;
  pais: string;
}

export interface InstitutionalPhone {
  etiqueta: string;
  numero: string;
}

export interface InstitutionalRepresentative {
  nombres: string;
  identificacion: string;
  cargo: string;
  esPrincipal: boolean;
}

export interface PaymentAgreementLegalTexts {
  introduccionOficina: string;
  compromisoUsuario: string;
  identificacionUsuario: string;
  cuotasMensuales: string;
  inicioConvenio: string;
  cumplimiento: string;
  pagoEfectivo: string;
  pagosPosteriores: string;
  primeraCuota: string;
  cierre: string;
}

export interface ResponsibilityAgreementLegalTexts {
  introduccionOficina: string;
  compromisoUsuario: string;
  clausulas: readonly string[];
  cierre: string;
}

export interface InstitutionalLegalTexts {
  convenioPago: PaymentAgreementLegalTexts;
  actaResponsabilidad: ResponsibilityAgreementLegalTexts;
}

export interface InstitutionalProfile {
  perfilInstitucionalId: bigint;
  version: string;
  vigenteDesde: Date;
  vigenteHasta: Date | null;
  nombreLegal: string;
  nombreComercial: string;
  siglas: string;
  ruc: string;
  decretoNumero: string | null;
  decretoFecha: Date | null;
  registroOficialNumero: string | null;
  registroOficialFecha: Date | null;
  fechaFundacion: Date | null;
  direccion: string;
  ubicacion: InstitutionalLocation;
  correo: string;
  telefonos: readonly InstitutionalPhone[];
  representantes: readonly InstitutionalRepresentative[];
  logoReferencia: InstitutionalAssetReference;
  marcaAguaReferencia: InstitutionalAssetReference;
  textosLegales: InstitutionalLegalTexts;
}

export interface ResolvedInstitutionalAsset extends InstitutionalAssetReference {
  url: string;
}

export interface InstitutionalDocumentModel extends Omit<
  InstitutionalProfile,
  'perfilInstitucionalId' | 'logoReferencia' | 'marcaAguaReferencia'
> {
  perfilInstitucionalId: string;
  decretoFechaTexto: string | null;
  registroOficialFechaTexto: string | null;
  fechaFundacionTexto: string | null;
  representantePrincipal: InstitutionalRepresentative;
  branding: {
    logo: ResolvedInstitutionalAsset;
    marcaAgua: ResolvedInstitutionalAsset;
  };
}

export interface InstitutionalProfileMetadata {
  perfilInstitucionalId: string;
  version: string;
  vigenteDesde: string;
  vigenteHasta: string | null;
}

export interface InstitutionalDocumentContext {
  institucion: InstitutionalDocumentModel;
  metadatosDocumento: {
    perfilInstitucional: InstitutionalProfileMetadata;
  };
}

export type OfficialDocument<TDocument extends object> = TDocument &
  InstitutionalDocumentContext;
