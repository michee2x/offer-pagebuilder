// ─────────────────────────────────────────────────────────────────────────────
// OfferIQ — Shared types for the pre-funnel intelligence flow
// ─────────────────────────────────────────────────────────────────────────────

export type OfferFormat =
  | 'course'
  | 'coaching'
  | 'ebook'
  | 'saas'
  | 'physical'
  | 'membership'
  | 'agency'
  | 'consulting'
  | 'affiliate'
  | 'local';

export type TrafficChannel =
  | 'Meta Ads'
  | 'Google Ads'
  | 'YouTube Ads'
  | 'TikTok Ads'
  | 'LinkedIn Ads'
  | 'Email List'
  | 'Organic Social'
  | 'SEO / Blog'
  | 'Podcast'
  | "Haven't started yet";

export type CurrencyCode = 'USD' | 'GBP' | 'EUR' | 'AUD' | 'CAD' | 'NZD' | 'ZAR' | 'INR' | 'NGN' | 'GHS';

// ─────────────────────────────────────────────────────────────────────────────
// Onboard form data
// ─────────────────────────────────────────────────────────────────────────────

export interface OfferFormData {
  // Field 1 — Core Offer
  field_1_name: string;
  field_1_format: OfferFormat;
  // Field 2 — Outcome
  field_2_outcome: string;
  // Field 3 — Persona
  field_3_persona: string;
  // Field 4 — Pricing
  field_4_price: string;
  field_4_currency: CurrencyCode;
  field_4_upsell: string;
  // Field 5 — Proof
  field_5_proof: string;
  // Field 6 — Mechanism
  field_6_mechanism: string;
  // Field 7 — Traffic
  field_7_channels: TrafficChannel[];
  field_7_detail: string;
  // Field 8 — Challenge
  field_8_challenge: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Call 1 — Sonnet Structural Output
// ─────────────────────────────────────────────────────────────────────────────

export interface OfferScore {
  overall: number;
  market_viability: number;
  audience_clarity: number;
  offer_strength: number;
  price_value_alignment: number;
  uniqueness: number;
  proof_strength: number;
  conversion_readiness: number;
}

export interface FunnelHealthScore {
  score: number;
  cvr_cold_traffic: string;
  cvr_warm_traffic: string;
  revenue_per_lead_estimate: string;
  primary_leakage_point: string;
  primary_leakage_cause: string;
  fix_1: string;
  fix_2: string;
  fix_3: string;
  validation_required_before_scaling: boolean;
}

export interface PlatformEntry {
  platform: string;
  budget_allocation: string;
  campaign_objective: string;
  cold_cpl_estimate: string;
  rationale: string;
}

export interface PlatformPriorityMatrix {
  primary: PlatformEntry;
  secondary: PlatformEntry;
  tertiary: PlatformEntry;
  hold: { platforms: string[]; reason: string };
  total_allocation_check: string;
  high_risk_warning: string | null;
}

export interface Call1Output {
  offer_score: OfferScore;
  score_summary: string;
  revenue_model_architecture: string;
  pain_point_mapping: string;
  funnel_structure_blueprint: string;
  pricing_strategy: string;
  upsell_downsell_paths: string;
  strategic_bonus_recommendations: string;
  design_intelligence_recommendation: string;
  funnel_health_score: FunnelHealthScore;
  platform_priority_matrix: PlatformPriorityMatrix;
}

// ─────────────────────────────────────────────────────────────────────────────
// Call 2 — Opus Strategic Output
// ─────────────────────────────────────────────────────────────────────────────

export interface Call2Output {
  offer_positioning_analysis: string;
  target_persona_intelligence: string;
  conversion_hook_library: string;
  messaging_angle_matrix: string;
  product_core_value_perception: string;
  real_world_use_case_scenarios: string;
  monetization_strategy_narrative: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Copy Output
// ─────────────────────────────────────────────────────────────────────────────

export interface CopySectionBlock {
  label: string;
  content: string;
}

export interface PageCopy {
  sections: CopySectionBlock[];
  score: number;
  word_count: number;
}

export interface EmailCopy {
  day: number;
  subject: string;
  preview: string;
  body: string;
}

export interface CopyOutput {
  lead_capture: PageCopy;
  sales_page: PageCopy;
  upsell: PageCopy;
  thankyou: PageCopy;
  email_sequence: EmailCopy[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Full intelligence store (embedded in blocks.intelligence)
// ─────────────────────────────────────────────────────────────────────────────

export interface OfferIntelligence {
  raw_input: OfferFormData;
  call1?: Call1Output;
  call2?: Call2Output;
  call1_complete?: boolean;
  call2_complete?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Wizard step indicator types
// ─────────────────────────────────────────────────────────────────────────────

export type StepStatus = 'done' | 'active' | 'pending';

export interface WizardStep {
  id: number;
  label: string;
  status: StepStatus;
}
