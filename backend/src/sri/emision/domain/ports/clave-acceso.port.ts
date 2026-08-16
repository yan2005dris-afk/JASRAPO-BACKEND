import { ClaveAccesoData } from '../interfaces';

export abstract class ClaveAccesoPort {
  abstract generate(data: ClaveAccesoData): string;
  abstract validate(claveAcceso: string): boolean;
  abstract parse(claveAcceso: string): ClaveAccesoData | null;
}
