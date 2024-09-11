'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';
import { useSwipeable } from 'react-swipeable';

// Mock data (replace with actual data fetching logic later)
const mockData = {
  user: { name: 'John Doe', avatar: '/avatar-placeholder.png' },
  apiCalls: 1500,
  apiLimit: 2000,
  integrations: [
    { name: 'Salesforce', status: 'Active' },
    { name: 'HubSpot', status: 'Pending' },
    { name: 'Shopify', status: 'Failed' },
  ],
  subscriptionPlan: 'Pro',
};

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState(0);
  const sections = ['API Usage', 'Integrations', 'Subscription'];
  const [recentEvents, setRecentEvents] = useState([]);

  useEffect(() => {
    const supabase = createClient();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('webhook_events')
      .on('INSERT', { event: 'webhook_events' }, (payload) => {
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

  return (
    <div className="container mx-auto px-4 py-8" {...handlers}>
      <header className="flex flex-col md:flex-row items-center justify-between mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Welcome, {mockData.user.name}</h1>
        <Image
          src={mockData.user.avatar}
          alt="User Avatar"
          width={48}
          height={48}
          className="rounded-full"
        />
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
          <div className="h-40 bg-gray-200 rounded flex items-end">
            <div
              className="bg-primary h-full rounded"
              style={{ width: `${(mockData.apiCalls / mockData.apiLimit) * 100}%` }}
            ></div>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {mockData.apiCalls} / {mockData.apiLimit} API calls this month
          </p>
        </section>
      )}

      {activeSection === 1 && (
        <section className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">Integrations</h2>
          <ul className="space-y-2">
            {mockData.integrations.map((integration, index) => (
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
          <p className="mb-2">Current Plan: <strong>{mockData.subscriptionPlan}</strong></p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-primary h-2.5 rounded-full" style={{ width: '75%' }}></div>
          </div>
          <p className="mt-2 text-sm text-gray-600">75% of your plan limit used</p>
        </section>
      )}
    </div>
  );
}