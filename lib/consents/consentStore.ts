export interface ConsentData {
  sessionId: string;
  hasConsented: boolean;
  timestamp: number;
}

/**
 * Check consent from server (async)
 */
export async function getConsent(sessionId: string): Promise<ConsentData | null> {
  try {
    const response = await fetch(`/api/consent?sessionId=${sessionId}`);
    
    if (!response.ok) {
      return null;
    }
    
    const consent: ConsentData = await response.json();
    return consent.hasConsented ? consent : null;
  } catch (error) {
    console.error('Failed to check consent:', error);
    return null;
  }
}

/**
 * Note: Consent is now saved server-side during upload.
 * This function is kept for backward compatibility but does nothing.
 */
export function saveConsent(sessionId: string): void {
  // Consent is saved server-side during upload in upload-files/route.ts
  console.log('Consent saved server-side for session:', sessionId);
}