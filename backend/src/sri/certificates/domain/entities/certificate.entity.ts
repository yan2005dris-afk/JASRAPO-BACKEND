import {
  CertificateSubject,
  CertificateIssuer,
} from '../types/certificate.types';

export class CertificateEntity {
  name: string;
  size: number;
  createdAt: Date;
  modifiedAt: Date;
  path?: string;
  subject?: CertificateSubject;
  issuer?: CertificateIssuer;
  expiryDate?: Date;
  startDate?: Date;
  daysUntilExpiry?: number;
  isExpired?: boolean;

  constructor(partial: Partial<CertificateEntity>) {
    Object.assign(this, partial);
  }

  isVigente(): boolean {
    if (!this.expiryDate) return true;
    return new Date() <= new Date(this.expiryDate);
  }

  isNearExpiry(thresholdDays: number = 30): boolean {
    if (this.daysUntilExpiry === undefined) return false;
    return this.daysUntilExpiry <= thresholdDays && this.daysUntilExpiry >= 0;
  }
}
