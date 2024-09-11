'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/utils/supabase/client';

const platforms = [
  { name: 'Salesforce', logo: '/logos/salesforce.png' },
  { name: 'HubSpot', logo: '/logos/hubspot.png' },
  { name: 'Shopify', logo: '/logos/shopify.png' },
];

const fields = [
  { id: 'customerName', name: 'Customer Name' },
  { id: 'orderInfo', name: 'Order Info' },
  { id: 'email', name: 'Email' },
];

interface Field {
  id: string;
  name: string;
}

interface Platform {
  name: string;
  logo: string;
}

interface DraggableFieldProps {
  field: Field;
  type: string;
}

const DraggableField: React.FC<DraggableFieldProps> = ({ field, type }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'field',
    item: { id: field.id, type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`p-2 mb-2 bg-white border rounded cursor-move ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      {field.name}
    </div>
  );
};

interface DroppableAreaProps {
  onDrop: (item: Field) => void;
  mappedFields: Field[];
}

const DroppableArea: React.FC<DroppableAreaProps> = ({ onDrop, mappedFields }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'field',
    drop: (item: Field) => onDrop(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`p-4 border-2 border-dashed rounded min-h-[200px] ${
        isOver ? 'bg-blue-100' : 'bg-gray-100'
      }`}
    >
      {mappedFields.map((field) => (
        <div key={field.id} className="p-2 mb-2 bg-white border rounded">
          {field.name}
        </div>
      ))}
      {mappedFields.length === 0 && (
        <p className="text-gray-500">Drop fields here</p>
      )}
    </div>
  );
};

export default function ApiIntegrationWizard() {
  const [step, setStep] = useState(1);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [mappedFields, setMappedFields] = useState<Field[]>([]);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [user, setUser] = useState<{ subscription_tier: string; integration_limit: number } | null>(null);
  const [currentIntegrations, setCurrentIntegrations] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

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
          .select('subscription_tier, integration_limit')
          .eq('id', userData.user.id)
          .single();

        if (detailsError) {
          console.error('Error fetching user details:', detailsError);
        } else {
          setUser(userDetails);
        }

        const { count, error: countError } = await supabase
          .from('integrations')
          .select('id', { count: 'exact' })
          .eq('user_id', userData.user.id);

        if (countError) {
          console.error('Error fetching integration count:', countError);
        } else {
          setCurrentIntegrations(count || 0);
        }
      }
    };

    fetchUserData();
  }, []);

  const handlePlatformSelect = (platform: Platform) => {
    setSelectedPlatform(platform);
    setStep(2);
  };

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would validate the API key with the selected platform
    // For now, we'll just move to the next step
    setStep(3);
  };

  const handleFieldDrop = (item: Field) => {
    setMappedFields((prev) => [...prev, item]);
  };

  const generateWebhookUrl = () => {
    const integrationId = uuidv4();
    const url = `${window.location.origin}/api/webhook?integrationId=${integrationId}`;
    setWebhookUrl(url);
  };

  const handleTestIntegration = () => {
    // Here you would test the integration with the mapped fields
    // For now, we'll just simulate a successful test
    setTestResult('success');
    setStep(4);
  };

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

  const handleFinishSetup = async () => {
    if (user && currentIntegrations >= user.integration_limit) {
      setError('You have reached your integration limit. Please upgrade your plan to create more integrations.');
      return;
    }

    try {
      // Here you would save the integration to your database
      // For now, we'll just simulate a successful save
      setCurrentIntegrations(prev => prev + 1);
      logActivity('Created integration', { platform: selectedPlatform?.name });
      alert('Integration saved successfully!');
      // Reset the wizard
      setStep(1);
      setSelectedPlatform(null);
      setApiKey('');
      setMappedFields([]);
      setTestResult(null);
      setWebhookUrl('');
      setError(null);
    } catch (err) {
      setError('Failed to create integration. Please try again.');
      console.error('Error creating integration:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">API Integration Wizard</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {step === 1 && (
        <div>
          <h3 className="text-xl mb-4">Step 1: Select Platform</h3>
          <div className="grid grid-cols-3 gap-4">
            {platforms.map((platform) => (
              <div
                key={platform.name}
                className="p-4 border rounded cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handlePlatformSelect(platform)}
              >
                <Image
                  src={platform.logo}
                  alt={platform.name}
                  width={100}
                  height={100}
                  className="mx-auto mb-2"
                />
                <p className="text-center">{platform.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {step === 2 && (
        <div>
          <h3 className="text-xl mb-4">Step 2: Connect Account</h3>
          <form onSubmit={handleApiKeySubmit}>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter API Key"
              className="w-full p-2 border rounded mb-4"
            />
            <button type="submit" className="btn">
              Connect
            </button>
          </form>
        </div>
      )}
      {step === 3 && (
        <DndProvider backend={HTML5Backend}>
          <div>
            <h3 className="text-xl mb-4">Step 3: Map Fields</h3>
            <div className="flex">
              <div className="w-1/2 pr-4">
                <h4 className="mb-2">Available Fields</h4>
                {fields.map((field) => (
                  <DraggableField key={field.id} field={field} type="source" />
                ))}
              </div>
              <div className="w-1/2 pl-4">
                <h4 className="mb-2">Mapped Fields</h4>
                <DroppableArea onDrop={handleFieldDrop} mappedFields={mappedFields} />
              </div>
            </div>
            <button onClick={handleTestIntegration} className="btn mt-4">
              Test Integration
            </button>
          </div>
        </DndProvider>
      )}
      {step === 4 && (
        <div>
          <h3 className="text-xl mb-4">Step 4: Webhook Configuration</h3>
          <button onClick={generateWebhookUrl} className="btn mb-4">
            Generate Webhook URL
          </button>
          {webhookUrl && (
            <div>
              <p className="mb-2">Your webhook URL:</p>
              <input
                type="text"
                value={webhookUrl}
                readOnly
                className="w-full p-2 border rounded mb-4"
              />
              <p className="text-sm text-gray-600">
                Use this URL in your integration to receive real-time updates.
              </p>
            </div>
          )}
          <button onClick={handleFinishSetup} className="btn mt-4">
            Finish Setup
          </button>
        </div>
      )}
    </div>
  );
}