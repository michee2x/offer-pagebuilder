import { motion } from "framer-motion";
import { CreativityLevel } from "@/lib/creativity";

interface CreativitySelectionProps {
  selectedLevel: CreativityLevel;
  onSelect: (level: CreativityLevel) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function CreativitySelection({
  selectedLevel,
  onSelect,
  onGenerate,
  isGenerating,
}: CreativitySelectionProps) {
  const levels: {
    id: CreativityLevel;
    title: string;
    description: string;
    features: string[];
  }[] = [
    {
      id: "Standard",
      title: "Standard",
      description: "Balanced and efficient generation.",
      features: [
        "Standard token limits",
        "Predictable structure",
        "Best for straightforward offers",
      ],
    },
    {
      id: "Creative",
      title: "Creative",
      description: "More dynamic and expressive copy.",
      features: [
        "1.5x token limits",
        "Higher variance in ideas",
        "Great for engaging narratives",
      ],
    },
    {
      id: "Maximum",
      title: "Maximum",
      description: "The most comprehensive AI capabilities.",
      features: [
        "2x token limits",
        "Deeply nuanced and highly persuasive",
        "Maximum system resources",
      ],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2 mb-4">
        <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white">
          Select Campaign Creativity
        </h2>
        <p className="text-slate-400 text-[15px] leading-relaxed">
          Choose how the AI should generate your funnel, sales copy, and email sequences. Higher levels use more system tokens to produce richer, more detailed outputs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {levels.map((level) => (
          <button
            key={level.id}
            onClick={() => onSelect(level.id)}
            className={`
              relative p-6 rounded-[20px] text-left transition-all duration-300
              ${
                selectedLevel === level.id
                  ? "bg-white/[0.08] border-white/20 shadow-lg"
                  : "bg-[#111111] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
              }
              border
            `}
          >
            {selectedLevel === level.id && (
              <motion.div
                layoutId="creativity-glow"
                className="absolute inset-0 rounded-[20px] shadow-[0_0_20px_rgba(255,255,255,0.05)] pointer-events-none"
              />
            )}
            
            <div className="relative z-10">
              <h3 className="text-xl font-medium text-white mb-2">{level.title}</h3>
              <p className="text-sm text-slate-400 mb-4 min-h-[40px]">{level.description}</p>
              
              <ul className="space-y-2">
                {level.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-slate-300">
                    <svg className="w-4 h-4 text-white/40 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="bg-white text-black hover:bg-white/90 px-8 py-3.5 rounded-full font-medium text-sm transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isGenerating ? "Generating Report..." : "Generate Campaign Report"}
          {!isGenerating && (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          )}
        </button>
      </div>
    </motion.div>
  );
}
