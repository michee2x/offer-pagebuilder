"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, Check } from "lucide-react";
import {
  OfferFormData,
  OfferFormat,
  TrafficChannel,
  CurrencyCode,
} from "@/lib/offer-types";

type CurrentStep = "path" | "form" | "B1" | "B2" | "B3" | "loading";

interface GeneratedIdea {
  title: string;
  description: string;
  demand: string;
  competition: string;
  fit: string;
}

const offerFormatOptions: OfferFormat[] = [
  "course",
  "coaching",
  "ebook",
  "saas",
  "physical",
  "membership",
  "agency",
  "consulting",
  "affiliate",
  "local",
];

const currencyOptions: CurrencyCode[] = [
  "USD",
  "GBP",
  "EUR",
  "AUD",
  "CAD",
  "NZD",
  "ZAR",
  "INR",
  "NGN",
  "GHS",
];

const trafficChannels: TrafficChannel[] = [
  "Meta Ads",
  "Google Ads",
  "YouTube Ads",
  "TikTok Ads",
  "LinkedIn Ads",
  "Email List",
  "Organic Social",
  "SEO / Blog",
  "Podcast",
  "Haven't started yet",
];

const skillsOptions = [
  "Social Media",
  "Writing & Content",
  "Graphic Design",
  "Teaching / Coaching",
  "Sales & Marketing",
  "Tech / Coding",
  "Finance & Accounting",
  "Health & Fitness",
  "Real Estate",
  "Video & Photography",
  "E-commerce",
  "Music & Arts",
];

const audienceOptions = [
  "Entrepreneurs",
  "Students",
  "Working Professionals",
  "Small Business Owners",
  "Creators & Influencers",
  "Stay-at-home Parents",
  "General / Anyone",
];

const countryOptions = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Other",
];

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
  const [bCurrency, setBCurrency] = useState("");
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
        field_1_format: "course", // Default, could be improved
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
      console.log("[analyze] Starting form submission", {
        hasIdea,
        workspaceId,
      });
      const response = await fetch("/api/offer-intelligence/call1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData: submitData,
          workspaceId,
          hasIdea,
        }),
      });

      console.log("[analyze] Response received", {
        status: response.status,
        ok: response.ok,
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      const funnelId = response.headers.get("X-Funnel-Id");
      console.log("[analyze] Extracted funnelId from headers:", funnelId);

      if (funnelId) {
        console.log("[analyze] Redirecting to intelligence page:", funnelId);
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

  const handleBack = () => {
    if (currentStep === "form") {
      setCurrentStep("path");
      setHasIdea(null);
      setErrors({});
    }
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
    console.log("[analyze] Starting idea generation", {
      skills,
      customSkill,
      audienceTypes,
      bCountry,
      bCurrency,
      budget,
    });
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

      console.log("[analyze] Ideas response received", {
        status: response.status,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[analyze] Ideas API error:", errorText);
        throw new Error(errorText || "Idea generation failed");
      }

      const payload = await response.json();
      console.log("[analyze] Ideas payload received:", payload);

      if (!Array.isArray(payload.ideas) || payload.ideas.length === 0) {
        throw new Error("No ideas were generated");
      }

      console.log("[analyze] Setting generated ideas:", payload.ideas.length);
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
          bCountry: !bCountry ? "Please select a country" : "",
          bCurrency: !bCurrency ? "Please select a currency" : "",
          budget: !budget ? "Please select a price range" : "",
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
    } else if (currentStep === "form") {
      handleSubmit();
    }
  };

  const goBack = () => {
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
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="relative">
          {currentStep !== "path" && (
            <button
              onClick={handleBack}
              className="absolute -top-16 left-0 flex items-center gap-2 text-slate-400 hover:text-white transition"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
          )}

          <div className="absolute -top-16 right-0">
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-black shadow-lg bg-white">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
          </div>

          <div className="content-shell w-full px-10 py-10 rounded-[32px] border border-white/10 bg-[#111111]/95 shadow-[0_30px_80px_rgba(0,0,0,0.3)]">
            <motion.div
              className="headline-container min-h-8 mb-10"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              key={`headline-${currentStep}`}
            >
              <h1 className="text-3xl font-semibold tracking-[-0.04em] leading-[1.1]">
                {currentStep === "path" && "Start your Offer intelligence flow"}
                {currentStep === "form" && "Tell us about your offer"}
                {currentStep === "B1" && "What are you good at?"}
                {currentStep === "B2" && "Who should this serve?"}
                {currentStep === "B3" && "Choose your best idea"}
                {currentStep === "loading" && "Building your report"}
              </h1>
            </motion.div>

            {currentStep === "loading" && (
              <div className="rounded-[28px] border border-white/10 bg-[#111111]/70 p-8 text-center">
                <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-white/10">
                  <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-orange-500"></div>
                </div>
                <h2 className="text-2xl font-semibold mb-3">
                  Building your report
                </h2>
                <p className="text-slate-400">
                  Running deep market intelligence on your offer...
                </p>
              </div>
            )}

            <AnimatePresence mode="wait">
              {currentStep === "path" && (
                <motion.div
                  key="path"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="rounded-[28px] border border-white/10 bg-[#111111]/70 p-6 space-y-4">
                    <div className="text-sm text-slate-400">
                      Choose how you want to begin your campaign.
                    </div>
                    <div className="grid gap-4">
                      {[
                        {
                          id: "yes",
                          label: "I have an idea",
                          description:
                            "Validate your existing offer and build a report from it.",
                        },
                        {
                          id: "no",
                          label: "I need an idea",
                          description:
                            "Generate a business idea and then build the intelligence report.",
                        },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handlePathSelect(item.id === "yes")}
                          className={`w-full rounded-[24px] border px-6 py-5 text-left transition ${
                            hasIdea === (item.id === "yes")
                              ? "border-orange-400 bg-orange-400/10"
                              : "border-white/10 bg-[#0E1019] hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <div className="text-base font-semibold text-white">
                                {item.label}
                              </div>
                              <p className="text-sm text-slate-400 mt-1">
                                {item.description}
                              </p>
                            </div>
                            {hasIdea === (item.id === "yes") ? (
                              <Check className="text-orange-400" />
                            ) : null}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === "form" && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="rounded-[28px] border border-white/10 bg-[#111111]/70 p-6 space-y-6">
                    {/* Demo Data Button */}
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={fillDemoData}
                        className="rounded-[16px] border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 text-xs"
                      >
                        Fill Demo Data
                      </Button>
                    </div>

                    {/* Field 1: Name */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Product / Service Name *
                      </label>
                      <Input
                        value={formData.field_1_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            field_1_name: e.target.value,
                          })
                        }
                        placeholder="e.g., Social Media Growth Course"
                        className="bg-[#111111] border-white/10 text-white"
                      />
                      {errors.field_1_name && (
                        <p className="mt-2 text-xs text-red-400">
                          {errors.field_1_name}
                        </p>
                      )}
                    </div>

                    {/* Field 1: Format */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Offer Format *
                      </label>
                      <Select
                        value={formData.field_1_format}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            field_1_format: value as OfferFormat,
                          })
                        }
                      >
                        <SelectTrigger className="bg-[#111111] border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {offerFormatOptions.map((format) => (
                            <SelectItem key={format} value={format}>
                              {format.charAt(0).toUpperCase() + format.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.field_1_format && (
                        <p className="mt-2 text-xs text-red-400">
                          {errors.field_1_format}
                        </p>
                      )}
                    </div>

                    {/* Field 2: Outcome */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        What does it do for your customer? *
                      </label>
                      <Textarea
                        value={formData.field_2_outcome}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            field_2_outcome: e.target.value,
                          })
                        }
                        placeholder="e.g., Helps Nigerian entrepreneurs get 10+ leads a week from Instagram without paying for ads"
                        className="bg-[#111111] border-white/10 text-white min-h-[100px]"
                      />
                      {errors.field_2_outcome && (
                        <p className="mt-2 text-xs text-red-400">
                          {errors.field_2_outcome}
                        </p>
                      )}
                    </div>

                    {/* Field 3: Persona */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Ideal Customer Description *
                      </label>
                      <Input
                        value={formData.field_3_persona}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            field_3_persona: e.target.value,
                          })
                        }
                        placeholder="e.g., Female entrepreneurs aged 28-42 running online boutiques"
                        className="bg-[#111111] border-white/10 text-white"
                      />
                      {errors.field_3_persona && (
                        <p className="mt-2 text-xs text-red-400">
                          {errors.field_3_persona}
                        </p>
                      )}
                    </div>

                    {/* Field 4: Price & Currency */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Price *
                        </label>
                        <Input
                          value={formData.field_4_price}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              field_4_price: e.target.value,
                            })
                          }
                          placeholder="e.g., 97 or 29/month"
                          className="bg-[#111111] border-white/10 text-white"
                        />
                        {errors.field_4_price && (
                          <p className="mt-2 text-xs text-red-400">
                            {errors.field_4_price}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Currency *
                        </label>
                        <Select
                          value={formData.field_4_currency}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              field_4_currency: value as CurrencyCode,
                            })
                          }
                        >
                          <SelectTrigger className="bg-[#111111] border-white/10 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {currencyOptions.map((curr) => (
                              <SelectItem key={curr} value={curr}>
                                {curr}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.field_4_currency && (
                          <p className="mt-2 text-xs text-red-400">
                            {errors.field_4_currency}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Field 4: Upsell (Optional) */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Premium Tier / Upsell (optional)
                      </label>
                      <Input
                        value={formData.field_4_upsell}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            field_4_upsell: e.target.value,
                          })
                        }
                        placeholder="e.g., One-on-one coaching at $500/month"
                        className="bg-[#111111] border-white/10 text-white"
                      />
                    </div>

                    {/* Field 5: Proof */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Existing Proof / Credentials *
                      </label>
                      <Textarea
                        value={formData.field_5_proof}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            field_5_proof: e.target.value,
                          })
                        }
                        placeholder="e.g., 5000+ Instagram followers, worked with 50+ clients, published on Medium, etc."
                        className="bg-[#111111] border-white/10 text-white min-h-[100px]"
                      />
                      {errors.field_5_proof && (
                        <p className="mt-2 text-xs text-red-400">
                          {errors.field_5_proof}
                        </p>
                      )}
                    </div>

                    {/* Field 6: Mechanism */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Your Unique Mechanism / Method *
                      </label>
                      <Textarea
                        value={formData.field_6_mechanism}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            field_6_mechanism: e.target.value,
                          })
                        }
                        placeholder="e.g., The only course with done-for-you caption templates, proprietary 3-step method, etc."
                        className="bg-[#111111] border-white/10 text-white min-h-[100px]"
                      />
                      {errors.field_6_mechanism && (
                        <p className="mt-2 text-xs text-red-400">
                          {errors.field_6_mechanism}
                        </p>
                      )}
                    </div>

                    {/* Field 7: Traffic Channels */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3">
                        Traffic Channels *
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {trafficChannels.map((channel) => (
                          <button
                            key={channel}
                            type="button"
                            onClick={() => handleChannelToggle(channel)}
                            className={`rounded-full border px-3 py-2 text-sm transition ${
                              selectedChannels.includes(channel)
                                ? "border-orange-400 bg-orange-400/10 text-orange-300"
                                : "border-white/10 bg-[#111111] text-slate-300 hover:border-white/20"
                            }`}
                          >
                            {channel}
                          </button>
                        ))}
                      </div>
                      {errors.field_7_channels && (
                        <p className="mt-2 text-xs text-red-400">
                          {errors.field_7_channels}
                        </p>
                      )}
                    </div>

                    {/* Field 7: Traffic Detail */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Additional Traffic Detail *
                      </label>
                      <Input
                        value={formData.field_7_detail}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            field_7_detail: e.target.value,
                          })
                        }
                        placeholder="e.g., Running campaigns in Nigeria targeting women 25-40"
                        className="bg-[#111111] border-white/10 text-white"
                      />
                      {errors.field_7_detail && (
                        <p className="mt-2 text-xs text-red-400">
                          {errors.field_7_detail}
                        </p>
                      )}
                    </div>

                    {/* Field 8: Challenge */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Primary Challenge / Constraint *
                      </label>
                      <Textarea
                        value={formData.field_8_challenge}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            field_8_challenge: e.target.value,
                          })
                        }
                        placeholder="e.g., Getting consistent leads, scaling operations, building credibility"
                        className="bg-[#111111] border-white/10 text-white min-h-[100px]"
                      />
                      {errors.field_8_challenge && (
                        <p className="mt-2 text-xs text-red-400">
                          {errors.field_8_challenge}
                        </p>
                      )}
                    </div>

                    {errors.submit && (
                      <p className="text-sm text-red-400">{errors.submit}</p>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleBack}
                      className="rounded-[20px] px-8 py-4 text-sm text-white"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="rounded-[20px] bg-orange-500 px-8 py-4 text-sm font-semibold text-black hover:bg-orange-600 disabled:opacity-50"
                    >
                      {isSubmitting ? "Analyzing..." : "Analyze My Offer"}
                    </Button>
                  </div>
                </motion.div>
              )}

              {currentStep === "B1" && (
                <motion.div
                  key="B1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="rounded-[28px] border border-white/10 bg-[#111111]/70 p-6 space-y-5">
                    <div className="space-y-2">
                      <div className="text-xs uppercase tracking-[0.22em] text-orange-400">
                        Step 1 of 3
                      </div>
                      <div className="text-sm text-slate-400">
                        Select your skills or describe what you do.
                      </div>
                    </div>
                    <div className="space-y-5">
                      <div>
                        <div className="text-sm font-medium text-slate-300 mb-3">
                          Pick your skills
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {skillsOptions.map((skill) => (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => toggleSkill(skill)}
                              className={`rounded-full border px-4 py-2 text-sm transition ${
                                skills.includes(skill)
                                  ? "border-orange-400 bg-orange-400/10 text-orange-300"
                                  : "border-white/10 bg-[#111111] text-slate-300 hover:border-white/20"
                              }`}
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Or describe your strength
                        </label>
                        <Input
                          value={customSkill}
                          onChange={(e) => setCustomSkill(e.target.value)}
                          placeholder="e.g., I help businesses improve their conversions"
                          className="bg-[#111111] border-white/10 text-white"
                        />
                      </div>
                      {errors.skills && (
                        <p className="text-xs text-red-400">{errors.skills}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={goBack}
                      className="rounded-[20px] px-8 py-4 text-sm text-white"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button
                      type="button"
                      onClick={goNext}
                      className="rounded-[20px] bg-orange-500 px-8 py-4 text-sm font-semibold text-black hover:bg-orange-600"
                    >
                      Continue
                    </Button>
                  </div>
                </motion.div>
              )}

              {currentStep === "B2" && (
                <motion.div
                  key="B2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="rounded-[28px] border border-white/10 bg-[#111111]/70 p-6 space-y-5">
                    <div className="space-y-2">
                      <div className="text-xs uppercase tracking-[0.22em] text-orange-400">
                        Step 2 of 3
                      </div>
                      <div className="text-sm text-slate-400">
                        Choose the audience and price range you want to serve.
                      </div>
                    </div>
                    <div className="space-y-5">
                      <div>
                        <div className="text-sm font-medium text-slate-300 mb-3">
                          Audience type
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {audienceOptions.map((aud) => (
                            <button
                              key={aud}
                              type="button"
                              onClick={() => toggleAudience(aud)}
                              className={`rounded-full border px-4 py-2 text-sm transition ${
                                audienceTypes.includes(aud)
                                  ? "border-orange-400 bg-orange-400/10 text-orange-300"
                                  : "border-white/10 bg-[#111111] text-slate-300 hover:border-white/20"
                              }`}
                            >
                              {aud}
                            </button>
                          ))}
                        </div>
                        {errors.audienceTypes && (
                          <p className="mt-2 text-xs text-red-400">
                            {errors.audienceTypes}
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Target Country *
                          </label>
                          <Select value={bCountry} onValueChange={setBCountry}>
                            <SelectTrigger className="bg-[#111111] border-white/10 text-white">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              {countryOptions.map((item) => (
                                <SelectItem key={item} value={item}>
                                  {item}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.bCountry && (
                            <p className="mt-2 text-xs text-red-400">
                              {errors.bCountry}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Currency *
                          </label>
                          <Select
                            value={bCurrency}
                            onValueChange={setBCurrency}
                          >
                            <SelectTrigger className="bg-[#111111] border-white/10 text-white">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              {currencyOptions.map((item) => (
                                <SelectItem key={item} value={item}>
                                  {item}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.bCurrency && (
                            <p className="mt-2 text-xs text-red-400">
                              {errors.bCurrency}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Price Range *
                        </label>
                        <Select value={budget} onValueChange={setBudget}>
                          <SelectTrigger className="bg-[#111111] border-white/10 text-white">
                            <SelectValue placeholder="How much to charge?" />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              "Under ₦10,000",
                              "₦10,000 - ₦50,000",
                              "₦50,000 - ₦150,000",
                              "₦150,000+",
                              "Under $50",
                              "$50 - $200",
                              "$200 - $500",
                              "$500+",
                            ].map((item) => (
                              <SelectItem key={item} value={item}>
                                {item}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.budget && (
                          <p className="mt-2 text-xs text-red-400">
                            {errors.budget}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={goBack}
                      className="rounded-[20px] px-8 py-4 text-sm text-white"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button
                      type="button"
                      onClick={goNext}
                      className="rounded-[20px] bg-orange-500 px-8 py-4 text-sm font-semibold text-black hover:bg-orange-600"
                    >
                      Generate My Ideas
                    </Button>
                  </div>
                </motion.div>
              )}

              {currentStep === "B3" && (
                <motion.div
                  key="B3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="rounded-[28px] border border-white/10 bg-[#111111]/70 p-6 space-y-5">
                    <div className="space-y-2">
                      <div className="text-xs uppercase tracking-[0.22em] text-orange-400">
                        Step 3 of 3
                      </div>
                      <div className="text-sm text-slate-400">
                        Select the strongest idea to turn into a report.
                      </div>
                    </div>
                    {isGenerating ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                        <p className="text-slate-400">
                          Generating personalized ideas...
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[420px] overflow-y-auto">
                        {generatedIdeas.map((idea, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setPickedIdea(index)}
                            className={`w-full rounded-[24px] border px-5 py-4 text-left transition ${
                              pickedIdea === index
                                ? "border-orange-400 bg-orange-400/10"
                                : "border-white/10 bg-[#0E1019] hover:border-white/20"
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-400/10 text-orange-300 font-semibold">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-white mb-2">
                                  {idea.title}
                                </div>
                                <p className="text-sm text-slate-400 mb-3">
                                  {idea.description}
                                </p>
                                <div className="flex flex-wrap gap-2 text-[11px]">
                                  <span className="rounded-full border border-green-400/20 bg-green-400/10 px-2 py-1 text-green-300">
                                    {idea.demand}
                                  </span>
                                  <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-1 text-amber-300">
                                    {idea.competition}
                                  </span>
                                  <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-2 py-1 text-blue-300">
                                    {idea.fit}
                                  </span>
                                </div>
                              </div>
                              {pickedIdea === index ? (
                                <Check className="text-orange-400" />
                              ) : null}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {errors.submit && (
                      <p className="text-xs text-red-400">{errors.submit}</p>
                    )}
                    {errors.pickedIdea && (
                      <p className="text-xs text-red-400">
                        {errors.pickedIdea}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={goBack}
                      className="rounded-[20px] px-8 py-4 text-sm text-white"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button
                      type="button"
                      onClick={goNext}
                      disabled={pickedIdea === -1}
                      className="rounded-[20px] bg-orange-500 px-8 py-4 text-sm font-semibold text-black hover:bg-orange-600 disabled:opacity-50"
                    >
                      Analyze This Idea
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
