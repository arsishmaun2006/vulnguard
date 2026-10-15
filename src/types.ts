export type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Secure';

export type VerificationMethod = 'verification_code' | 'meta_tag' | 'dns_txt';

export interface Website {
  id: string;
  domain: string; // e.g., "example.com" or "https://example.com"
  verified: boolean;
  verificationToken: string;
  verificationMethod: VerificationMethod;
  createdAt: string;
}

export interface Vulnerability {
  id: string;
  title: string;
  severity: Severity;
  description: string;
  recommendation: string;
  aiExplanation?: {
    summary: string;
    riskDetails: string;
    stepByStepRemediation: string;
    secureCodeExample?: string;
  };
  owaspCategory: string; // e.g., "A01:2021-Broken Access Control"
  affectedUrl?: string;
  confidence: 'High' | 'Medium' | 'Low';
}

export interface Scan {
  id: string;
  websiteId: string;
  scanDate: string;
  status: 'Pending' | 'Scanning' | 'Completed' | 'Failed';
  securityScore: number;
  vulnerabilities: Vulnerability[];
  scanType: 'passive' | 'active' | 'both';
}
