"use client";

import { useEffect, useState, useRef, Suspense } from "react";
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
import { toast } from "sonner";
import { UpgradeModal } from "@/components/UpgradeModal";
type Step = "name" | "domain" | "subaccount" | "review";

interface SubAccountInvite {
  email: string;
}

const stepConfig: Record<Step, { title: string }> = {
  name: { title: "Let's set up your workspace" },
  domain: { title: "Choose your domain" },
  subaccount: { title: "Add Sub-Account (Optional)" },
  review: { title: "Review your workspace" },
};

const stepOrder: Step[] = ["name", "domain", "subaccount", "review"];

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

function OnboardContent() {
  const [currentStep, setCurrentStep] = useState<Step>("name");
  const [workspaceData, setWorkspaceData] = useState({
    name: "",
    domain: "",
    subaccountEmail: "",
    subaccountPermissions: { view: true, edit: false, delete: false, create: false },
  });
  const [typedHeadline, setTypedHeadline] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
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

  const updateSubaccount = (value: string) => {
    setWorkspaceData((prev) => ({
      ...prev,
      subaccountEmail: value,
    }));
  };

  const nextStep = () => {
    if (currentStep === "name") {
      if (!workspaceData.name.trim()) {
        toast.error("Please name your workspace to continue.");
        return;
      }
      setCurrentStep("domain");
    } else if (currentStep === "domain") {
      const domain = workspaceData.domain.trim().toLowerCase();
      const validDomain = /^[a-z0-9-]{3,30}$/.test(domain);
      if (!validDomain) {
        toast.error(
          "Choose a valid workspace domain using letters, numbers, and hyphens.",
        );
        return;
      }
      setCurrentStep("subaccount");
    } else if (currentStep === "subaccount") {
      setCurrentStep("review");
    }
  };

  const prevStep = () => {
    if (currentStep === "domain") setCurrentStep("name");
    else if (currentStep === "subaccount") setCurrentStep("domain");
    else if (currentStep === "review") setCurrentStep("subaccount");
  };

  const createWorkspace = async () => {
    if (!workspaceData.name.trim() || !workspaceData.domain.trim()) {
      toast.error("Workspace name and domain are required.");
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
          subaccountEmail: workspaceData.subaccountEmail.trim(),
          subaccountPermissions: workspaceData.subaccountPermissions,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        if (response.status === 403) {
          setShowUpgradeModal(true);
          return;
        }
        throw new Error(result.error || "Failed to create workspace");
      }

      router.push(`/?workspace=${result.workspace.id}`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[80px] right-[-480px] w-[994px] h-[800px] opacity-40" style={{ background: 'radial-gradient(50% 50% at 50% 50%, rgb(236, 72, 153) 0%, rgba(236, 72, 153, 0) 100%)', transform: 'rotate(-30deg)' }} />
          <div className="absolute top-[80px] left-[-480px] w-[994px] h-[800px] opacity-40" style={{ background: 'radial-gradient(50% 50% at 50% 50%, rgb(59, 130, 246) 0%, rgba(59, 130, 246, 0) 100%)', transform: 'rotate(30deg)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-[522px] opacity-[0.36] z-[1]" style={{ background: 'radial-gradient(50% 50% at 50% 50%, rgb(140, 22, 250) 0%, rgba(140, 22, 250, 0) 100%)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-[240px] z-[2] opacity-100" style={{ background: 'linear-gradient(180deg, rgba(3, 7, 18, 0) 0%, rgb(3, 7, 18) 100%)' }} />
          <div className="absolute inset-0 opacity-10 pointer-events-none z-[1]" style={{ backgroundImage: 'url(https://framerusercontent.com/images/6mcf62RlDfRfU61Yg5vb2pefpi4.png)', backgroundRepeat: 'repeat', backgroundSize: '128px auto' }} />
        </div>
        <div className="relative z-10 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        title="Workspace Limit Reached"
        description="You've reached the maximum number of workspaces allowed on your current plan. Upgrade your plan to create more workspaces and scale your offers."
      />
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[80px] right-[-480px] w-[994px] h-[800px] opacity-40" style={{ background: 'radial-gradient(50% 50% at 50% 50%, rgb(236, 72, 153) 0%, rgba(236, 72, 153, 0) 100%)', transform: 'rotate(-30deg)' }} />
        <div className="absolute top-[80px] left-[-480px] w-[994px] h-[800px] opacity-40" style={{ background: 'radial-gradient(50% 50% at 50% 50%, rgb(59, 130, 246) 0%, rgba(59, 130, 246, 0) 100%)', transform: 'rotate(30deg)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-[522px] opacity-[0.36] z-[1]" style={{ background: 'radial-gradient(50% 50% at 50% 50%, rgb(140, 22, 250) 0%, rgba(140, 22, 250, 0) 100%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-[240px] z-[2] opacity-100" style={{ background: 'linear-gradient(180deg, rgba(3, 7, 18, 0) 0%, rgb(3, 7, 18) 100%)' }} />
        <div className="absolute inset-0 opacity-10 pointer-events-none z-[1]" style={{ backgroundImage: 'url(https://framerusercontent.com/images/6mcf62RlDfRfU61Yg5vb2pefpi4.png)', backgroundRepeat: 'repeat', backgroundSize: '128px auto' }} />
      </div>

      <div className="w-full max-w-[640px] relative z-10">
        <div className="absolute -top-16 left-10 right-10 flex items-center justify-between">
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
          <Button 
            variant="ghost" 
            className="text-slate-400 hover:text-white"
            onClick={() => router.push('/')}
          >
            Cancel
          </Button>
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
                <div className="rounded-[16px] bg-white/5 backdrop-blur-md border border-white/10 p-4 flex items-center gap-3">
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

              {currentStep === "subaccount" && (
                <div className="space-y-4">
                  <div className="grid gap-3 rounded-[16px] bg-white/5 backdrop-blur-md border border-white/10 p-4">
                    <Input
                      type="email"
                      placeholder="subaccount@client.com"
                      value={workspaceData.subaccountEmail}
                      onChange={(event) =>
                        updateSubaccount(event.target.value)
                      }
                    />
                    <p className="text-sm text-slate-400 mt-2">
                      They will receive a magic link to access this workspace.
                    </p>
                  </div>
                  
                  {isValidEmail(workspaceData.subaccountEmail) && (
                    <div className="grid gap-4 rounded-[16px] bg-white/5 backdrop-blur-md p-5 border border-white/10">
                      <div className="text-sm font-semibold text-white mb-2">Sub-Account Permissions</div>
                    
                    <label className="flex items-center justify-between cursor-pointer group">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-white">View Projects</span>
                        <span className="text-xs text-slate-500">Can view offers in this workspace</span>
                      </div>
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox"
                          className="sr-only peer"
                          checked={workspaceData.subaccountPermissions.view}
                          readOnly
                        />
                        <div className="w-10 h-6 bg-blue-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all cursor-not-allowed opacity-50"></div>
                      </div>
                    </label>

                    <label className="flex items-center justify-between cursor-pointer group">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-white">Create Projects</span>
                        <span className="text-xs text-slate-500">Can generate new offers</span>
                      </div>
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox"
                          className="sr-only peer"
                          checked={workspaceData.subaccountPermissions.create}
                          onChange={(e) => setWorkspaceData(prev => ({...prev, subaccountPermissions: {...prev.subaccountPermissions, create: e.target.checked}}))}
                        />
                        <div className="w-10 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </div>
                    </label>

                    <label className="flex items-center justify-between cursor-pointer group">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-white">Edit Projects</span>
                        <span className="text-xs text-slate-500">Can edit existing offers</span>
                      </div>
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox"
                          className="sr-only peer"
                          checked={workspaceData.subaccountPermissions.edit}
                          onChange={(e) => setWorkspaceData(prev => ({...prev, subaccountPermissions: {...prev.subaccountPermissions, edit: e.target.checked}}))}
                        />
                        <div className="w-10 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </div>
                    </label>

                    <label className="flex items-center justify-between cursor-pointer group">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-white">Delete Projects</span>
                        <span className="text-xs text-slate-500">Can permanently delete offers</span>
                      </div>
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox"
                          className="sr-only peer"
                          checked={workspaceData.subaccountPermissions.delete}
                          onChange={(e) => setWorkspaceData(prev => ({...prev, subaccountPermissions: {...prev.subaccountPermissions, delete: e.target.checked}}))}
                        />
                        <div className="w-10 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </div>
                    </label>
                  </div>
                  )}

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
                <div className="space-y-4 rounded-[16px] bg-white/5 backdrop-blur-md border border-white/10 p-6">
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
                      <span>Sub-Account</span>
                      <span>
                        {workspaceData.subaccountEmail.trim() || "None"}
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
                  className="rounded-[20px] bg-white px-8 py-4 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-50"
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

export default function OnboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#030712] text-white flex flex-col items-center justify-center p-4">
        <Spinner size="lg" />
      </div>
    }>
      <OnboardContent />
    </Suspense>
  );
}
