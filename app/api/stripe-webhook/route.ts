import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: Request) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object as Stripe.Subscription;
      const stripeCustomerId = subscription.customer as string;
      const planId = subscription.items.data[0].price.id;

      let tier: string;
      let limit: number;

      switch (planId) {
        case 'price_basic123':
          tier = 'free';
          limit = 1;
          break;
        case 'price_pro456':
          tier = 'pro';
          limit = 5;
          break;
        case 'price_enterprise789':
          tier = 'enterprise';
          limit = 999999; // Effectively unlimited
          break;
        default:
          tier = 'free';
          limit = 1;
      }

      const { error } = await supabase
        .from('users')
        .update({ subscription_tier: tier, integration_limit: limit })
        .eq('stripe_customer_id', stripeCustomerId);

      if (error) {
        console.error('Error updating user subscription:', error);
        return NextResponse.json({ error: 'Failed to update user subscription' }, { status: 500 });
      }

      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}