import { useState } from "react";
import { getSession } from "../lib/auth";

export default function Upgrade() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startCheckout = async () => {
    setError("");
    setLoading(true);

    try {
      const session = await getSession();
      const user_id = session?.user?.id;

      if (!user_id) {
        throw new Error("Please login first.");
      }

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to start checkout");
      }

      // ✅ Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (e: any) {
      setError(e?.message ?? "Checkout failed");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upgrade to Premium</h1>
        <p className="mt-2 text-gray-600">
          Unlock unlimited productivity and advanced features.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        {/* FREE */}
        <div className="rounded-2xl border bg-white p-6 space-y-4">
          <h2 className="text-xl font-semibold">Free</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✔ Up to 20 active tasks</li>
            <li>✔ 1 project</li>
            <li>✔ Subtasks</li>
            <li>✖ Analytics</li>
            <li>✖ Export</li>
            <li>✖ Reminders</li>
          </ul>

          <button
            disabled
            className="mt-4 w-full rounded-xl border p-3 text-gray-500"
          >
            Current plan
          </button>
        </div>

        {/* PREMIUM */}
        <div className="rounded-2xl border-2 border-black bg-white p-6 space-y-4">
          <h2 className="text-xl font-semibold">Premium 🚀</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✔ Unlimited tasks</li>
            <li>✔ Unlimited projects</li>
            <li>✔ Advanced analytics</li>
            <li>✔ Export data</li>
            <li>✔ Reminders</li>
            <li>✔ Future features</li>
          </ul>

          <button
            onClick={startCheckout}
            disabled={loading}
            className="mt-4 w-full rounded-xl bg-black p-3 text-white hover:bg-black/90 disabled:opacity-60"
          >
            {loading ? "Redirecting to payment..." : "Upgrade to Premium"}
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
        💡 Secure payment via Stripe. Cancel anytime.
      </div>
    </div>
  );
}
