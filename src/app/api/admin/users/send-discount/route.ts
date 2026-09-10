import { NextResponse } from "next/server";
import { getSession } from "@/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const resendFrom = process.env.RESEND_FROM || "OfferIQ <hello@ofiq.app>";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();

    // Verify admin status
    const { data: adminUser } = await supabaseAdmin
      .from("users")
      .select("is_admin")
      .eq("id", session.user.id)
      .single();

    const isSystemAdmin = session.user.email === "access@ofiq.com" || session.user.email === "access@ofiq.app";
    if (!adminUser?.is_admin && !isSystemAdmin && process.env.NODE_ENV !== "development") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const { email, plan, discountCode, discountPercentage } = await req.json();

    if (!email || !plan || !discountCode || !discountPercentage) {
      return NextResponse.json({ error: "Missing required fields (email, plan, discountCode, discountPercentage)" }, { status: 400 });
    }

    // Resolve plan to priceId
    let priceId = "";
    switch (plan.toLowerCase()) {
      case "starter":
        priceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER || "";
        break;
      case "growth":
        priceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_GROWTH || "";
        break;
      case "agency":
        priceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_AGENCY || "";
        break;
      default:
        return NextResponse.json({ error: "Invalid plan type. Must be starter, growth, or agency." }, { status: 400 });
    }

    if (!priceId) {
      return NextResponse.json({ error: "Price ID not configured for this plan in the environment." }, { status: 500 });
    }

    // Call Paddle API to create the discount
    const paddleApiUrl = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "production" 
      ? "https://api.paddle.com/discounts" 
      : "https://sandbox-api.paddle.com/discounts";
    
    const paddleApiKey = process.env.PADDLE_API_KEY;

    if (!paddleApiKey) {
      return NextResponse.json({ error: "Paddle API Key not configured." }, { status: 500 });
    }

    try {
      const paddleRes = await fetch(paddleApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${paddleApiKey}`
        },
        body: JSON.stringify({
          amount: discountPercentage.toString(),
          description: `Admin generated discount for ${email}`,
          type: "percentage",
          code: discountCode,
          enabled_for_checkout: true,
          restrict_to: [priceId]
        })
      });

      if (!paddleRes.ok) {
        const errorData = await paddleRes.json();
        console.error("Paddle API Error:", errorData);
        // Handle common errors like code already exists
        if (errorData.error?.code === "discount_code_already_exists") {
           return NextResponse.json({ error: "This discount code already exists in Paddle. Please use a unique code." }, { status: 400 });
        }
        return NextResponse.json({ error: `Paddle Error: ${errorData.error?.detail || "Failed to create discount"}` }, { status: 400 });
      }
    } catch (paddleErr) {
      console.error("Failed to reach Paddle API", paddleErr);
      return NextResponse.json({ error: "Failed to communicate with Paddle API." }, { status: 500 });
    }

    // Construct the magic link
    const url = new URL(req.url);
    const siteUrl = url.origin;
    const checkoutUrl = `${siteUrl}/checkout-now?plan=${priceId}&discount=${encodeURIComponent(discountCode)}`;

    // Send the email via Resend
    const { error: resendError } = await resend.emails.send({
      from: resendFrom,
      to: email,
      subject: "Your Exclusive OfferIQ Discount is Here",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #3b82f6;">Special Offer for OfferIQ</h2>
          <p>Hi there,</p>
          <p>We're excited to offer you a special discount on our <strong>${plan.charAt(0).toUpperCase() + plan.slice(1)}</strong> plan.</p>
          <p>Your discount code is: <strong>${discountCode}</strong></p>
          <p>To claim your offer and complete your checkout with the discount already applied, simply click the button below:</p>
          <div style="margin: 30px 0;">
            <a href="${checkoutUrl}" style="background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Claim Offer & Checkout
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #555; font-size: 14px;"><a href="${checkoutUrl}">${checkoutUrl}</a></p>
          <p>Best regards,<br>The OfferIQ Team</p>
        </div>
      `,
    });

    if (resendError) {
      console.error("Resend Error:", resendError);
      return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Discount link sent successfully." });

  } catch (error: any) {
    console.error("[send-discount] Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
