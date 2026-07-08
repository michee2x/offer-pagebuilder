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

  // Claude Sonnet 4.6 with the output-128k-2025-02-19 beta header supports
  // up to 128K output tokens. Cap at 64000 as a safety ceiling.
  maxOutputTokens = Math.min(maxOutputTokens, 64000);

  return { temperature, maxOutputTokens };
}
