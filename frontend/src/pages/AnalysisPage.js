import React, { useState } from 'react';
import './AnalysisPage.css';
import { API_BASE_URL } from '../apiConfig';

const AnalysisPlaceholder = () => (
    <div className="analysis-result-placeholder">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20V16"/></svg>
        <h3>Your Analysis Will Appear Here</h3>
        <p>Click "Generate Analysis" to begin.</p>
    </div>
);

export default function AnalysisPage() {
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerateAnalysis = async () => {
        setIsLoading(true);
        setError('');
        setAnalysis('');
        try {
            const response = await fetch(`${API_BASE_URL}/analysis`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch analysis from the server.');
            }
            const data = await response.json();
            setAnalysis(data.analysis);
        } catch (err) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="analysis-page">
            <aside className="analysis-controls">
                <div className="analysis-header">
                    <h1>Global Data Analysis</h1>
                    <p>
                        Leverage AI to synthesize real-time data from global environmental databases and generate the latest insights.
                    </p>
                    <button
                        className="generate-button"
                        onClick={handleGenerateAnalysis}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Generating...' : 'Generate Analysis'}
                    </button>
                </div>
            </aside>

            <main className="analysis-content">
                {isLoading && <div className="loader"></div>}
                
                {error && <p className="error-message">{error}</p>}

                {!isLoading && !error && !analysis && <AnalysisPlaceholder />}

                {analysis && (
                    <div
                        className="analysis-result"
                        dangerouslySetInnerHTML={{ __html: analysis }}
                    />
                )}
            </main>
        </div>
    );
}