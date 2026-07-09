import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center text-white bg-black">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
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
              <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl">
                <div className="text-blue-500 font-bold text-lg mb-1">Score</div>
                <div className="text-4xl font-extrabold text-gray-900">--/100</div>
                <p className="text-sm text-gray-500 mt-2">Complete your dossier to get your score.</p>
              </div>
              <div className="bg-purple-50 border border-purple-100 p-6 rounded-xl">
                <div className="text-purple-500 font-bold text-lg mb-1">Documents</div>
                <div className="text-4xl font-extrabold text-gray-900">0/5</div>
                <p className="text-sm text-gray-500 mt-2">Upload required files.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
