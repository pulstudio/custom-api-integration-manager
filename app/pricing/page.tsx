'use client';

import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { supabase, signInWithGoogle } from '@/utils/supabase/client';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const plans = [
  {
    name: 'Basic',
    price: 9.99,
    features: ['5 API integrations', '1,000 API calls/month', 'Email support'],
    stripePriceId: 'price_basic123',
  },
  {
    name: 'Pro',
    price: 29.99,
    features: ['Unlimited API integrations', '10,000 API calls/month', 'Priority support'],
    stripePriceId: 'price_pro456',
  },
  {
    name: 'Enterprise',
    price: 99.99,
    features: ['Unlimited everything', 'Dedicated account manager', 'Custom solutions'],
    stripePriceId: 'price_enterprise789',
  },
];

export default function PricingPage() {
  const handleSubscribe = async (priceId: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert('Please log in to subscribe');
      return;
    }

    const stripe = await stripePromise;
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId, userId: user.id }),
    });
    const session = await response.json();
    const result = await stripe!.redirectToCheckout({
      sessionId: session.id,
    });
    if (result.error) {
      console.error(result.error.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-12">Choose Your Plan</h1>
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div key={plan.name} className="card text-center">
            <h2 className="text-2xl font-semibold mb-4">{plan.name}</h2>
            <p className="text-3xl font-bold mb-6">${plan.price}<span className="text-sm font-normal">/month</span></p>
            <ul className="mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="mb-2">{feature}</li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe(plan.stripePriceId)}
              className="btn w-full"
            >
              Subscribe Now
            </button>
          </div>
        ))}
      </div>
      <div className="mt-16 overflow-x-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center">Feature Comparison</h2>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Feature</th>
              {plans.map((plan) => (
                <th key={plan.name} className="px-4 py-2 text-center">{plan.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">API Integrations</td>
              <td className="border px-4 py-2 text-center">5</td>
              <td className="border px-4 py-2 text-center">Unlimited</td>
              <td className="border px-4 py-2 text-center">Unlimited</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">API Calls/month</td>
              <td className="border px-4 py-2 text-center">1,000</td>
              <td className="border px-4 py-2 text-center">10,000</td>
              <td className="border px-4 py-2 text-center">Unlimited</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Support</td>
              <td className="border px-4 py-2 text-center">Email</td>
              <td className="border px-4 py-2 text-center">Priority</td>
              <td className="border px-4 py-2 text-center">Dedicated</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}