import Conf from "conf";

interface ConfigSchema {
  apiKey?: string;
}

export const config = new Conf<ConfigSchema>({
  projectName: "kwery",
});

export function getApiKey(): string {
  const envKey = process.env.KWERY_API_KEY;
  if (envKey) return envKey;

  const storedKey = config.get("apiKey");
  if (storedKey) return storedKey as string;

  console.error("No API key found. Run: kwery login <api-key>");
  process.exit(1);
}
