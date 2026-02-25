import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Risk Compass AI Technical Documentation | Jiayi',
  description: 'Technical overview and AI model documentation for the Risk Compass immigration risk assessment tool.',
  keywords: ['AI immigration', 'risk assessment algorithm', 'RCIC verification', 'Canada visa AI'],
};

export default function RiskCompassDocs() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <article className="prose prose-slate lg:prose-lg dark:prose-invert">
        <h1>Risk Compass AI Technical Documentation</h1>
        <p className="lead">
          Risk Compass is a specialized AI-driven engine designed to analyze Canadian immigration application data and identify potential refusal risks.
        </p>

        <h2>1. System Architecture</h2>
        <p>
          The system utilizes a hybrid intelligence model, combining Large Language Models (LLMs) with a proprietary Knowledge Graph of Canadian immigration regulations and historical refusal cases.
        </p>

        <h3>1.1 Semantic Analysis Layer</h3>
        <p>
          This layer processes applicant background information (Education, Work History, Financial Status) and identifies logical inconsistencies that may lead to "Lack of Bona Fides" or "Purpose of Visit" refusals.
        </p>

        <h2>2. Risk Identification Logic</h2>
        <ul>
          <li><strong>Educational Progression:</strong> Analyzes if the proposed study plan follows a logical progression from previous education.</li>
          <li><strong>Financial Viability:</strong> Scans bank statements and proof of funds for patterns consistent with IRCC requirements.</li>
          <li><strong>Ties to Home Country:</strong> Evaluates the strength of economic and family ties to ensure compliance with dual intent regulations.</li>
        </ul>

        <h2>3. Human-in-the-Loop (HITL) Verification</h2>
        <p>
          Every AI-generated risk report is reviewed by a Regulated Canadian Immigration Consultant (RCIC). The AI provides the "what" and "where" of the risks, while the RCIC provides the "how" for mitigation strategies.
        </p>

        <h2>4. Data Privacy and Security</h2>
        <p>
          Jiayi adheres to strict data privacy standards. All applicant data is encrypted and used solely for the purpose of risk assessment.
        </p>

        <hr />
        <p className="text-sm text-gray-500">
          For further inquiries, contact the Jiayi technical team at <a href="mailto:jiayi@jiayi.co">jiayi@jiayi.co</a>.
        </p>
      </article>
    </div>
  );
}
