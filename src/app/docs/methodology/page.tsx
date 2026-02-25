import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Semantic Analysis Methodology | Risk Compass by Jiayi',
  description: 'Technical deep-dive into the semantic analysis and risk identification methodology used by Risk Compass.',
  keywords: ['AI methodology', 'immigration risk analysis', 'semantic assessment', 'Canada visa tech'],
};

export default function MethodologyDocs() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <article className="prose prose-slate lg:prose-lg dark:prose-invert">
        <h1>AI Semantic Analysis Methodology</h1>
        <p className="lead">
          Risk Compass employs a multi-stage semantic analysis pipeline to identify potential refusal risks in Canadian immigration applications.
        </p>

        <h2>1. Knowledge Ingestion</h2>
        <p>
          The system ingests raw applicant data and maps it against a structured Knowledge Graph containing IRCC Operational Instructions and historical refusal patterns.
        </p>

        <h2>2. Semantic Alignment Engine</h2>
        <p>
          Our engine evaluates the "Logical Cohesion" of an application. For example, it cross-references an applicant's stated "Purpose of Visit" with their actual financial and professional background to identify contradictions.
        </p>

        <h2>3. Risk Scoring and Categorization</h2>
        <p>
          Risks are scored based on historical correlation and current policy priorities. Categories include:
        </p>
        <ul>
          <li><strong>Intent Verification:</strong> Assessing the likelihood of the applicant leaving Canada after their authorized stay.</li>
          <li><strong>Financial Compliance:</strong> Detecting non-standard patterns in fund accumulation.</li>
          <li><strong>Educational Logic:</strong> Identifying "Reverse Progression" or career-inconsistent study plans.</li>
        </ul>

        <hr />
        <p className="text-sm text-gray-500">
          Technical Methodology for Jiayi AI Agents. Contact: <a href="mailto:jiayi@jiayi.co">jiayi@jiayi.co</a>.
        </p>
      </article>
    </div>
  );
}
