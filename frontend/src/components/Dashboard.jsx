import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DossierForm from './DossierForm';
import DocumentUpload from './DocumentUpload';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [scoreData, setScoreData] = useState(null);
  const [aiPitch, setAiPitch] = useState('');
  const [aiError, setAiError] = useState('');
  const [generatingPitch, setGeneratingPitch] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // [PRESENTATION NOTE] Effect hook to fetch protected user data on mount.
    // Checks if the user is authenticated via JWT. If the token is valid, it fetches 
    // the user's profile and dossier score. Otherwise, it logs them out.
    const fetchProtectedData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/auth/protected-demo', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          fetchScore(token);
        } else {
          localStorage.removeItem('token');
          navigate('/');
        }
      } catch (err) {
        setError('Failed to fetch data');
      }
    };

    fetchProtectedData();
  }, [navigate]);

  const fetchScore = async (token) => {
    // Fetches the user's dossier score using a GraphQL query.
    // It directly targets the Scoring Service on port 5002, querying the 'myDossier' endpoint.
    try {
      const query = `
        query myDossier {
          myDossier {
            score
            missingDocuments
            suggestions
          }
        }
      `;
      const response = await fetch('http://localhost:5002/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query })
      });
      if (response.ok) {
        const { data, errors } = await response.json();
        if (!errors && data.myDossier) {
          setScoreData(data.myDossier);
        }
      }
    } catch (err) {
      console.error('Error fetching score:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const refreshScore = () => {
    const token = localStorage.getItem('token');
    if (token) fetchScore(token);
  };

  const generateAIPitch = async () => {
    // Triggers the AI Landlord Pitch generation.
    // It sends the user's score and suggestions to the Scoring Service, 
    // which securely passes the user's financial context to the Google Gemini API to return a tailored message.
    if (!scoreData) return;
    setGeneratingPitch(true);
    setAiPitch('');
    setAiError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5002/api/v1/ai/generate-pitch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          score: scoreData.score,
          suggestions: scoreData.suggestions
        })
      });

      const data = await response.json();

      if (response.ok) {
        setAiPitch(data.pitch);
      } else {
        setAiError(data.message || 'Failed to generate AI pitch.');
      }
    } catch (err) {
      console.error(err);
      setAiError('Failed to connect to the AI service. Please try again later.');
    } finally {
      setGeneratingPitch(false);
    }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center text-white bg-black">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Logo Placed Above the Dashboard */}
        <div className="flex justify-center pb-4">
          <img src="/rent_titan_logo.png" alt="RentTitan Logo" className="h-56 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300" />
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Welcome to RentTitan</h1>
              <p className="opacity-90 mt-2">Hello, {user.name}!</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-lg transition-colors font-medium text-white border border-white/30"
            >
              Sign Out
            </button>
          </div>

          <div className="p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Dossier Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <svg className="w-16 h-16 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                </div>
                <div className="text-blue-500 font-bold text-lg mb-1 relative z-10">Dossier Score</div>
                <div className="text-4xl font-extrabold text-gray-900 relative z-10">{scoreData ? scoreData.score : '--'}/100</div>
                {scoreData && (
                  <p className="text-sm text-gray-500 mt-2 relative z-10">Based on financial & document data.</p>
                )}
              </div>
              <div className="bg-purple-50 border border-purple-100 p-6 rounded-xl">
                <div className="text-purple-500 font-bold text-lg mb-1">Documents</div>
                <div className="text-4xl font-extrabold text-gray-900">0/5</div>
                <p className="text-sm text-gray-500 mt-2">Upload required files.</p>
              </div>
            </div>

            {scoreData && scoreData.suggestions && scoreData.suggestions.length > 0 && (
              <div className="mt-6 bg-yellow-50 border border-yellow-100 p-6 rounded-xl">
                <h3 className="text-yellow-700 font-bold text-lg mb-2">How to improve your score:</h3>
                <ul className="list-disc list-inside space-y-1 text-yellow-800/80 font-medium">
                  {scoreData.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {scoreData && (
              <div className="mt-8 border-t border-gray-100 pt-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">AI Landlord Pitch</h3>
                    <p className="text-sm text-gray-500">Generate a professional, personalized message for landlords.</p>
                  </div>
                  <button
                    onClick={generateAIPitch}
                    disabled={generatingPitch}
                    className="px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold shadow-lg hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2 border border-gray-700"
                  >
                    {generatingPitch ? (
                      <span className="animate-pulse">Generating...</span>
                    ) : (
                      <>
                        <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        Generate Pitch
                      </>
                    )}
                  </button>
                </div>
                {aiPitch && (
                  <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 shadow-inner relative mt-4">
                    <p className="text-gray-800 whitespace-pre-wrap font-medium leading-relaxed">{aiPitch}</p>
                    <button
                      onClick={() => navigator.clipboard.writeText(aiPitch)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Copy to clipboard"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    </button>
                  </div>
                )}
                {aiError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl mt-4 flex items-start gap-3">
                    <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    <div>
                      <h4 className="text-red-800 font-bold">API Error</h4>
                      <p className="text-red-700 text-sm mt-1">{aiError}</p>
                      <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-sm text-red-600 font-bold hover:underline">Get a free Gemini API Key here →</a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DossierForm onSave={refreshScore} />
        <DocumentUpload onSave={refreshScore} />
      </div>
    </div>
  );
};

export default Dashboard;
