// Feature flags for the demo. Each flag has the same behaviour:
//   - explicit "true" or "false" wins
//   - otherwise: enabled in development, DISABLED in production
//
// The asymmetric default is intentional: missing config in dev shouldn't
// break local work, but missing config in production should be a closed door
// (so a forgotten env var doesn't accidentally expose the demo to the world).

function readFlag(value: string | undefined): boolean {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return process.env.NODE_ENV !== 'production';
}

export function isDemoEnabled(): boolean {
  return readFlag(process.env.DEMO_ENABLED);
}

export function isSignupEnabled(): boolean {
  return readFlag(process.env.SIGNUP_ENABLED);
}
