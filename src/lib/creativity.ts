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

  switch (normalizedLevel) {
    case "Maximum":
      return {
        temperature: 1.0,
        maxOutputTokens: Math.floor(baseTokens * 2.0),
      };
    case "Creative":
      return {
        temperature: 0.85,
        maxOutputTokens: Math.floor(baseTokens * 1.5),
      };
    case "Standard":
    default:
      return {
        temperature: 0.7,
        maxOutputTokens: baseTokens,
      };
  }
}
