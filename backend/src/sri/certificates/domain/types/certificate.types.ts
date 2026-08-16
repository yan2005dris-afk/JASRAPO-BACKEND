export interface CertificateInfo {
  name: string;
  size: number;
  createdAt: Date;
  modifiedAt: Date;
}

export interface CertificateSubject {
  commonName: string;
  organization: string;
  country: string;
}

export interface CertificateIssuer {
  commonName: string;
  organization: string;
}

export interface CertificateValidation {
  isValid: boolean;
  isExpired: boolean;
  isNotYetValid: boolean;
  expiryDate: Date;
  startDate: Date;
  daysUntilExpiry: number;
  subject: CertificateSubject;
  issuer: CertificateIssuer;
  reason?: string;
  warning?: string;
}

export interface ExtractedCertInfo {
  subject: CertificateSubject;
  issuer: CertificateIssuer;
  validity: {
    notBefore: Date;
    notAfter: Date;
  };
  serialNumber: string;
  isExpired: boolean;
  daysUntilExpiry: number;
}
