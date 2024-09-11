import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const body = await req.json();

  // Extract the integration ID from the URL
  const url = new URL(req.url);
  const integrationId = url.searchParams.get('integrationId');

  if (!integrationId) {
    return NextResponse.json({ error: 'Integration ID is required' }, { status: 400 });
  }

  // Store the webhook data in Supabase
  const { data, error } = await supabase
    .from('webhook_events')
    .insert({
      integration_id: integrationId,
      event_type: body.event_type,
      payload: body,
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