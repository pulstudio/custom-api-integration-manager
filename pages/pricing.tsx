import { loadStripe } from '@stripe/stripe-js';

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
    <div>
      <h1>Pricing</h1>
      <button onClick={handleCheckout}>Subscribe to Pro Plan</button>
    </div>
  );
}