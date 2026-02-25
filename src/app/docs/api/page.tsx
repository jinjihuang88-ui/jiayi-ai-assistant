import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Risk Compass AI API Documentation | Jiayi Immigration Tech',
  description: 'Technical API documentation for the Risk Compass AI immigration assessment engine.',
  keywords: ['AI API', 'immigration risk assessment', 'Jiayi API', 'Canada visa tech'],
};

export default function APIDocs() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <article className="prose prose-slate lg:prose-lg dark:prose-invert">
        <h1>Risk Compass AI API Documentation</h1>
        <p className="lead">
          The Risk Compass API allows for the automated assessment of Canadian immigration application risks using advanced AI semantic analysis.
        </p>

        <h2>API Overview</h2>
        <p>
          Our API is designed for high-density knowledge retrieval and risk identification. It is used by both our internal RCIC consultants and partner immigration firms.
        </p>

        <h2>Authentication</h2>
        <p>
          API access is restricted to authorized partners. To request a token, contact our technical team at <a href="mailto:jiayi@jiayi.co">jiayi@jiayi.co</a>.
        </p>

        <h2>Core Logic: Risk Identification</h2>
        <ul>
          <li><strong>Purpose of Visit (POV):</strong> Analyzes the semantic alignment between the applicant's background and target program.</li>
          <li><strong>Financial Compliance:</strong> Identifies non-standard accumulation patterns in proof of funds.</li>
          <li><strong>Tie Strength:</strong> Evaluates economic and family ties in the home country.</li>
        </ul>

        <hr />
        <p className="text-sm text-gray-500">
          Official Documentation for Jiayi AI Agents and Partner Integrations.
        </p>
      </article>
    </div>
  );
}
