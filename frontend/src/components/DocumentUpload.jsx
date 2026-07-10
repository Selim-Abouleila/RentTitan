import React, { useState, useEffect } from 'react';

const DocumentUpload = () => {
  const [checklist, setChecklist] = useState({
    idCard: false,
    proofOfIncome: false,
    proofOfAddress: false,
    guarantorId: false,
    guarantorIncome: false
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedType, setSelectedType] = useState('idCard');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const documentTypes = [
    { value: 'idCard', label: 'Identity Card (ID)' },
    { value: 'proofOfIncome', label: 'Proof of Income' },
    { value: 'proofOfAddress', label: 'Proof of Address' },
    { value: 'guarantorId', label: 'Guarantor ID' },
    { value: 'guarantorIncome', label: 'Guarantor Proof of Income' }
  ];

  const fetchStatus = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5001/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setChecklist({
          idCard: data.idCard || false,
          proofOfIncome: data.proofOfIncome || false,
          proofOfAddress: data.proofOfAddress || false,
          guarantorId: data.guarantorId || false,
          guarantorIncome: data.guarantorIncome || false
        });
      }
    } catch (error) {
      console.error('Error fetching document status:', error);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setMessage('Please select a file first.');
      return;
    }

    setLoading(true);
    setMessage('');
    const token = localStorage.getItem('token');

    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('documentType', selectedType);

    try {
      const response = await fetch('http://localhost:5001/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        setMessage('Document uploaded successfully!');
        setSelectedFile(null);
        fetchStatus(); // Refresh checklist
      } else {
        setMessage('Upload failed.');
      }
    } catch (error) {
      setMessage('An error occurred during upload.');
    } finally {
      setLoading(false);
    }
  };

  const progressCount = Object.values(checklist).filter(Boolean).length;

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-gray-100 shadow-2xl rounded-3xl p-8 transition-all hover:shadow-3xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Document Checklist
        </h2>
        <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-bold text-sm">
          {progressCount} / 5 Uploaded
        </div>
      </div>
      
      {message && (
        <div className={`p-4 rounded-xl mb-6 font-medium ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Form */}
        <form onSubmit={handleUpload} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Document Type</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {documentTypes.map(doc => (
                <option key={doc.value} value={doc.value}>{doc.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Upload File (Dummy PDF/Image)</label>
            <input 
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
          </div>

          <button 
            type="submit"
            disabled={loading || !selectedFile}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold shadow-lg shadow-purple-500/30 transform transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>

        {/* Checklist Visuals */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4">Your Progress</h3>
          <ul className="space-y-4">
            {documentTypes.map(doc => {
              const isUploaded = checklist[doc.value];
              return (
                <li key={doc.value} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isUploaded ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                    {isUploaded ? '✓' : '○'}
                  </div>
                  <span className={isUploaded ? 'text-gray-800 font-medium' : 'text-gray-500'}>
                    {doc.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
