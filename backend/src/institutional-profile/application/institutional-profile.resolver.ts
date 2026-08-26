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

interface CacheEntry {
  context: InstitutionalDocumentContext;
  expiresAt: number;
}

@Injectable()
export class InstitutionalProfileResolver {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly inFlightResolutions = new Map<
    string,
    Promise<InstitutionalDocumentContext>
  >();
  private readonly ttlMs = 5 * 60 * 1000; // 5 minutes

  constructor(
    private readonly profiles: InstitutionalProfileQueryPort,
    private readonly assets: InstitutionalAssetPort,
  ) {}

  clearCache(): void {
    this.cache.clear();
    this.inFlightResolutions.clear();
  }

  async resolve(at: Date): Promise<InstitutionalDocumentContext> {
    const bucket = Math.floor(at.getTime() / this.ttlMs);
    const key = `${at.toISOString().slice(0, 10)}:${bucket}`;
    const now = Date.now();

    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > now) {
      return cached.context;
    }

    const inFlight = this.inFlightResolutions.get(key);
    if (inFlight) {
      return inFlight;
    }

    const resolutionPromise = this.resolveInternal(at)
      .then((context) => {
        this.cache.set(key, { context, expiresAt: Date.now() + this.ttlMs });
        this.inFlightResolutions.delete(key);
        return context;
      })
      .catch((err) => {
        this.inFlightResolutions.delete(key);
        throw err;
      });

    this.inFlightResolutions.set(key, resolutionPromise);
    return resolutionPromise;
  }

  private async resolveInternal(
    at: Date,
  ): Promise<InstitutionalDocumentContext> {
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
