'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Tooltip from './Tooltip';
import { XMarkIcon as XIcon } from '@heroicons/react/24/solid';
import { logActivity } from '@/utils/supabase/client';
import UploadLogoAndAvatar from './UploadLogoAndAvatar';

interface Platform {
  name: string;
  logo: string;
  authType: 'oauth' | 'apiKey';
}

const platforms: Platform[] = [
  { name: 'Salesforce', logo: '/logos/salesforce.png', authType: 'oauth' },
  { name: 'Shopify', logo: '/logos/shopify.png', authType: 'apiKey' },
  { name: 'Google Sheets', logo: '/logos/google-sheets.png', authType: 'oauth' },
  // Add more platforms here
];

interface Field {
  id: string;
  name: string;
  example: string;
  type: 'source' | 'target';
}

interface ApiIntegrationWizardProps {
  onClose: () => void;
}

const DraggableField: React.FC<{ field: Field; type: 'source' | 'target' }> = ({ field, type }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'field',
    item: { ...field, type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const ref = useRef<HTMLDivElement>(null);
  drag(ref);

  return (
    <div
      ref={ref}
      className={`p-2 mb-2 bg-white border rounded cursor-move ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <p>{field.name}</p>
      <p className="text-xs text-gray-500">Example: {field.example}</p>
    </div>
  );
};

const DroppableArea: React.FC<{ onDrop: (item: Field & { type: 'source' | 'target' }) => void; mappedFields: { source: Field; target: Field }[] }> = ({ onDrop, mappedFields }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'field',
    drop: (item: Field & { type: 'source' | 'target' }) => onDrop(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const ref = useRef<HTMLDivElement>(null);
  drop(ref);

  return (
    <div
      ref={ref}
      className={`p-4 border-2 border-dashed rounded min-h-[200px] ${
        isOver ? 'bg-blue-100' : 'bg-gray-100'
      }`}
    >
      {mappedFields.map((mapping, index) => (
        <div key={index} className="p-2 mb-2 bg-white border rounded flex justify-between">
          <span>{mapping.source.name}</span>
          <span className="text-gray-500">→</span>
          <span>{mapping.target.name}</span>
        </div>
      ))}
      {mappedFields.length === 0 && (
        <p className="text-gray-500">Drag and drop fields here to map them</p>
      )}
    </div>
  );
};

export default function ApiIntegrationWizard({ onClose }: ApiIntegrationWizardProps) {
  const [step, setStep] = useState(1);
  const [sourcePlatform, setSourcePlatform] = useState<Platform | null>(null);
  const [targetPlatform, setTargetPlatform] = useState<Platform | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [mappedFields, setMappedFields] = useState<{ source: Field; target: Field }[]>([]);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [companyLogo, setCompanyLogo] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const sourceFields: Field[] = [
    { id: 'customerName', name: 'Customer Name', example: 'John Doe', type: 'source' },
    { id: 'email', name: 'Email', example: 'john@example.com', type: 'source' },
    { id: 'orderDate', name: 'Order Date', example: '2023-04-15', type: 'source' },
  ];

  const targetFields: Field[] = [
    { id: 'clientName', name: 'Client Name', example: 'Jane Smith', type: 'target' },
    { id: 'contactEmail', name: 'Contact Email', example: 'jane@example.com', type: 'target' },
    { id: 'purchaseDate', name: 'Purchase Date', example: '2023-04-16', type: 'target' },
  ];

  const filteredPlatforms = platforms.filter(platform =>
    platform.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePlatformSelect = (platform: Platform, type: 'source' | 'target') => {
    if (type === 'source') {
      setSourcePlatform(platform);
    } else {
      setTargetPlatform(platform);
    }
    if (sourcePlatform && targetPlatform) {
      setStep(2);
    }
  };

  const handleAuthentication = async () => {
    if (sourcePlatform?.authType === 'oauth' || targetPlatform?.authType === 'oauth') {
      // Implement OAuth flow here
      console.log('Initiating OAuth flow');
      // After OAuth is complete, move to next step
      setStep(3);
    } else if (apiKey) {
      // Validate API key
      const isValid = await validateApiKey(apiKey);
      if (isValid) {
        setStep(3);
      } else {
        setError('Invalid API key. Please try again.');
      }
    } else {
      setError('Please enter an API key.');
    }
  };

  const validateApiKey = async (key: string) => {
    // Implement API key validation logic here
    // This is a placeholder implementation
    return key.length > 10;
  };

  const handleFieldDrop = (item: Field & { type: 'source' | 'target' }) => {
    if (item.type === 'source') {
      const targetField = targetFields.find(field => !mappedFields.some(mapping => mapping.target.id === field.id));
      if (targetField) {
        setMappedFields(prev => [...prev, { source: item, target: targetField }]);
      }
    } else {
      const sourceField = sourceFields.find(field => !mappedFields.some(mapping => mapping.source.id === field.id));
      if (sourceField) {
        setMappedFields(prev => [...prev, { source: sourceField, target: item }]);
      }
    }
  };

  const handleTestIntegration = async () => {
    setTestResult(null);
    setError(null);
    // Implement actual integration test logic here
    await new Promise(resolve => setTimeout(resolve, 2000));
    const success = Math.random() > 0.3; // 70% success rate for demonstration
    if (success) {
      setTestResult('success');
      setStep(5);
      await logActivity('Integration created', { 
        sourcePlatform: sourcePlatform?.name, 
        targetPlatform: targetPlatform?.name 
      });
    } else {
      setTestResult('error');
      setError('Failed to connect. Please check your field mappings and try again.');
      await logActivity('Integration creation failed', { 
        sourcePlatform: sourcePlatform?.name, 
        targetPlatform: targetPlatform?.name,
        error: 'Failed to connect'
      });
    }
  };

  const handleLogoUpload = (logo: string) => {
    setCompanyLogo(logo);
  };

  const handleAvatarUpload = (avatar: string) => {
    setAvatarUrl(avatar);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h3 className="text-xl mb-4">Step 1: Select Platforms</h3>
            <input
              type="text"
              placeholder="Search platforms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 mb-4 border rounded"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Source Platform</h4>
                {filteredPlatforms.map((platform) => (
                  <button
                    key={platform.name}
                    onClick={() => handlePlatformSelect(platform, 'source')}
                    className={`flex items-center p-2 mb-2 border rounded w-full ${
                      sourcePlatform?.name === platform.name ? 'bg-blue-100 border-blue-500' : ''
                    }`}
                  >
                    <Image src={platform.logo} alt={platform.name} width={24} height={24} className="mr-2" />
                    {platform.name}
                  </button>
                ))}
              </div>
              <div>
                <h4 className="font-semibold mb-2">Target Platform</h4>
                {filteredPlatforms.map((platform) => (
                  <button
                    key={platform.name}
                    onClick={() => handlePlatformSelect(platform, 'target')}
                    className={`flex items-center p-2 mb-2 border rounded w-full ${
                      targetPlatform?.name === platform.name ? 'bg-blue-100 border-blue-500' : ''
                    }`}
                  >
                    <Image src={platform.logo} alt={platform.name} width={24} height={24} className="mr-2" />
                    {platform.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <h3 className="text-xl mb-4">Step 2: Authentication</h3>
            {(sourcePlatform?.authType === 'apiKey' || targetPlatform?.authType === 'apiKey') && (
              <div className="mb-4">
                <label htmlFor="apiKey" className="block mb-2">API Key</label>
                <input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter your API key"
                />
                <p className="text-sm text-gray-500 mt-1">
                  You can find your API key in your platform&apos;s dashboard settings.
                </p>
              </div>
            )}
            {(sourcePlatform?.authType === 'oauth' || targetPlatform?.authType === 'oauth') && (
              <p className="mb-4">Click the button below to authenticate with OAuth.</p>
            )}
            <button onClick={handleAuthentication} className="btn">
              Authenticate
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
        );
      case 3:
        return (
          <DndProvider backend={HTML5Backend}>
            <div>
              <h3 className="text-xl mb-4">Step 3: Map Data Fields</h3>
              <div className="flex">
                <div className="w-1/2 pr-4">
                  <h4 className="font-semibold mb-2">Source Fields ({sourcePlatform?.name})</h4>
                  {sourceFields.map((field) => (
                    <DraggableField key={field.id} field={field} type="source" />
                  ))}
                </div>
                <div className="w-1/2 pl-4">
                  <h4 className="font-semibold mb-2">Target Fields ({targetPlatform?.name})</h4>
                  {targetFields.map((field) => (
                    <DraggableField key={field.id} field={field} type="target" />
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Mapped Fields</h4>
                <DroppableArea onDrop={handleFieldDrop} mappedFields={mappedFields} />
              </div>
              <button onClick={() => setStep(4)} className="btn mt-4" disabled={mappedFields.length === 0}>
                Next: Test Integration
              </button>
            </div>
          </DndProvider>
        );
      case 4:
        return (
          <div>
            <h3 className="text-xl mb-4">Step 4: Test Integration</h3>
            <p className="mb-4">Click the button below to test the integration between {sourcePlatform?.name} and {targetPlatform?.name}.</p>
            <button onClick={handleTestIntegration} className="btn">
              Test Integration
            </button>
            {testResult === 'success' && (
              <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
                <p className="font-semibold">Integration test successful!</p>
                <p>Your integration is now active.</p>
              </div>
            )}
            {testResult === 'error' && (
              <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
                <p className="font-semibold">Integration test failed.</p>
                <p>{error}</p>
              </div>
            )}
          </div>
        );
      case 5:
        return (
          <div>
            <h3 className="text-xl mb-4">Integration Complete!</h3>
            <div className="p-4 bg-green-100 text-green-700 rounded">
              <p className="font-semibold">Your integration is now active!</p>
              <p>You have successfully connected {sourcePlatform?.name} to {targetPlatform?.name}.</p>
              <p>Your data is now syncing between the two platforms.</p>
            </div>
            <button onClick={onClose} className="btn mt-4">
              Return to Dashboard
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <XIcon className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4">API Integration Wizard</h2>
        {renderStep()}
        <div className="mt-8 flex justify-between text-sm text-gray-500">
          <Tooltip content="OAuth is a secure way to grant access to your data without sharing your password.">
            <span className="underline cursor-help">What&apos;s OAuth?</span>
          </Tooltip>
          <Tooltip content="Mapping fields allows you to specify how data should be transferred between platforms.">
            <span className="underline cursor-help">Why map fields?</span>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}