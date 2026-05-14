const REQUIRED_PUBLIC_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
];

const REQUIRED_SERVER_KEYS = ["SUPABASE_SERVICE_ROLE_KEY"];

function readRequiredEnv(key) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export function getSupabasePublicEnv() {
  return {
    url: readRequiredEnv(REQUIRED_PUBLIC_KEYS[0]),
    publishableKey: readRequiredEnv(REQUIRED_PUBLIC_KEYS[1])
  };
}

export function getSupabaseServerEnv() {
  return {
    ...getSupabasePublicEnv(),
    serviceRoleKey: readRequiredEnv(REQUIRED_SERVER_KEYS[0])
  };
}

export const supabaseEnvSchema = {
  public: REQUIRED_PUBLIC_KEYS,
  server: REQUIRED_SERVER_KEYS
};
