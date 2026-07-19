import { useState, useRef } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';

const ResumePage = () => {
  const [resumes, setResumes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const fileInputRef = useRef(null);

  const handleUploadAndAnalyze = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!jobDescription.trim()) {
      toast.error('Please enter a job description');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);
    formData.append('targetCompany', targetCompany || 'General');

    setUploading(true);
    try {
      const { data } = await api.post('/resume/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAnalysis(data.data);
      setResumes((prev) => [{ fileName: file.name, createdAt: new Date(), id: Date.now() }, ...prev]);
      toast.success('Resume analyzed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Resume ATS Analyzer</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload & Analyze Resume</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:bg-white transition-all outline-none"
                placeholder="Paste the job description here..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Company (optional)
              </label>
              <input
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:bg-white transition-all outline-none"
                placeholder="e.g., Cognizant, TCS, Amazon"
              />
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleUploadAndAnalyze}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || !jobDescription.trim()}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  'Upload PDF & Analyze'
                )}
              </button>
            </div>
          </div>
        </div>

        {analysis && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 animate-fadeIn">
            <h2 className="text-xl font-semibold mb-6">Analysis Results</h2>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">ATS Score</p>
                <p className="text-3xl font-bold text-green-600">{analysis.atsScore}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">Keyword Match</p>
                <p className="text-3xl font-bold text-blue-600">{analysis.keywordMatch}%</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">Format</p>
                <p className="text-3xl font-bold text-purple-600">{analysis.formatScore}%</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">Action Verbs</p>
                <p className="text-3xl font-bold text-yellow-600">{analysis.actionVerbScore}%</p>
              </div>
              <div className="bg-pink-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">Quantification</p>
                <p className="text-3xl font-bold text-pink-600">{analysis.quantificationScore}%</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-green-700">✅ Matched Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.matchedKeywords?.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-red-700">❌ Missing Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingKeywords?.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {analysis.improvementSuggestions?.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">💡 Suggestions</h3>
                <ul className="list-disc list-inside space-y-2">
                  {analysis.improvementSuggestions.map((suggestion, idx) => (
                    <li key={idx} className="text-gray-700">{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.companyFeedback && (
              <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-indigo-800">{analysis.companyFeedback}</p>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Analysis History</h2>
          {resumes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No resumes analyzed yet. Upload a PDF to get started.</p>
          ) : (
            <div className="space-y-3">
              {resumes.map((resume) => (
                <div key={resume.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{resume.fileName}</p>
                    <p className="text-sm text-gray-500">{new Date(resume.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Analyzed
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumePage;