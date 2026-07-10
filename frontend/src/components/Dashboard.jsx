import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DossierForm from './DossierForm';
import DocumentUpload from './DocumentUpload';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [scoreData, setScoreData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
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
          </div>
        </div>

        <DossierForm onSave={refreshScore} />
        <DocumentUpload onSave={refreshScore} />
      </div>
    </div>
  );
};

export default Dashboard;
