'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { v4 as uuidv4 } from 'uuid';

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

const DraggableField = ({ field, type }) => {
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

const DroppableArea = ({ onDrop, mappedFields }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'field',
    drop: (item) => onDrop(item),
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
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [mappedFields, setMappedFields] = useState([]);
  const [testResult, setTestResult] = useState(null);
  const [webhookUrl, setWebhookUrl] = useState('');

  const handlePlatformSelect = (platform) => {
    setSelectedPlatform(platform);
    setStep(2);
  };

  const handleApiKeySubmit = (e) => {
    e.preventDefault();
    // Here you would validate the API key with the selected platform
    // For now, we'll just move to the next step
    setStep(3);
  };

  const handleFieldDrop = (item) => {
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

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">API Integration Wizard</h2>
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
          <button onClick={handleTestIntegration} className="btn mt-4">
            Finish Setup
          </button>
        </div>
      )}
    </div>
  );
}