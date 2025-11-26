import { SquareClient, SquareEnvironment } from 'square';
import { ConfigurationError } from '@/lib/api/errors';

// Environment variable names we need for Square
const SQUARE_ENV_VARS = {
  ACCESS_TOKEN: 'SQUARE_ACCESS_TOKEN',
  ENVIRONMENT: 'SQUARE_ENVIRONMENT',
  LOCATION_ID: 'SQUARE_LOCATION_ID',
} as const;

// Only create the client once (lazy initialization)
let _squareClient: SquareClient | null = null;

// Figure out which Square environment to use
function getSquareEnvironment(): SquareEnvironment {
  const env = process.env.SQUARE_ENVIRONMENT;
  if (env === 'production') {
    return SquareEnvironment.Production;
  }
  // Default to sandbox for safety
  return SquareEnvironment.Sandbox;
}

// Create the Square client if it doesn't exist yet
function getSquareClient(): SquareClient {
  if (_squareClient) {
    return _squareClient;
  }

  const accessToken = process.env[SQUARE_ENV_VARS.ACCESS_TOKEN];
  const environment = getSquareEnvironment();

  if (!accessToken) {
    throw new ConfigurationError(
      `${SQUARE_ENV_VARS.ACCESS_TOKEN} environment variable is not set`
    );
  }

  _squareClient = new SquareClient({
    token: accessToken,
    environment,
  });

  return _squareClient;
}

// Public function to get the client
export function getClient(): SquareClient {
  return getSquareClient();
}

// Proxy for backward compatibility - only initializes when actually used
export const squareClient = new Proxy({} as SquareClient, {
  get(_target, prop) {
    try {
      return getSquareClient()[prop as keyof SquareClient];
    } catch (error) {
      // Give a helpful error if someone tries to use the API before it's configured
      if (typeof prop === 'string' && prop.endsWith('Api')) {
        return new Proxy({}, {
          get() {
            throw new ConfigurationError(
              'Square API is not configured. Please set SQUARE_ACCESS_TOKEN, SQUARE_ENVIRONMENT, and SQUARE_LOCATION_ID environment variables.'
            );
          }
        });
      }
      throw error;
    }
  },
});

// Check if all the required Square env vars are set
export function isSquareConfigured(): boolean {
  return !!(
    process.env[SQUARE_ENV_VARS.ACCESS_TOKEN] &&
    process.env[SQUARE_ENV_VARS.ENVIRONMENT] &&
    process.env[SQUARE_ENV_VARS.LOCATION_ID]
  );
}

// Get the location ID, throw if it's missing
export function getLocationId(): string {
  const locationId = process.env[SQUARE_ENV_VARS.LOCATION_ID];
  if (!locationId) {
    throw new ConfigurationError(
      `${SQUARE_ENV_VARS.LOCATION_ID} environment variable is not set`
    );
  }
  return locationId;
}

// Throw an error if Square isn't configured (useful for early validation)
export function requireSquareConfig(): void {
  if (!isSquareConfigured()) {
    throw new ConfigurationError(
      'Square API is not configured. Please set SQUARE_ACCESS_TOKEN, SQUARE_ENVIRONMENT, and SQUARE_LOCATION_ID environment variables.'
    );
  }
}

