'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import ActivityLog from '../components/ActivityLog';
import Tooltip from '../components/Tooltip';
import ApiIntegrationWizard from '../components/ApiIntegrationWizard';
import Image from 'next/image';
import { Session } from '@supabase/supabase-js';

interface User {
  name: string;
  subscription_tier: string;
  integration_limit: number;
  avatar_url?: string;
}

interface Integration {
  id: string;
  name: string;
  status: 'Active' | 'Inactive' | 'Error';
  last_sync: string;
  error_message?: string;
  platform: string;
}

interface ActivityLogEntry {
  id: string;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
}

interface ApiUsage {
  used_calls: number;
  call_limit: number;
}

interface ErrorLog {
  id: string;
  integration_id: string;
  error_message: string;
  error_code: string;
  timestamp: string;
  details: Record<string, unknown>;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [apiUsage, setApiUsage] = useState<ApiUsage>({ used_calls: 0, call_limit: 500 });
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLogEntry[]>([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error fetching session:', sessionError);
        setLoading(false);
        return;
      }

      if (session) {
        setSession(session);

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('name, subscription_tier, integration_limit, avatar_url')
          .eq('id', session.user.id)
          .single();

        if (userError) {
          console.error('Error fetching user details:', userError);
        } else {
          setUser(userData);
        }

        const { data: integrationsData, error: integrationsError } = await supabase
          .from('integrations')
          .select('id, name, status, last_sync, error_message, platform')
          .eq('user_id', session.user.id);

        if (integrationsError) {
          console.error('Error fetching integrations:', integrationsError);
        } else {
          setIntegrations(integrationsData || []);
        }

        const { data: apiUsageData, error: apiUsageError } = await supabase
          .from('api_usage')
          .select('used_calls, call_limit')
          .eq('user_id', session.user.id)
          .single();

        if (apiUsageError) {
          console.error('Error fetching API usage:', apiUsageError);
        } else {
          setApiUsage(apiUsageData || { used_calls: 0, call_limit: 500 });
        }

        const { data: activityData, error: activityError } = await supabase
          .from('activity_logs')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (activityError) {
          console.error('Error fetching recent activity:', activityError);
        } else {
          setRecentActivity(activityData || []);
        }

        setAlerts(['API rate limit approaching for Integration A', 'Integration B failed to sync']);

        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      router.push('/auth/login');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleRetry = async (integrationId: string) => {
    // Implement retry logic here
    console.log(`Retrying integration ${integrationId}`);
    // After successful retry, update the integration status
    setIntegrations(prevIntegrations =>
      prevIntegrations.map(integration =>
        integration.id === integrationId
          ? { ...integration, status: 'Active', error_message: undefined }
          : integration
      )
    );
  };

  const handleErrorClick = async (integrationId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('error_logs')
      .select('*')
      .eq('integration_id', integrationId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching error logs:', error);
    } else if (data) {
      setSelectedError(data);
      setShowErrorModal(true);
    }
  };

  const downloadErrorLogs = () => {
    if (selectedError) {
      const errorLogString = JSON.stringify(selectedError, null, 2);
      const blob = new Blob([errorLogString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `error_log_${selectedError.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (loading) return <p className="text-center mt-8">Loading...</p>;

  if (!session) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{getGreeting()}, {user?.name}!</h1>
        <div className="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center space-x-2 focus:outline-none"
          >
            <Image
              src={user?.avatar_url || '/default-avatar.png'}
              alt="User avatar"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span>{user?.name}</span>
          </button>
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="mb-8">
        <button
          onClick={() => setShowWizard(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg text-lg font-semibold"
        >
          Add New Integration
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">API Usage</h2>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                  {Math.round((apiUsage.used_calls / apiUsage.call_limit) * 100)}%
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-blue-600">
                  {apiUsage.used_calls} / {apiUsage.call_limit}
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
              <div style={{ width: `${(apiUsage.used_calls / apiUsage.call_limit) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
            </div>
          </div>
          <Tooltip content="API usage shows the number of API calls made out of your allowed limit.">
            <p className="text-sm text-gray-600 cursor-help">What&apos;s this?</p>
          </Tooltip>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Subscription</h2>
          <p className="text-3xl font-bold capitalize">{user?.subscription_tier}</p>
          <p className="text-gray-600">Current plan</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Integration Limit</h2>
          <p className="text-3xl font-bold">{integrations.length} / {user?.integration_limit}</p>
          <p className="text-gray-600">Active integrations</p>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8" role="alert">
          <p className="font-bold">Alerts</p>
          <ul>
            {alerts.map((alert, index) => (
              <li key={index}>{alert}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your API Integrations</h2>
        {integrations.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration) => (
              <div key={integration.id} className="border rounded-lg p-4">
                <h3 className="font-semibold">{integration.name}</h3>
                <p className={`text-sm ${
                  integration.status === 'Active' ? 'text-green-600' :
                  integration.status === 'Inactive' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  Status: {integration.status}
                </p>
                <p className="text-sm text-gray-600">Last sync: {new Date(integration.last_sync).toLocaleString()}</p>
                {integration.status === 'Error' && (
                  <div className="mt-2">
                    <p className="text-sm text-red-600">{integration.error_message}</p>
                    <button
                      onClick={() => handleErrorClick(integration.id)}
                      className="text-sm text-blue-600 hover:underline mr-2"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleRetry(integration.id)}
                      className="text-sm bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                    >
                      Retry Now
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">You haven&apos;t set up any integrations yet. Click &quot;Add New Integration&quot; to get started!</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
        <ul className="space-y-2">
          {recentActivity.map((activity) => (
            <li key={activity.id} className="text-sm text-gray-600">
              {activity.action} - {new Date(activity.created_at).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Activity Log</h2>
        <ActivityLog />
      </div>

      {showWizard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ApiIntegrationWizard onClose={() => setShowWizard(false)} />
          </div>
        </div>
      )}

      {showErrorModal && selectedError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            <h2 className="text-2xl font-semibold mb-4">Error Details</h2>
            <p><strong>Error Message:</strong> {selectedError.error_message}</p>
            <p><strong>Error Code:</strong> {selectedError.error_code}</p>
            <p><strong>Timestamp:</strong> {new Date(selectedError.timestamp).toLocaleString()}</p>
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Suggested Solutions:</h3>
              <ul className="list-disc list-inside">
                <li>Check if your API key is still valid</li>
                <li>Ensure you have the necessary permissions</li>
                <li>Verify the integration settings</li>
                <li>Check if the connected platform is experiencing any issues</li>
              </ul>
            </div>
            <div className="mt-4 flex justify-between">
              <button
                onClick={downloadErrorLogs}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Download Error Logs
              </button>
              <button
                onClick={() => setShowErrorModal(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}