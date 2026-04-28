export type BlockTheme   = "default" | "muted" | "primary" | "card" | "dark";
export type BlockLayout  = "center" | "left" | "split";
export type BlockPadding = "none" | "sm" | "md" | "lg" | "xl";
export type BlockGap     = "sm" | "md" | "lg";
export type BlockAlign   = "left" | "center" | "right";

// ─── Layout containers ────────────────────────────────────────────────────────

export interface RowBlock  { type: "Row";  align?: "start"|"center"|"end"; justify?: "start"|"center"|"end"|"between"; gap?: BlockGap; wrap?: boolean; blocks: Block[] }
export interface ColBlock  { type: "Col";  align?: "start"|"center"|"end"; gap?: BlockGap; blocks: Block[] }
export interface GridBlock { type: "Grid"; cols: 2|3|4; gap?: BlockGap; blocks: Block[] }
export interface CardBlock { type: "Card"; accent?: boolean; blocks: Block[] }

// ─── Typography ───────────────────────────────────────────────────────────────

export interface H1Block        { type: "H1";        text: string; align?: BlockAlign }
export interface H2Block        { type: "H2";        text: string; align?: BlockAlign }
export interface H3Block        { type: "H3";        text: string; align?: BlockAlign }
export interface H4Block        { type: "H4";        text: string; align?: BlockAlign }
export interface ParagraphBlock { type: "Paragraph"; text: string; align?: BlockAlign; size?: "sm"|"base"|"lg"|"xl"; weight?: "normal"|"medium"|"semibold" }
export interface BadgeBlock     { type: "Badge";     text: string; variant?: "default"|"secondary"|"outline" }
export interface ChecklistBlock { type: "Checklist"; items: string[] }

// ─── UI atoms ─────────────────────────────────────────────────────────────────

export interface ButtonBlock  { type: "Button";  text: string; href: string; variant?: "default"|"outline"|"ghost"|"secondary"; size?: "sm"|"default"|"lg"; icon?: string }
export interface DividerBlock { type: "Divider" }
export interface SpacerBlock  { type: "Spacer";  size?: "sm"|"md"|"lg" }
export interface IconBlock    { type: "Icon";    name: string; size?: "sm"|"md"|"lg" }

// ─── Composite blocks ─────────────────────────────────────────────────────────

export interface NavBarBlock          { type: "NavBar";          logo: string; links?: { text: string; href: string }[]; ctaText?: string; ctaHref?: string }
export interface FooterBlock          { type: "Footer";          logo: string; copy: string; links?: { text: string; href: string }[] }
export interface FeatureItemBlock     { type: "FeatureItem";     icon: string; title: string; description: string }
export interface TestimonialCardBlock { type: "TestimonialCard"; name: string; role: string; quote: string; initials: string; stars?: number }
export interface StatItemBlock        { type: "StatItem";        value: string; label: string; icon?: string }
export interface PricingTierBlock     { type: "PricingTier";     name: string; price: string; period?: string; description?: string; features: string[]; ctaText: string; ctaHref: string; highlighted?: boolean }
export interface FAQListBlock         { type: "FAQList";         items: { question: string; answer: string }[] }
export interface VideoEmbedBlock      { type: "VideoEmbed";      url: string }
export interface EmailCaptureBlock    { type: "EmailCapture";    placeholder?: string; buttonText: string; buttonHref?: string }
export interface LeadCapturePopupBlock {
  type: "LeadCapturePopup";
  triggerText: string;
  headline: string;
  subheadline?: string;
  collectPhone?: boolean;
  submitText: string;
  successTitle?: string;
  successMessage?: string;
}
export interface CountdownTimerBlock  { type: "CountdownTimer";  targetHours: number; style?: "minimal"|"bold" }
export interface UpsellOfferBlock     { type: "UpsellOffer";     headline: string; subheadline?: string; price: string; originalPrice?: string; ctaText: string; ctaHref: string; declineText?: string; declineHref?: string }
export interface DownsellOfferBlock   { type: "DownsellOffer";   headline: string; subheadline?: string; price: string; paymentText?: string; ctaText: string; ctaHref: string; declineText?: string; declineHref?: string }
export interface ThankYouBlockBlock   { type: "ThankYouBlock";   headline: string; subheadline?: string; receiptAmount?: string; steps?: string[]; ctaText?: string; ctaHref?: string }

export type Block =
  | RowBlock | ColBlock | GridBlock | CardBlock
  | H1Block | H2Block | H3Block | H4Block | ParagraphBlock | BadgeBlock | ChecklistBlock
  | ButtonBlock | DividerBlock | SpacerBlock | IconBlock
  | NavBarBlock | FooterBlock | FeatureItemBlock | TestimonialCardBlock | StatItemBlock
  | PricingTierBlock | FAQListBlock | VideoEmbedBlock | EmailCaptureBlock | LeadCapturePopupBlock
  | CountdownTimerBlock | UpsellOfferBlock | DownsellOfferBlock | ThankYouBlockBlock;

export interface PageSectionProps {
  theme?:   BlockTheme;
  layout?:  BlockLayout;
  padding?: BlockPadding;
  blocks:   Block[];
}
