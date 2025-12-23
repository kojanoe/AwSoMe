export interface ConsentData {
  sessionId: string;      // UUID
  hasConsented: boolean;  // true/false
  timestamp: number;      // timestamp
}

export function saveConsent(sessionId: string): void {
  const consent: ConsentData = {
    sessionId,
    hasConsented: true,
    timestamp: Date.now()
  };
  
  localStorage.setItem(`consent-${sessionId}`, JSON.stringify(consent));
}

export function getConsent(sessionId: string): ConsentData | null {
  const stored = localStorage.getItem(`consent-${sessionId}`);
  if (!stored) return null;
  return JSON.parse(stored);
}