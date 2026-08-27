import type {
  InstitutionalAssetReference,
  InstitutionalProfile,
  ResolvedInstitutionalAsset,
} from '../../domain/institutional-profile.types';

export abstract class InstitutionalProfileQueryPort {
  abstract findValidAt(at: Date): Promise<readonly InstitutionalProfile[]>;
}

export abstract class InstitutionalAssetPort {
  abstract resolve(
    reference: InstitutionalAssetReference,
  ): Promise<ResolvedInstitutionalAsset>;
}
