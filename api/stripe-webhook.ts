import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const config = {
  api: {
    bodyParser: false, // REQUIRED for Stripe webhook signature verification
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  //apiVersion: "2024-06-20",
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function readRawBody(req: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    req.on("data", (chunk: any) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    const rawBody = await readRawBody(req);
    const sig = req.headers["stripe-signature"];

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ✅ Handle events
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = (session.metadata?.user_id || session.client_reference_id) as string | undefined;

      if (userId && session.customer && session.subscription) {
        await supabase
          .from("users_profile")
          .update({
            plan: "premium",
            stripe_customer_id: String(session.customer),
            stripe_subscription_id: String(session.subscription),
          })
          .eq("id", userId);
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = String(sub.customer);

      // downgrade user by customer match
      await supabase
        .from("users_profile")
        .update({
          plan: "free",
          stripe_subscription_id: null,
        })
        .eq("stripe_customer_id", customerId);
    }

    if (event.type === "customer.subscription.updated") {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = String(sub.customer);

      const isActive =
        sub.status === "active" || sub.status === "trialing";

      await supabase
        .from("users_profile")
        .update({
          plan: isActive ? "premium" : "free",
          stripe_subscription_id: sub.id,
        })
        .eq("stripe_customer_id", customerId);
    }

    return res.json({ received: true });
  } catch (e: any) {
    return res.status(500).send(e?.message ?? "Webhook handler error");
  }
}
