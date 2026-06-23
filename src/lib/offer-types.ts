// ─────────────────────────────────────────────────────────────────────────────
// OfferIQ — Shared types
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
  field_1_name: string;
  field_1_format: OfferFormat;
  field_2_outcome: string;
  field_3_persona: string;
  field_4_price: string;
  field_4_currency: CurrencyCode;
  field_4_upsell: string;
  field_5_proof: string;
  field_6_mechanism: string;
  field_7_channels: TrafficChannel[];
  field_7_detail: string;
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
  [key: string]: string;
}

export interface Call1Parsed {
  offer_score: OfferScore;
  score_summary: string;
  funnel_structure_blueprint: string;
  revenue_model_architecture: string;
  pain_point_mapping: string;
  platform_priority_matrix: PlatformPriorityMatrix;
  funnel_health_score: FunnelHealthScore;
  pricing_strategy?: string;
  upsell_downsell_paths?: string;
  strategic_bonus_recommendations: string;
  design_intelligence_recommendation: string;
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
// Call 3 — Opus Traffic Output
// ─────────────────────────────────────────────────────────────────────────────

export interface Call3Output {
  platform_priority_narrative: string;
  omnichannel_ad_copy_matrix: string;
  google_ads_copy_matrix: string;
  vsl_ugc_video_script_intelligence: string;
  media_buying_strategy_report: string;
  traffic_funnel_alignment: string;
  competitive_acquisition_intelligence: string;
  launch_sequence_recommendation: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Page Doc — the rich-text editor copy format (replaces PageSpec)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The five possible funnel page types.
 */
export type FunnelPageKey =
  | 'lead_capture'
  | 'sales_page'
  | 'upsell'
  | 'downsell'
  | 'thankyou';

export const FUNNEL_PAGE_LABELS: Record<FunnelPageKey, string> = {
  lead_capture: 'Lead Capture',
  sales_page: 'Sales Page',
  upsell: 'Upsell',
  downsell: 'Downsell',
  thankyou: 'Thank You',
};

/**
 * A single funnel page stored as an HTML string.
 * The AI generates this HTML; the Tiptap editor reads and writes it.
 */
export interface PageDoc {
  key: FunnelPageKey;
  title: string;
  html: string;        // Full HTML the rich-text editor stores and renders
  word_count: number;
  score: number;
}

export interface PageDeclaration {
  pages: FunnelPageKey[];
  rationale: string;
}

export interface CopyOutput {
  declaration: PageDeclaration;
  pages: Partial<Record<FunnelPageKey, PageDoc>>;
}

// ── Legacy element types — kept for migration of old saved data ───────────────

export type PageElementType =
  | 'headline' | 'subheadline' | 'body_text' | 'bullet_list' | 'icon_list'
  | 'cta_button' | 'video_placeholder' | 'image_placeholder' | 'countdown_timer'
  | 'social_proof_bar' | 'testimonial_card' | 'testimonial_grid' | 'price_block'
  | 'guarantee_badge' | 'avatar_stack' | 'divider' | 'form_input' | 'nav_logo'
  | 'nav_links' | 'step_indicator';

export type ElementAlignment = 'left' | 'center' | 'right';
export type SectionLayout = 'full_width' | 'centered' | 'split_left' | 'split_right' | 'two_column' | 'three_column';
export type SpacingToken = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface PageElement {
  id: string;
  type: PageElementType;
  copy?: string;
  secondary_copy?: string;
  items?: string[];
  align?: ElementAlignment;
  placeholder_label?: string;
  placeholder_aspect?: '16:9' | '9:16' | '1:1' | '4:3';
  variant?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface PageSection {
  id: string;
  label: string;
  layout: SectionLayout;
  padding_top: SpacingToken;
  padding_bottom: SpacingToken;
  background?: 'default' | 'muted' | 'dark' | 'brand';
  elements: PageElement[];
}

/** Legacy full page spec — only used for migrating old saved data */
export interface PageSpec {
  key: FunnelPageKey;
  title: string;
  sections: PageSection[];
  word_count: number;
  score: number;
}

// ── Legacy shim — kept so email sequence route doesn't break ─────────────────
export interface CopySection {
  id: string;
  label: string;
  content: string;
}
export type CopySectionBlock = CopySection;

export interface PageCopy {
  key: FunnelPageKey;
  title: string;
  sections: CopySection[];
  markdown: string;
  score: number;
  word_count: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Email
// ─────────────────────────────────────────────────────────────────────────────

export interface EmailCopy {
  day: number;
  subject: string;
  preview: string;
  body: string;
  /** Full HTML email code generated by AI */
  html?: string;
  /** Which funnel page this email belongs to */
  page?: FunnelPageKey;
  /** Position within the page's sequence (1-based) */
  order?: number;
  /** Call-to-action button text */
  cta?: string;
}

/**
 * Per-page email sequences — each funnel page maps to its own ordered array of emails.
 */
export type FunnelEmailSequence = Partial<Record<FunnelPageKey, EmailCopy[]>>;

// ─────────────────────────────────────────────────────────────────────────────
// Full intelligence store
// ─────────────────────────────────────────────────────────────────────────────

export interface OfferIntelligence {
  raw_input: OfferFormData;
  call1?: Call1Output;
  call2?: Call2Output;
  call3?: Call3Output;
  call1_complete?: boolean;
  call2_complete?: boolean;
  call3_complete?: boolean;
}

export type StepStatus = 'done' | 'active' | 'pending';

export interface WizardStep {
  id: number;
  label: string;
  status: StepStatus;
}