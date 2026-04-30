"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

type Step = "basics" | "domain" | "team" | "review";

interface WorkspaceData {
  name: string;
  domain: string;
  invites: { email: string; role: string }[];
}

export default function OnboardPage() {
  const [currentStep, setCurrentStep] = useState<Step>("basics");
  const [workspaceData, setWorkspaceData] = useState<WorkspaceData>({
    name: "",
    domain: "",
    invites: [{ email: "", role: "Member" }],
  });
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      }
    };
    checkAuth();
  }, [supabase, router]);

  const updateWorkspaceData = (updates: Partial<WorkspaceData>) => {
    setWorkspaceData((prev) => ({ ...prev, ...updates }));
  };

  const addInvite = () => {
    setWorkspaceData((prev) => ({
      ...prev,
      invites: [...prev.invites, { email: "", role: "Member" }],
    }));
  };

  const updateInvite = (
    index: number,
    field: "email" | "role",
    value: string,
  ) => {
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
    if (currentStep === "basics") {
      if (!workspaceData.name.trim()) {
        alert("Please name your workspace to continue.");
        return;
      }
      setCurrentStep("domain");
      return;
    }

    if (currentStep === "domain") {
      const domain = workspaceData.domain.trim().toLowerCase();
      const validDomain = /^[a-z0-9-]{3,30}$/.test(domain);
      if (!validDomain) {
        alert(
          "Choose a valid workspace domain using letters, numbers, and hyphens.",
        );
        return;
      }
      setWorkspaceData((prev) => ({ ...prev, domain }));
      setCurrentStep("team");
      return;
    }

    if (currentStep === "team") {
      setCurrentStep("review");
      return;
    }
  };

  const prevStep = () => {
    if (currentStep === "domain") setCurrentStep("basics");
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

      router.push("/workspaces");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const steps = [
    {
      id: "basics",
      title: "Workspace Basics",
      desc: "Set up your workspace name and details",
    },
    {
      id: "domain",
      title: "Custom Domain",
      desc: "Choose your workspace domain",
    },
    {
      id: "team",
      title: "Invite Team",
      desc: "Add team members to your workspace",
    },
    {
      id: "review",
      title: "Review & Create",
      desc: "Review your workspace settings",
    },
  ];

  return (
    <div className="wizard-layout">
      <div className="wizard-sidebar">
        <div className="wizard-sidebar-glow"></div>
        <div className="wizard-logo">
          Offer<span>IQ</span>
        </div>
        <div className="wizard-steps">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`wizard-step-item ${currentStep === step.id ? "active" : ""} ${steps.findIndex((s) => s.id === currentStep) > index ? "done" : ""}`}
            >
              <div className="wizard-step-circle">{index + 1}</div>
              <div className="wizard-step-text">
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="wizard-sidebar-footer">
          <p>
            <strong>Pro tip:</strong> You can change these settings later in
            your workspace settings.
          </p>
        </div>
      </div>

      <div className="wizard-main">
        <div className="wizard-content">
          {currentStep === "basics" && (
            <div className="wizard-step-header">
              <div className="wizard-step-tag">STEP 1 OF 4</div>
              <h2>Let&apos;s set up your workspace</h2>
              <p>
                This will be the home for all your projects and team
                collaboration.
              </p>
            </div>
          )}

          {currentStep === "domain" && (
            <div className="wizard-step-header">
              <div className="wizard-step-tag">STEP 2 OF 4</div>
              <h2>Choose your domain</h2>
              <p>This will be your workspace&apos;s unique URL and branding.</p>
            </div>
          )}

          {currentStep === "team" && (
            <div className="wizard-step-header">
              <div className="wizard-step-tag">STEP 3 OF 4</div>
              <h2>Invite your team</h2>
              <p>
                Collaborate with your team by inviting them to your workspace.
              </p>
            </div>
          )}

          {currentStep === "review" && (
            <div className="wizard-step-header">
              <div className="wizard-step-tag">STEP 4 OF 4</div>
              <h2>Review your workspace</h2>
              <p>
                Double-check everything looks good before creating your
                workspace.
              </p>
            </div>
          )}

          {currentStep === "basics" && (
            <div className="field-group">
              <label>Workspace Name</label>
              <input
                type="text"
                placeholder="My Awesome Workspace"
                value={workspaceData.name}
                onChange={(e) => updateWorkspaceData({ name: e.target.value })}
              />
            </div>
          )}

          {currentStep === "domain" && (
            <div className="field-group">
              <label>Workspace Domain</label>
              <div className="domain-input-wrap">
                <div className="domain-prefix">https://</div>
                <input
                  type="text"
                  placeholder="myworkspace"
                  value={workspaceData.domain}
                  onChange={(e) =>
                    updateWorkspaceData({ domain: e.target.value })
                  }
                />
                <div className="domain-suffix">.offeriq.com</div>
              </div>
            </div>
          )}

          {currentStep === "team" && (
            <div>
              {workspaceData.invites.map((invite, index) => (
                <div key={index} className="invite-row">
                  <input
                    type="email"
                    placeholder="colleague@company.com"
                    value={invite.email}
                    onChange={(e) =>
                      updateInvite(index, "email", e.target.value)
                    }
                  />
                  <select
                    value={invite.role}
                    onChange={(e) =>
                      updateInvite(index, "role", e.target.value)
                    }
                  >
                    <option>Member</option>
                    <option>Admin</option>
                  </select>
                  {workspaceData.invites.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInvite(index)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--muted-auth)",
                        cursor: "pointer",
                        padding: "8px",
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="btn-add-more"
                onClick={addInvite}
              >
                + Add another team member
              </button>
              <p className="skip-link" onClick={nextStep}>
                Skip for now
              </p>
            </div>
          )}

          {currentStep === "review" && (
            <div className="review-card">
              <div className="review-card-header">WORKSPACE DETAILS</div>
              <div className="review-row">
                <span>Name</span>
                <span>{workspaceData.name}</span>
              </div>
              <div className="review-row">
                <span>Domain</span>
                <span>https://{workspaceData.domain}.offeriq.com</span>
              </div>
              <div className="review-row">
                <span>Team Members</span>
                <span>
                  {workspaceData.invites.filter((i) => i.email).length + 1}{" "}
                  invited
                </span>
              </div>
            </div>
          )}

          <div className="wizard-nav">
            {currentStep !== "basics" && (
              <button className="step-back-btn" onClick={prevStep}>
                ← Back
              </button>
            )}
            {currentStep !== "review" ? (
              <button className="step-next-btn" onClick={nextStep}>
                Continue →
              </button>
            ) : (
              <button
                className="step-next-btn"
                onClick={createWorkspace}
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create Workspace →"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
