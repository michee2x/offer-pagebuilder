"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

type Step = "name" | "domain" | "team" | "review";

interface Invite {
  email: string;
  role: string;
}

const stepConfig: Record<Step, { title: string }> = {
  name: { title: "Let's set up your workspace" },
  domain: { title: "Choose your domain" },
  team: { title: "Invite your team" },
  review: { title: "Review your workspace" },
};

const stepOrder: Step[] = ["name", "domain", "team", "review"];

export default function OnboardPage() {
  const [currentStep, setCurrentStep] = useState<Step>("name");
  const [workspaceData, setWorkspaceData] = useState({
    name: "",
    domain: "",
    invites: [{ email: "", role: "Member" }] as Invite[],
  });
  const [typedHeadline, setTypedHeadline] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const prevStepRef = useRef<Step>("name");
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const workspaceId = searchParams.get("workspace");
      if (workspaceId) {
        // If workspace param exists, redirect to offer analysis form
        router.replace(`/analyze?workspace=${workspaceId}`);
        return;
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [router, supabase, searchParams]);


  useEffect(() => {
    const text = stepConfig[currentStep].title;
    const isMovingBackward =
      stepOrder.indexOf(currentStep) < stepOrder.indexOf(prevStepRef.current);

    if (isMovingBackward) {
      // No animation when going back - show instantly
      setTypedHeadline(text);
    } else {
      // Type effect only when moving forward
      let index = 0;
      setTypedHeadline("");

      const tick = new Audio(
        "https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-61905/zapsplat_office_keyboard_single_key_press_001_63365.mp3",
      );
      tick.volume = 0.04;

      const typeEffect = () => {
        if (index < text.length) {
          setTypedHeadline(text.slice(0, index + 1));
          tick.currentTime = 0;
          tick.play().catch(() => {});

          const speed = text[index] === " " ? 60 : 20 + Math.random() * 40;
          index += 1;
          window.setTimeout(typeEffect, speed);
        }
      };

      const timer = window.setTimeout(typeEffect, 500);
      return () => window.clearTimeout(timer);
    }

    prevStepRef.current = currentStep;
  }, [currentStep]);

  const updateWorkspaceData = (updates: Partial<typeof workspaceData>) => {
    setWorkspaceData((prev) => ({ ...prev, ...updates }));
  };

  const addInvite = () => {
    setWorkspaceData((prev) => ({
      ...prev,
      invites: [...prev.invites, { email: "", role: "Member" }],
    }));
  };

  const updateInvite = (index: number, field: keyof Invite, value: string) => {
    setWorkspaceData((prev) => ({
      ...prev,
      invites: prev.invites.map((invite, i) =>
        i === index ? { ...invite, [field]: value } : invite,
      ),
    }));
  };

  const removeInvite = (index: number) => {
    setWorkspaceData((prev) => ({
      ...prev,
      invites: prev.invites.filter((_, i) => i !== index),
    }));
  };

  const nextStep = () => {
    if (currentStep === "name") {
      if (!workspaceData.name.trim()) {
        alert("Please name your workspace to continue.");
        return;
      }
      setCurrentStep("domain");
    } else if (currentStep === "domain") {
      const domain = workspaceData.domain.trim().toLowerCase();
      const validDomain = /^[a-z0-9-]{3,30}$/.test(domain);
      if (!validDomain) {
        alert(
          "Choose a valid workspace domain using letters, numbers, and hyphens.",
        );
        return;
      }
      setCurrentStep("team");
    } else if (currentStep === "team") {
      setCurrentStep("review");
    }
  };

  const prevStep = () => {
    if (currentStep === "domain") setCurrentStep("name");
    else if (currentStep === "team") setCurrentStep("domain");
    else if (currentStep === "review") setCurrentStep("team");
  };

  const createWorkspace = async () => {
    if (!workspaceData.name.trim() || !workspaceData.domain.trim()) {
      alert("Workspace name and domain are required.");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: workspaceData.name.trim(),
          domain: workspaceData.domain.trim().toLowerCase(),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to create workspace");
      }

      router.push(`/workspaces/${result.workspace.id}`);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] text-white flex flex-col items-center justify-center p-4">
        <div className="relative">
          <div className="absolute inset-0 blur-3xl bg-brand-yellow/10 rounded-full animate-pulse"></div>
          <div className="relative bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-12 flex flex-col items-center gap-6 shadow-2xl">
            <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center text-white border border-white/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-yellow/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Spinner size="md" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight text-white">Preparing your workspace</h2>
              <p className="text-slate-400 text-sm">Getting everything ready for you...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[640px] relative">
        <div className="absolute -top-16 left-10">
          <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-black shadow-lg">
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

        <div className="content-shell w-full px-10">
          <motion.div
            className="headline-container min-h-8 mb-16"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            key={`headline-${currentStep}`}
          >
            <h1 className="text-3xl font-semibold tracking-[-0.04em] leading-[1.1] inline-block">
              {typedHeadline}
            </h1>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.form
              key={currentStep}
              onSubmit={(event) => {
                event.preventDefault();
                if (currentStep === "review") {
                  createWorkspace();
                } else {
                  nextStep();
                }
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              {currentStep === "name" && (
                <div className="flex items-center gap-3">
                  <Input
                    autoFocus
                    value={workspaceData.name}
                    onChange={(event) =>
                      updateWorkspaceData({ name: event.target.value })
                    }
                    type="text"
                    placeholder="Workspace name"
                  />
                </div>
              )}

              {currentStep === "domain" && (
                <div className="rounded-[16px] bg-[#0a0a0a] border border-white/10 p-4 flex items-center gap-3">
                  <span className="text-slate-400">https://</span>
                  <Input
                    className="w-full bg-transparent border-none text-lg text-white placeholder:text-slate-500 h-10"
                    type="text"
                    placeholder="myworkspace"
                    value={workspaceData.domain}
                    onChange={(event) =>
                      updateWorkspaceData({ domain: event.target.value })
                    }
                  />
                  <span className="text-slate-400">.offeriq.com</span>
                </div>
              )}

              {currentStep === "team" && (
                <div className="space-y-4">
                  {workspaceData.invites.map((invite, index) => (
                    <div
                      key={index}
                      className="grid gap-3 rounded-[16px] bg-[#0a0a0a] p-4"
                    >
                      <Input
                        type="email"
                        placeholder="colleague@company.com"
                        value={invite.email}
                        onChange={(event) =>
                          updateInvite(index, "email", event.target.value)
                        }
                      />
                      <div className="flex items-center gap-3">
                        <Select
                          value={invite.role}
                          onValueChange={(value) =>
                            updateInvite(index, "role", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="min-h-10">
                            <SelectItem value="Member">Member</SelectItem>
                            <SelectItem value="Admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        {workspaceData.invites.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeInvite(index)}
                            variant="outline"
                            className="rounded-full border-white/10 text-slate-400 hover:border-orange-400 hover:text-orange-400"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={addInvite}
                    variant="ghost"
                    className="rounded-[18px] mt-4 bg-white/5 text-white hover:bg-white/10"
                  >
                    + Add another team member
                  </Button>
                  <Button
                    type="button"
                    onClick={nextStep}
                    variant="link"
                    className="text-slate-400 underline underline-offset-4"
                  >
                    Skip for now
                  </Button>
                </div>
              )}

              {currentStep === "review" && (
                <div className="space-y-4 rounded-[16px] bg-[#0a0a0a] p-6">
                  <span>Workspace details</span>
                  <div className="grid mt-4 gap-4 text-sm text-slate-300">
                    <div className="flex justify-between rounded-2xl bg-white/5 p-4">
                      <span>Name</span>
                      <span>{workspaceData.name}</span>
                    </div>
                    <div className="flex justify-between rounded-2xl bg-white/5 p-4">
                      <span>Domain</span>
                      <span>https://{workspaceData.domain}.offeriq.com</span>
                    </div>
                    <div className="flex justify-between rounded-2xl bg-white/5 p-4">
                      <span>Team members</span>
                      <span>
                        {
                          workspaceData.invites.filter((invite) =>
                            invite.email.trim(),
                          ).length
                        }{" "}
                        invited
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === "name"}
                  variant="outline"
                  className="rounded-[20px] border-white/10 bg-white/5 px-7 py-4 text-sm font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-40"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={
                    (currentStep === "name" && !workspaceData.name.trim()) ||
                    (currentStep === "domain" && !workspaceData.domain.trim())
                  }
                  className="rounded-[20px] bg-[#FF9E2C] px-8 py-4 text-sm font-semibold text-black hover:bg-orange-300 disabled:opacity-50"
                >
                  {currentStep === "review"
                    ? isCreating
                      ? "Creating..."
                      : "Create Workspace"
                    : "Continue"}
                </Button>
              </div>
            </motion.form>
          </AnimatePresence>
        </div>
      </div>

      <style jsx global>{`
        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
      `}</style>
    </div>
  );
}
