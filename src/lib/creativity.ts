export type CreativityLevel = "Standard" | "Creative" | "Maximum";

interface CreativityParams {
  temperature: number;
  maxOutputTokens: number;
}

export function getCreativityParams(
  level: CreativityLevel | string | undefined,
  baseTokens: number
): CreativityParams {
  // Normalize string if needed, default to "Standard"
  const normalizedLevel = (level as CreativityLevel) || "Standard";

  let temperature = 0.7;
  let maxOutputTokens = baseTokens;

  switch (normalizedLevel) {
    case "Maximum":
      temperature = 0.9;
      maxOutputTokens = Math.floor(baseTokens * 2.0);
      break;
    case "Creative":
      temperature = 0.8;
      maxOutputTokens = Math.floor(baseTokens * 1.5);
      break;
    case "Standard":
    default:
      temperature = 0.7;
      maxOutputTokens = baseTokens;
      break;
  }

  // Claude 3.5 Sonnet has a hard limit of 8192 output tokens
  // Exceeding this causes the API to either error or truncate the response,
  // resulting in incomplete/unparsed JSON bugs.
  maxOutputTokens = Math.min(maxOutputTokens, 8192);

  return { temperature, maxOutputTokens };
}
