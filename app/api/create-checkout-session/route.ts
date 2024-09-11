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
  const { priceId, userId } = await req.json();

  try {
    // Get or create Stripe customer
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (userError) {
      throw new Error('User not found');
    }

    let customerId = userData.stripe_customer_id;

    if (!customerId) {
      const { data: userDetails } = await supabase.auth.admin.getUserById(userId);
      if (userDetails && userDetails.user && userDetails.user.email) {
        const customer = await stripe.customers.create({
          email: userDetails.user.email,
        });
        customerId = customer.id;

        await supabase
          .from('users')
          .update({ stripe_customer_id: customerId })
          .eq('id', userId);
      } else {
        throw new Error('User email not found');
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/pricing`,
    });

    // Log the checkout session creation
    await supabase.from('activity_logs').insert({
      user_id: userId,
      action: 'Initiated subscription change',
      details: { priceId },
    });

    return NextResponse.json({ id: session.id });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error creating checkout session:', error);
    
    // Log the error
    await supabase.from('activity_logs').insert({
      user_id: userId,
      action: 'Error creating checkout session',
      details: { error: error.message },
    });

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}