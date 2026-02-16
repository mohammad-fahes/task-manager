import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
 // apiVersion: "2024-06-20",
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { user_id } = req.body as { user_id?: string };
    if (!user_id) return res.status(400).json({ error: "Missing user_id" });

    // Get or create Stripe customer
    const { data: profile, error: pErr } = await supabase
      .from("users_profile")
      .select("stripe_customer_id, plan")
      .eq("id", user_id)
      .single();

    if (pErr) return res.status(500).json({ error: pErr.message });

    let customerId = profile?.stripe_customer_id as string | null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { user_id },
      });
      customerId = customer.id;

      await supabase
        .from("users_profile")
        .update({ stripe_customer_id: customerId })
        .eq("id", user_id);
    }

    // Create checkout session (subscription)
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      success_url: `${process.env.APP_URL}/upgrade?success=1`,
      cancel_url: `${process.env.APP_URL}/upgrade?canceled=1`,
      client_reference_id: user_id,
      metadata: { user_id },
    });

    return res.status(200).json({ url: session.url });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message ?? "Server error" });
  }
}
