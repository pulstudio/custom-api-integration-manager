import ApiIntegrationWizard from '@/app/components/ApiIntegrationWizard';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Custom API Integration Manager</h1>
      <ApiIntegrationWizard />
    </main>
  );
}