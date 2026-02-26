import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

// When running outside Base44 (e.g. on Render), use the full Base44 server URL
const serverUrl = import.meta.env.VITE_BASE44_SERVER_URL || '';

export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl,
  requiresAuth: false,
  appBaseUrl
});
