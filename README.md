# Custom API Integration Manager

Custom API Integration Manager is a SaaS solution designed for non-developers to easily create and manage custom API integrations between various tools such as CRM, ERP, and e-commerce platforms.

## Features

- User-friendly interface for creating API integrations
- Support for popular CRM, ERP, and e-commerce platforms
- Custom workflow creation
- Real-time data synchronization via webhooks
- Detailed analytics and logging
- Dashboard with API usage overview, integration status, and subscription information
- Pricing page with subscription tiers and Stripe integration for easy upgrades
- API Integration Wizard for non-developers

## Project Structure

- `app/`: Contains the routing and main pages (Next.js App Router)
  - `dashboard/`: Dashboard page
  - `pricing/`: Pricing and subscription page
  - `api/`: API routes for server-side operations
- `components/`: For reusable UI elements
- `utils/`: Utility functions and configurations
  - `supabase/`: Supabase client and server configurations
- `styles/`: For global and component-specific styles

## Technologies Used

- Next.js (with App Router)
- TypeScript
- Tailwind CSS (with dark mode support)
- Supabase (for authentication and database)
- Stripe (for payment processing)

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your Supabase project and update the `.env.local` file with your credentials
4. Set up your Stripe account and update the `.env.local` file with your Stripe keys
5. Run the development server: `npm run dev`

## Contributing

We welcome contributions! Please see our contributing guidelines for more information on how to get involved.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Deployment

This project is deployed on Vercel. You can view the live version at [your-vercel-url-here].