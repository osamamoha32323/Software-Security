export type SecurityMode = 'secure' | 'naive';

export interface SecurityLog {
  id: string;
  timestamp: string;
  attackType: string;
  payload: string;
  blocked: boolean;
  mode: SecurityMode;
  details: string;
}

export interface SecurityCoverageItem {
  id: string;
  topic: string;
  attackScenario: string;
  rootCause: string;
  defenseImplemented: string;
  codeLocation: string;
  evidence: string;
  status: 'protected' | 'simulated_vulnerable';
  testPayload?: string;
}
