import type { InstitutionalDocumentContext } from 'src/institutional-profile/domain/institutional-profile.types';
import type { OfficialDocument } from 'src/institutional-profile/domain/institutional-profile.types';
import type { ProjectedReport } from './report-projection';

export function attachInstitutionalProfile<TDocument extends object>(
  projection: ProjectedReport<TDocument>,
  institutional: InstitutionalDocumentContext,
): ProjectedReport<OfficialDocument<TDocument>> {
  return {
    ...projection,
    document: { ...projection.document, ...institutional },
  };
}
