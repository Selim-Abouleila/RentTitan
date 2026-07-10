import React, { useState, useEffect } from 'react';

const DossierForm = ({ onSave }) => {
  const [formData, setFormData] = useState({
    targetRent: '',
    monthlyIncome: '',
    employmentStatus: 'CDI',
    hasGuarantor: false,
    guarantors: []
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch existing dossier on mount
  useEffect(() => {
    const fetchDossier = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:5000/dossiers', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setFormData({
            targetRent: data.targetRent || '',
            monthlyIncome: data.monthlyIncome || '',
            employmentStatus: data.employmentStatus || 'CDI',
            hasGuarantor: data.hasGuarantor || false,
            guarantors: data.guarantors || []
          });
        }
      } catch (error) {
        console.error('Error fetching dossier:', error);
      }
    };

    fetchDossier();
  }, []);

  const handleAddGuarantor = () => {
    setFormData({
      ...formData,
      guarantors: [...formData.guarantors, { name: '', monthlyIncome: '' }]
    });
  };

  const handleRemoveGuarantor = (index) => {
    const newGuarantors = formData.guarantors.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      guarantors: newGuarantors,
      hasGuarantor: newGuarantors.length > 0
    });
  };

  const handleGuarantorChange = (index, field, value) => {
    const newGuarantors = [...formData.guarantors];
    newGuarantors[index][field] = value;
    setFormData({ ...formData, guarantors: newGuarantors });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('http://localhost:5000/dossiers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage('Dossier saved successfully!');
        if (onSave) onSave();
      } else {
        setMessage('Failed to save dossier.');
      }
    } catch (error) {
      setMessage('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-gray-100 shadow-2xl rounded-3xl p-8 transition-all hover:shadow-3xl">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
        Your Financial Profile
      </h2>
      
      {message && (
        <div className={`p-4 rounded-xl mb-6 font-medium ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Target Rent (€)</label>
            <input 
              type="number"
              required
              min="0"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              value={formData.targetRent}
              onChange={(e) => setFormData({...formData, targetRent: e.target.value})}
              placeholder="e.g. 800"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Income (€)</label>
            <input 
              type="number"
              required
              min="0"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              value={formData.monthlyIncome}
              onChange={(e) => setFormData({...formData, monthlyIncome: e.target.value})}
              placeholder="e.g. 2400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Employment Status</label>
          <select 
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white"
            value={formData.employmentStatus}
            onChange={(e) => setFormData({...formData, employmentStatus: e.target.value})}
          >
            <option value="CDI">CDI (Permanent)</option>
            <option value="CDD">CDD (Fixed-term)</option>
            <option value="Student">Student</option>
            <option value="Alternance">Alternance (Apprenticeship)</option>
            <option value="Freelance">Freelance / Auto-entrepreneur</option>
            <option value="Unemployed">Unemployed</option>
          </select>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Guarantors</h3>
            <button
              type="button"
              onClick={handleAddGuarantor}
              className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-medium hover:bg-indigo-100 transition-colors text-sm flex items-center gap-2"
            >
              + Add Guarantor
            </button>
          </div>

          {formData.guarantors.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No guarantors added. Adding a guarantor can significantly boost your dossier score!</p>
          ) : (
            <div className="space-y-4">
              {formData.guarantors.map((guarantor, index) => (
                <div key={index} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                  <button 
                    type="button"
                    onClick={() => handleRemoveGuarantor(index)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    ✕
                  </button>
                  <h4 className="font-semibold text-gray-700 mb-4">Guarantor {index + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
                      <input 
                        type="text"
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={guarantor.name}
                        onChange={(e) => handleGuarantorChange(index, 'name', e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Monthly Income (€)</label>
                      <input 
                        type="number"
                        required
                        min="0"
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={guarantor.monthlyIncome}
                        onChange={(e) => handleGuarantorChange(index, 'monthlyIncome', e.target.value)}
                        placeholder="e.g. 3000"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transform transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving Profile...' : 'Save Profile & Calculate Baseline Score'}
        </button>
      </form>
    </div>
  );
};

export default DossierForm;
