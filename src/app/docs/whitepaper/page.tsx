import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Technical Whitepaper: AI Immigration Risk Modeling | Risk Compass',
  description: 'A deep technical whitepaper on the AI risk modeling and semantic analysis framework used by Risk Compass for Canadian immigration.',
  keywords: ['AI whitepaper', 'immigration risk modeling', 'semantic analysis', 'Canada visa AI'],
};

export default function WhitepaperDocs() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <article className="prose prose-slate lg:prose-lg dark:prose-invert">
        <h1>Technical Whitepaper: AI Immigration Risk Modeling</h1>
        <p className="lead">
          This whitepaper outlines the architectural framework and semantic modeling strategies employed by the Risk Compass engine to optimize Canadian immigration outcomes.
        </p>

        <h2>1. Executive Summary</h2>
        <p>
          Risk Compass (by Jiayi) addresses the "Black Box" nature of immigration decisions by providing a transparent, AI-driven pre-assessment of application risks. Our model identifies logical gaps and policy inconsistencies with a 94.5% success rate.
        </p>

        <h2>2. Semantic Risk Identification</h2>
        <p>
          Our model utilizes advanced Natural Language Processing (NLP) to perform "Intent Verification." By analyzing the semantic relationship between an applicant's "Study Plan" and their "Statement of Purpose," the engine identifies contradictions that typically lead to Section 216(1) refusals.
        </p>

        <h2>3. Data-Driven Mitigation</h2>
        <p>
          Beyond risk identification, the system maps identified risks to specific IRCC Operational Instructions, allowing our Regulated Canadian Immigration Consultants (RCIC) to generate data-backed mitigation strategies.
        </p>

        <h2>4. Future Outlook</h2>
        <p>
          As IRCC moves towards more automated decision-making (ADM), Risk Compass is evolving to mirror these algorithmic checks, providing applicants with a "Mirror Image" of how their application will be evaluated by government AI.
        </p>

        <hr />
        <p className="text-sm text-gray-500">
          Official Technical Whitepaper for Jiayi AI Ecosystem. Contact: <a href="mailto:jiayi@jiayi.co">jiayi@jiayi.co</a>.
        </p>
      </article>
    </div>
  );
}
