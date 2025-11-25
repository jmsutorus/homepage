import { remoteConfig } from "@/lib/firebase/admin";

export async function getFeatureFlag(key: string, defaultValue: boolean = false): Promise<boolean> {
  try {
    const template = await remoteConfig.getTemplate();
    const parameter = template.parameters[key];

    if (!parameter || !parameter.defaultValue) {
      return defaultValue;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (parameter.defaultValue as any).value;
    return value === "true";
  } catch (error) {
    console.error(`Error fetching feature flag ${key}:`, error);
    return defaultValue;
  }
}

export async function getFeatureFlagString(key: string, defaultValue: string = ""): Promise<string> {
  try {
    const template = await remoteConfig.getTemplate();
    const parameter = template.parameters[key];

    if (!parameter || !parameter.defaultValue) {
      return defaultValue;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (parameter.defaultValue as any).value || defaultValue;
  } catch (error) {
    console.error(`Error fetching feature flag ${key}:`, error);
    return defaultValue;
  }
}
