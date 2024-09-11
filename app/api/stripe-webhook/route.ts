import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
// Remove the unused import
// import { logActivity } from '@/utils/supabase/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

export async function POST(req: Request) {
  const cookieStore = cookies();
  const supabase = createClient();  // Remove the cookieStore argument
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (userError) {
        console.error('Error fetching user:', userError);
        return new Response('User not found', { status: 404 });
      }

      // Update user's subscription status
      const { error: updateError } = await supabase
        .from('users')
        .update({ subscription_id: subscriptionId, subscription_status: 'active' })
        .eq('id', userData.id);

      if (updateError) {
        console.error('Error updating user subscription:', updateError);
        return new Response('Error updating subscription', { status: 500 });
      }

      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (userError) {
        console.error('Error fetching user:', userError);
        return new Response('User not found', { status: 404 });
      }

      // Update user's subscription status
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          subscription_status: subscription.status,
          subscription_id: subscription.status === 'active' ? subscription.id : null
        })
        .eq('id', userData.id);

      if (updateError) {
        console.error('Error updating user subscription:', updateError);
        return new Response('Error updating subscription', { status: 500 });
      }

      break;
    }
    // ... other cases
  }

  return NextResponse.json({ received: true });
}