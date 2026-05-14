"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ChevronLeft } from "lucide-react";
import {
  OfferFormData,
  TrafficChannel,
  CurrencyCode,
} from "@/lib/offer-types";

// Modular Components
import { CampaignPathSelection } from "@/components/onboarding/CampaignPathSelection";
import { OfferAnalysisForm } from "@/components/onboarding/OfferAnalysisForm";
import { IdeaGenerationWizard } from "@/components/onboarding/IdeaGenerationWizard";
import { OnboardingLoading } from "@/components/onboarding/OnboardingLoading";

type CurrentStep = "path" | "form" | "B1" | "B2" | "B3" | "loading";

interface GeneratedIdea {
  title: string;
  description: string;
  demand: string;
  competition: string;
  fit: string;
}

const DEMO_FORM_DATA: OfferFormData = {
  field_1_name: "Social Media Growth Course for Entrepreneurs",
  field_1_format: "course",
  field_2_outcome:
    "Helps Nigerian small business owners get 10+ leads a week from Instagram and TikTok without paying for ads, using organic growth strategies.",
  field_3_persona:
    "Female entrepreneurs aged 25-45 running online businesses (e-commerce, services) in Nigeria, Ghana, and Kenya who want consistent leads",
  field_4_price: "49",
  field_4_currency: "USD",
  field_4_upsell: "VIP mentorship program at $299/month with 1-on-1 calls",
  field_5_proof:
    "5000+ engaged Instagram followers, worked with 50+ clients, 92% course completion rate, featured on Entrepreneur.ng",
  field_6_mechanism:
    "Proprietary 7-day content framework combined with our unique relationship-building formula that converts followers to customers",
  field_7_channels: ["Meta Ads", "Organic Social", "Email List"],
  field_7_detail:
    "Running Facebook/Instagram ads targeting women 25-45 in Nigeria interested in business growth; organic posts 3x weekly; weekly email campaigns",
  field_8_challenge:
    "Getting consistent leads, building credibility in the market, managing time while scaling",
};

export default function AnalyzePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const workspaceId = searchParams.get("workspace");

  const [currentStep, setCurrentStep] = useState<CurrentStep>("path");
  const [hasIdea, setHasIdea] = useState<boolean | null>(null);
  const [formData, setFormData] = useState<OfferFormData>({
    field_1_name: "",
    field_1_format: "course",
    field_2_outcome: "",
    field_3_persona: "",
    field_4_price: "",
    field_4_currency: "USD",
    field_4_upsell: "",
    field_5_proof: "",
    field_6_mechanism: "",
    field_7_channels: [],
    field_7_detail: "",
    field_8_challenge: "",
  });
  const [selectedChannels, setSelectedChannels] = useState<TrafficChannel[]>(
    [],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Path B state
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");
  const [audienceTypes, setAudienceTypes] = useState<string[]>([]);
  const [bCountry, setBCountry] = useState("");
  const [bCurrency, setBCurrency] = useState<CurrencyCode>("USD");
  const [budget, setBudget] = useState("");
  const [generatedIdeas, setGeneratedIdeas] = useState<GeneratedIdea[]>([]);
  const [pickedIdea, setPickedIdea] = useState(-1);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      if (!workspaceId) {
        router.push("/");
        return;
      }
    };

    checkAuth();
  }, [router, supabase, workspaceId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.field_1_name.trim()) {
      newErrors.field_1_name = "Product name is required";
    }
    if (!formData.field_1_format) {
      newErrors.field_1_format = "Offer format is required";
    }
    if (!formData.field_2_outcome.trim()) {
      newErrors.field_2_outcome = "Outcome is required";
    }
    if (!formData.field_3_persona.trim()) {
      newErrors.field_3_persona = "Ideal customer description is required";
    }
    if (!formData.field_4_price.trim()) {
      newErrors.field_4_price = "Price is required";
    }
    if (!formData.field_4_currency) {
      newErrors.field_4_currency = "Currency is required";
    }
    if (!formData.field_5_proof.trim()) {
      newErrors.field_5_proof = "Proof/credentials are required";
    }
    if (!formData.field_6_mechanism.trim()) {
      newErrors.field_6_mechanism = "Unique mechanism is required";
    }
    if (selectedChannels.length === 0) {
      newErrors.field_7_channels = "Select at least one traffic channel";
    }
    if (!formData.field_7_detail.trim()) {
      newErrors.field_7_detail = "Traffic detail is required";
    }
    if (!formData.field_8_challenge.trim()) {
      newErrors.field_8_challenge = "Primary challenge is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChannelToggle = (channel: TrafficChannel) => {
    setSelectedChannels((prev) => {
      if (prev.includes(channel)) {
        return prev.filter((c) => c !== channel);
      }
      return [...prev, channel];
    });
  };

  const handleSubmit = async () => {
    let submitData: OfferFormData;

    if (hasIdea) {
      // Path A: Use the unified form data
      if (!validateForm()) return;
      submitData = {
        ...formData,
        field_7_channels: selectedChannels,
      };
    } else {
      // Path B: Map selected idea to form data
      const selectedIdea = generatedIdeas[pickedIdea];
      submitData = {
        field_1_name: selectedIdea.title,
        field_1_format: "course", // Default
        field_2_outcome: selectedIdea.description,
        field_3_persona: audienceTypes.join(", "),
        field_4_price: budget.includes("$")
          ? budget.split(" - ")[0].replace("$", "")
          : "50", // Extract price
        field_4_currency: bCurrency,
        field_4_upsell: "",
        field_5_proof: "",
        field_6_mechanism: "",
        field_7_channels: [],
        field_7_detail: "",
        field_8_challenge: "",
      };
    }

    if (!workspaceId) return;

    setIsSubmitting(true);
    setCurrentStep("loading");

    try {
      const response = await fetch("/api/offer-intelligence/call1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData: submitData,
          workspaceId,
          hasIdea,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      const funnelId = response.headers.get("X-Funnel-Id");
      if (funnelId) {
        router.push(`/intelligence/${funnelId}`);
      } else {
        throw new Error("No funnel ID returned");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({ submit: "Failed to submit. Please try again." });
      setCurrentStep(hasIdea ? "form" : "B3");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePathSelect = (idea: boolean) => {
    setHasIdea(idea);
    setCurrentStep(idea ? "form" : "B1");
    setErrors({});
  };

  const fillDemoData = () => {
    setFormData(DEMO_FORM_DATA);
    setSelectedChannels(DEMO_FORM_DATA.field_7_channels);
    setErrors({});
  };

  // Path B functions
  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  const toggleAudience = (aud: string) => {
    setAudienceTypes((prev) =>
      prev.includes(aud) ? prev.filter((a) => a !== aud) : [...prev, aud],
    );
  };

  const generateIdeas = async () => {
    setIsGenerating(true);
    setPickedIdea(-1);
    setGeneratedIdeas([]);
    setErrors({});

    try {
      const response = await fetch("/api/offer-intelligence/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills,
          customSkill,
          audienceTypes,
          bCountry,
          bCurrency,
          budget,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Idea generation failed");
      }

      const payload = await response.json();
      setGeneratedIdeas(payload.ideas);
    } catch (error) {
      console.error("Error generating ideas:", error);
      setErrors({ submit: "Could not generate ideas. Please try again." });
    } finally {
      setIsGenerating(false);
    }
  };

  const goNext = () => {
    if (currentStep === "path") {
      if (hasIdea === null) {
        setErrors({ path: "Please select an option" });
        return;
      }
      setCurrentStep(hasIdea ? "form" : "B1");
    } else if (currentStep === "B1") {
      if (skills.length === 0 && !customSkill.trim()) {
        setErrors({
          skills: "Please select at least one skill or describe your strength",
        });
        return;
      }
      setCurrentStep("B2");
      setErrors({});
    } else if (currentStep === "B2") {
      if (audienceTypes.length === 0 || !bCountry || !bCurrency || !budget) {
        setErrors({
          audienceTypes:
            audienceTypes.length === 0
              ? "Please select at least one audience type"
              : "",
        });
        return;
      }
      setCurrentStep("B3");
      generateIdeas();
      setErrors({});
    } else if (currentStep === "B3") {
      if (pickedIdea === -1) {
        setErrors({ pickedIdea: "Please select an idea" });
        return;
      }
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep === "form" || currentStep === "B1") {
      setCurrentStep("path");
      setHasIdea(null);
      setErrors({});
    } else if (currentStep === "B2") {
      setCurrentStep("B1");
    } else if (currentStep === "B3") {
      setCurrentStep("B2");
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex flex-col items-center p-6 md:p-12 overflow-hidden relative">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 pointer-events-none"
        style={{ backgroundImage: "url('/gradients/form-gradient.jpg')" }}
      />
      
      {/* Overlay for better readability */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#0e0e0e]/20 via-transparent to-[#0e0e0e]/80 pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10">
        {currentStep !== "path" && currentStep !== "loading" && (
          <button
            onClick={handleBack}
            className="mb-10 flex items-center gap-2.5 text-[#555] hover:text-white transition group"
          >
            <div className="h-8 w-8 rounded-full border border-white/5 flex items-center justify-center group-hover:border-white/10 transition-all bg-[#1a1a1a]/50">
              <ChevronLeft className="h-4 w-4" />
            </div>
            <span className="text-[13px] font-semibold tracking-tight">Back</span>
          </button>
        )}

        <AnimatePresence mode="wait">
          {currentStep === "path" && (
            <CampaignPathSelection
              key="path"
              selectedPath={hasIdea}
              onSelect={handlePathSelect}
            />
          )}

          {currentStep === "form" && (
            <OfferAnalysisForm
              key="form"
              formData={formData}
              setFormData={setFormData}
              selectedChannels={selectedChannels}
              handleChannelToggle={handleChannelToggle}
              errors={errors}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              onFillDemo={fillDemoData}
            />
          )}

          {(currentStep === "B1" || currentStep === "B2" || currentStep === "B3") && (
            <IdeaGenerationWizard
              key="wizard"
              currentStep={currentStep}
              skills={skills}
              toggleSkill={toggleSkill}
              customSkill={customSkill}
              setCustomSkill={setCustomSkill}
              audienceTypes={audienceTypes}
              toggleAudience={toggleAudience}
              bCountry={bCountry}
              setBCountry={setBCountry}
              bCurrency={bCurrency}
              setBCurrency={setBCurrency}
              budget={budget}
              setBudget={setBudget}
              generatedIdeas={generatedIdeas}
              pickedIdea={pickedIdea}
              setPickedIdea={setPickedIdea}
              isGenerating={isGenerating}
              onNext={goNext}
              errors={errors}
            />
          )}

          {currentStep === "loading" && (
            <OnboardingLoading key="loading" />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
