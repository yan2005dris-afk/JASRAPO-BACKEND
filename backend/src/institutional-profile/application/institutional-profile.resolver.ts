import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type {
  InstitutionalDocumentContext,
  InstitutionalDocumentModel,
  OfficialDocument,
} from '../domain/institutional-profile.types';
import {
  InstitutionalAssetPort,
  InstitutionalProfileQueryPort,
} from './ports/institutional-profile.ports';

@Injectable()
export class InstitutionalProfileResolver {
  constructor(
    private readonly profiles: InstitutionalProfileQueryPort,
    private readonly assets: InstitutionalAssetPort,
  ) {}

  async resolve(at: Date): Promise<InstitutionalDocumentContext> {
    const matches = await this.profiles.findValidAt(at);
    if (matches.length === 0) {
      throw new NotFoundException(
        `No existe un perfil institucional vigente para ${at.toISOString()}`,
      );
    }
    if (matches.length > 1) {
      throw new ConflictException(
        `Existe más de un perfil institucional vigente para ${at.toISOString()}`,
      );
    }

    const profile = matches[0];
    const primaryRepresentatives = profile.representantes.filter(
      (item) => item.esPrincipal,
    );
    if (primaryRepresentatives.length !== 1) {
      throw new UnprocessableEntityException(
        `El perfil institucional ${profile.version} debe tener exactamente un representante principal`,
      );
    }
    const [logo, marcaAgua] = await Promise.all([
      this.assets.resolve(profile.logoReferencia),
      this.assets.resolve(profile.marcaAguaReferencia),
    ]);
    const {
      logoReferencia: _logoReferencia,
      marcaAguaReferencia: _marcaAguaReferencia,
      ...institutionalValues
    } = profile;
    const institucion: InstitutionalDocumentModel = {
      ...institutionalValues,
      perfilInstitucionalId: profile.perfilInstitucionalId.toString(),
      decretoFechaTexto: this.formatDate(profile.decretoFecha),
      registroOficialFechaTexto: this.formatDate(profile.registroOficialFecha),
      fechaFundacionTexto: this.formatDate(profile.fechaFundacion),
      representantePrincipal: primaryRepresentatives[0],
      branding: { logo, marcaAgua },
    };

    return {
      institucion,
      metadatosDocumento: {
        perfilInstitucional: {
          perfilInstitucionalId: institucion.perfilInstitucionalId,
          version: profile.version,
          vigenteDesde: profile.vigenteDesde.toISOString(),
          vigenteHasta: profile.vigenteHasta?.toISOString() ?? null,
        },
      },
    };
  }

  attach<TDocument extends object>(
    document: TDocument,
    context: InstitutionalDocumentContext,
  ): OfficialDocument<TDocument> {
    return { ...document, ...context };
  }

  private formatDate(value: Date | null): string | null {
    if (!value) return null;
    return value.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
  }
}
