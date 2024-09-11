import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { logActivity } from '@/utils/supabase/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20', // Use the latest version or the one specified in your Stripe dashboard
});

export async function POST(req: Request) {
  const cookieStore = cookies();
  const supabase = createClient();  // Remove the cookieStore argument
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
    await logActivity('Initiated subscription change', { 
      userId, 
      priceId 
    });

    return NextResponse.json({ id: session.id });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error creating checkout session:', error);
    
    // Log the error
    await logActivity('Error creating checkout session', { 
      userId, 
      error: error.message 
    });

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}