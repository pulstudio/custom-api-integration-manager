'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useSwipeable } from 'react-swipeable';
import ActivityLog from '../components/ActivityLog';

interface User {
  name: string;
  subscription_tier: string;
  integration_limit: number;
}

interface Integration {
  name: string;
  status: string;
}

interface WebhookEvent {
  event_type: string;
  created_at: string;
}

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState(0);
  const sections = ['API Usage', 'Integrations', 'Subscription'];
  const [recentEvents, setRecentEvents] = useState<WebhookEvent[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error fetching user:', userError);
        return;
      }

      if (userData.user) {
        const { data: userDetails, error: detailsError } = await supabase
          .from('users')
          .select('name, subscription_tier, integration_limit')
          .eq('id', userData.user.id)
          .single();

        if (detailsError) {
          console.error('Error fetching user details:', detailsError);
        } else {
          setUser(userDetails);
        }

        const { data: integrationsData, error: integrationsError } = await supabase
          .from('integrations')
          .select('name, status')
          .eq('user_id', userData.user.id);

        if (integrationsError) {
          console.error('Error fetching integrations:', integrationsError);
        } else {
          setIntegrations(integrationsData);
        }
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('webhook_events')
      .on('INSERT', { event: 'webhook_events' }, (payload: { new: WebhookEvent }) => {
        setRecentEvents((prev) => [payload.new, ...prev.slice(0, 4)]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handlers = useSwipeable({
    onSwipedLeft: () => setActiveSection((prev) => (prev + 1) % sections.length),
    onSwipedRight: () => setActiveSection((prev) => (prev - 1 + sections.length) % sections.length),
  });

  const logActivity = async (action: string, details?: any) => {
    const supabase = createClient();
    const { error } = await supabase.from('activity_logs').insert({
      action,
      details,
    });

    if (error) {
      console.error('Error logging activity:', error);
    }
  };

  const handleRetryFailedAction = async (actionId: string) => {
    // Implement retry logic here
    console.log('Retrying action:', actionId);
    // After successful retry:
    logActivity('Retried action', { actionId });
  };

  return (
    <div className="container mx-auto px-4 py-8" {...handlers}>
      <header className="flex flex-col md:flex-row items-center justify-between mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Welcome, {user?.name}</h1>
      </header>

      <div className="flex mb-4 overflow-x-auto">
        {sections.map((section, index) => (
          <button
            key={section}
            onClick={() => setActiveSection(index)}
            className={`px-4 py-2 mr-2 rounded-md ${
              activeSection === index ? 'bg-primary text-white' : 'bg-gray-200'
            }`}
          >
            {section}
          </button>
        ))}
      </div>

      {activeSection === 0 && (
        <section className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">API Usage Overview</h2>
          {/* Implement API usage chart here */}
        </section>
      )}

      {activeSection === 1 && (
        <section className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">Integrations</h2>
          <p className="mb-4">
            You have {integrations.length} out of {user?.integration_limit} integrations.
          </p>
          <ul className="space-y-2">
            {integrations.map((integration, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>{integration.name}</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  integration.status === 'Active' ? 'bg-green-200 text-green-800' :
                  integration.status === 'Pending' ? 'bg-yellow-200 text-yellow-800' :
                  'bg-red-200 text-red-800'
                }`}>
                  {integration.status}
                </span>
              </li>
            ))}
          </ul>
          <h3 className="text-lg font-semibold mt-6 mb-2">Recent Events</h3>
          <ul className="space-y-2">
            {recentEvents.map((event, index) => (
              <li key={index} className="text-sm text-gray-600">
                {event.event_type} - {new Date(event.created_at).toLocaleString()}
              </li>
            ))}
          </ul>
        </section>
      )}

      {activeSection === 2 && (
        <section className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">Subscription Plan</h2>
          <p className="mb-2">Current Plan: <strong>{user?.subscription_tier}</strong></p>
          <p className="mb-4">Integration Limit: {user?.integration_limit}</p>
          <a href="/pricing" className="btn">Upgrade Plan</a>
        </section>
      )}

      {activeSection === 3 && (
        <section className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">Activity Log</h2>
          <ActivityLog />
        </section>
      )}
    </div>
  );
}