import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const body = await req.json();

  // Extract the integration ID from the URL
  const url = new URL(req.url);
  const integrationId = url.searchParams.get('integrationId');

  if (!integrationId) {
    return NextResponse.json({ error: 'Integration ID is required' }, { status: 400 });
  }

  // Remove the cookieStore argument from createClient
  const supabase = createClient();

  // Use the secure function to insert the webhook event
  const { error } = await supabase
    .rpc('insert_webhook_event', {
      p_integration_id: integrationId,
      p_event_type: body.event_type,
      p_payload: body
    });

  if (error) {
    console.error('Error storing webhook event:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }

  // Trigger real-time update
  await supabase
    .from('integrations')
    .update({ last_sync: new Date().toISOString() })
    .eq('id', integrationId);

  return NextResponse.json({ success: true });
}