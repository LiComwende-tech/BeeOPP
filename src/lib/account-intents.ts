export const ACCOUNT_INTENTS = [
  { value: "seeker", label: "I’m looking for opportunities" },
  { value: "employer", label: "I’m hiring" },
  { value: "service_provider", label: "I want to offer my services" },
] as const;

export type AccountIntent = (typeof ACCOUNT_INTENTS)[number]["value"];

export function isAccountIntent(value: string): value is AccountIntent {
  return ACCOUNT_INTENTS.some((intent) => intent.value === value);
}
