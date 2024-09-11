import { loadStripe } from '@stripe/stripe-js';
import React from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PricingPage() {
  const handleCheckout = async () => {
    const stripe = await stripePromise;
    const response = await fetch('/api/stripe', { method: 'POST' });
    const session = await response.json();
    const result = await stripe!.redirectToCheckout({
      sessionId: session.sessionId,
    });
    if (result.error) {
      console.error(result.error.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Pricing</h1>
      <div className="card max-w-md mx-auto text-center">
        <h2 className="text-2xl font-semibold mb-4">Pro Plan</h2>
        <p className="mb-4">Get access to all features and priority support</p>
        <button onClick={handleCheckout} className="btn">
          Subscribe to Pro Plan
        </button>
      </div>
    </div>
  );
}