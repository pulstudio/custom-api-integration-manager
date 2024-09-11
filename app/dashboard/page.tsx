import React from 'react';
import Image from 'next/image';

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
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Welcome, {mockData.user.name}</h1>
        <Image
          src={mockData.user.avatar}
          alt="User Avatar"
          width={48}
          height={48}
          className="rounded-full"
        />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="card">
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

        <section className="card">
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
        </section>

        <section className="card md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Subscription Plan</h2>
          <p className="mb-2">Current Plan: <strong>{mockData.subscriptionPlan}</strong></p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-primary h-2.5 rounded-full" style={{ width: '75%' }}></div>
          </div>
          <p className="mt-2 text-sm text-gray-600">75% of your plan limit used</p>
        </section>
      </div>
    </div>
  );
}