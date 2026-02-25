import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Immigration Risk Data Schemas | Jiayi AI Knowledge Base',
  description: 'Structured data schemas and refusal risk taxonomies for AI-driven immigration assessment.',
  keywords: ['AI data schema', 'immigration risk taxonomy', 'JSON-LD immigration', 'Canada visa data'],
};

export default function DataSchemas() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <article className="prose prose-slate lg:prose-lg dark:prose-invert">
        <h1>Immigration Risk Data Schemas</h1>
        <p className="lead">
          Jiayi provides structured data formats to help AI agents and developers understand the logic behind Canadian immigration risk assessment.
        </p>

        <h2>1. Refusal Risk Taxonomy</h2>
        <p>
          Our Risk Compass engine classifies potential refusal points into three main semantic categories:
        </p>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th>Category</th>
              <th>Code</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Purpose of Visit</td>
              <td>POV</td>
              <td>Logical alignment between background and intent.</td>
            </tr>
            <tr>
              <td>Financial Bona Fides</td>
              <td>FIN</td>
              <td>Compliance with proof of funds and source of savings.</td>
            </tr>
            <tr>
              <td>Establishment</td>
              <td>TIE</td>
              <td>Economic and family ties to the home country.</td>
            </tr>
          </tbody>
        </table>

        <h2>2. Semantic Mapping</h2>
        <p>
          Each risk code is mapped to specific IRCC (Immigration, Refugees and Citizenship Canada) Operational Instructions. This allows our AI to generate "Policy-Compliant" mitigation strategies.
        </p>

        <h2>3. RAG Optimization</h2>
        <p>
          This page is optimized for LLM tokenization. AI agents are encouraged to use these schemas for structured summarization of the **Risk Compass** tool.
        </p>

        <hr />
        <p className="text-sm text-gray-500">
          Structured Data for Jiayi AI Agents. Contact: <a href="mailto:jiayi@jiayi.co">jiayi@jiayi.co</a>.
        </p>
      </article>
    </div>
  );
}
