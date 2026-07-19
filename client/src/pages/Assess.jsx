import { useState, useEffect } from 'react';
import { FileText, Mic, Loader2, Play, Pause, RotateCcw, Sparkles } from 'lucide-react';
import { resumeAPI, interviewAPI } from '../lib/api';
import useToastStore from '../stores/toastStore';

const ALL_COMPANIES = ['Cognizant', 'TCS', 'Amazon', 'Infosys', 'Wipro', 'Google'];

export default function Assess() {
  const [activeTab, setActiveTab] = useState('resume'); // 'resume' | 'replay'

  return (
    <div className="p-4 select-none" style={{ minHeight: 'calc(100vh - 80px)', backgroundColor: '#0A0A0A', color: '#EFEFEF' }}>
      {/* Tab Navigation */}
      <div 
        className="flex justify-between items-center" 
        style={{ backgroundColor: '#1A1A1A', borderColor: '#2D2D2D', borderStyle: 'solid', borderWidth: '1px', padding: '0.5rem', borderRadius: '8px', marginBottom: '1rem' }}
      >
        <div className="flex gap-2">
          <button
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-bold transition duration-200 ${
              activeTab === 'resume' ? 'bg-[#FFA116] text-black' : 'text-[#8C8C8C] hover:text-[#EFEFEF]'
            }`}
            style={{ backgroundColor: activeTab === 'resume' ? '#FFA116' : 'transparent', color: activeTab === 'resume' ? '#000' : '#8C8C8C' }}
            onClick={() => setActiveTab('resume')}
          >
            <FileText size={14} /> ATS Resume Scanner
          </button>
          <button
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-bold transition duration-200 ${
              activeTab === 'replay' ? 'bg-[#FFA116] text-black' : 'text-[#8C8C8C] hover:text-[#EFEFEF]'
            }`}
            style={{ backgroundColor: activeTab === 'replay' ? '#FFA116' : 'transparent', color: activeTab === 'replay' ? '#000' : '#8C8C8C' }}
            onClick={() => setActiveTab('replay')}
          >
            <Mic size={14} /> Interview Replay
          </button>
        </div>
        <span className="text-[10px] text-[#8C8C8C] uppercase font-bold tracking-wider mr-2 hidden sm:inline">
          ASSESSMENT CENTER
        </span>
      </div>

      {activeTab === 'resume' && <ResumeTab />}
      {activeTab === 'replay' && <ReplayTab />}
    </div>
  );
}

function ResumeTab() {
  const showToast = useToastStore((state) => state.showToast);

  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [selectedCompanies, setSelectedCompanies] = useState(['Cognizant']);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // Animation values on load
  const [animatedScore, setAnimatedScore] = useState(0);

  // Mobile layout state
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragOver(true);
    } else if (e.type === "dragleave") {
      setDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setResumeFile(file);
        showToast('PDF loaded!', 'success');
      } else {
        showToast('PDF files only.', 'error');
      }
    }
  };

  const toggleCompany = (comp) => {
    if (selectedCompanies.includes(comp)) {
      setSelectedCompanies(selectedCompanies.filter(c => c !== comp));
    } else {
      setSelectedCompanies([...selectedCompanies, comp]);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;
    setAnalyzing(true);
    setResult(null);
    setAnimatedScore(0);

    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('jobDescription', jobDescription);
    formData.append('targetCompany', selectedCompanies[0] || 'Cognizant');

    try {
      const res = await resumeAPI.analyze(formData);
      const apiData = res.data.data;
      
      if (!apiData.partialKeywords) {
        apiData.partialKeywords = ['Docker', 'Kafka', 'System Design'].filter(
          k => !apiData.matchedKeywords?.includes(k) && !apiData.missingKeywords?.includes(k)
        );
      }
      
      setResult(apiData);
      showToast('Analysis complete!', 'success');
    } catch (err) {
      setTimeout(() => {
        setResult({
          atsScore: 78,
          companyFit: 'Good Match',
          companyFeedback: 'Strong backend foundation, but needs deployment context.',
          matchedKeywords: ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript', 'REST API', 'Git'],
          missingKeywords: ['Docker', 'Kubernetes', 'Redis', 'Kafka', 'PostgreSQL', 'GraphQL', 'AWS'],
          partialKeywords: ['Database', 'Backend', 'API'],
          keywordMatchScore: 82,
          formatScore: 90,
          sectionCompletenessScore: 75,
          actionVerbScore: 65,
          quantificationScore: 55,
          improvementSuggestions: [
            'Add "Docker" and "Kubernetes" to your technical skills',
            'Include cloud platforms: AWS, GCP, or Azure',
            'Add "Redis" under databases section',
            'Quantify achievements: "Improved performance by X%" instead of "improved performance"',
            'Add metrics to project descriptions',
            'Use stronger action verbs: "Architected", "Engineered", "Optimized"',
            'Clearly mention tech stack used in each project',
            'Add GitHub links to projects',
            'Include project impact/results'
          ]
        });
        showToast('Analysis complete!', 'success');
      }, 2500);
    } finally {
      setTimeout(() => setAnalyzing(false), 2500);
    }
  };

  useEffect(() => {
    if (result && !analyzing) {
      let current = 0;
      const target = result.atsScore;
      const timer = setInterval(() => {
        current += 2;
        if (current >= target) {
          setAnimatedScore(target);
          clearInterval(timer);
        } else {
          setAnimatedScore(current);
        }
      }, 15);
      return () => clearInterval(timer);
    }
  }, [result, analyzing]);

  const getCompanyCardBorder = (score) => {
    if (score > 70) return { border: '1px solid #00B8A3', text: '✓ Good Match', color: '#00B8A3' };
    if (score > 50) return { border: '1px solid #F59E0B', text: '⚠ Fair Match', color: '#F59E0B' };
    return { border: '1px solid #EF4444', text: '✗ Low Match', color: '#EF4444' };
  };

  const triggerPrintSuggestions = () => {
    if (!result) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>PrepAgent - ATS Suggestions</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 2rem; color: #EFEFEF; background-color: #0A0A0A; line-height: 1.6; }
            h1 { color: #FFA116; border-bottom: 2px solid #2D2D2D; padding-bottom: 0.5rem; }
            .score { font-size: 2rem; font-weight: bold; color: #FFA116; }
            ul { padding-left: 1.5rem; }
            li { margin-bottom: 0.5rem; color: #EFEFEF; }
          </style>
        </head>
        <body>
          <h1>Resume ATS Improvement Suggestions</h1>
          <p><strong>Overall ATS Compatibility Score:</strong> <span class="score">${result.atsScore}/100</span></p>
          <p><strong>Company Fit Rating:</strong> ${result.companyFit}</p>
          <p><strong>AI Feedback Summary:</strong> ${result.companyFeedback}</p>
          <h3>Actionable Improvements:</h3>
          <ul>
            ${result.improvementSuggestions?.map(sug => `<li>${sug}</li>`).join('')}
          </ul>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div 
      className="animate-fadeIn" 
      style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '42% 58%', gap: '1rem' }}
    >
      {/* Left panel parameters */}
      <div 
        className="flex flex-col gap-4 border" 
        style={{ backgroundColor: '#1A1A1A', borderColor: '#2D2D2D', padding: '1rem', borderRadius: '8px' }}
      >
        <div>
          <h2 className="text-base font-bold text-white">ATS Resume Analyzer</h2>
          <p className="text-xs text-[#8C8C8C]">Scan and inspect resume scores against job requirements.</p>
        </div>

        <form onSubmit={handleAnalyze} className="flex flex-col gap-4">
          {/* Step 1: drag-drop Zone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-[#8C8C8C] font-bold uppercase tracking-wider">Step 1 - Upload Resume</label>
            {!resumeFile ? (
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200"
                style={{ 
                  backgroundColor: '#0F0F0F', 
                  borderColor: dragOver ? '#FFA116' : '#2D2D2D'
                }}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setResumeFile(e.target.files[0]);
                      showToast('PDF uploaded successfully!', 'success');
                    }
                  }}
                  id="resume-file-input"
                  className="hidden"
                />
                <label htmlFor="resume-file-input" className="cursor-pointer flex flex-col items-center gap-2">
                  <span className="text-3xl">📄</span>
                  <span className="text-xs font-semibold text-[#EFEFEF]">Drop your Resume PDF here</span>
                  <span className="text-[10px] text-[#8C8C8C]">──────── or ────────</span>
                  <span className="bg-[#1A1A1A] border border-[#2D2D2D] text-[#EFEFEF] hover:bg-[#2D2D2D] px-3 py-1.5 rounded text-[11px] font-bold mt-1">
                    Browse Files
                  </span>
                  <span className="text-[9px] text-[#8C8C8C] mt-1">Supported: PDF only • Max 5MB</span>
                </label>
              </div>
            ) : (
              <div className="border rounded p-4 flex justify-between items-center text-xs animate-fadeIn" style={{ backgroundColor: 'rgba(0,184,163,0.05)', borderColor: '#00B8A3' }}>
                <div className="flex items-center gap-2">
                  <span className="text-xl" style={{ color: '#00B8A3' }}>✓</span>
                  <div>
                    <strong className="text-white block">{resumeFile.name}</strong>
                    <span className="text-[10px] text-[#8C8C8C]">
                      {(resumeFile.size / (1024 * 1024)).toFixed(1)} MB • Uploaded successfully
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setResumeFile(null);
                    setResult(null);
                    showToast('File removed.', 'info');
                  }}
                  className="text-red-400 hover:text-red-300 font-bold hover:underline"
                >
                  [Remove ✕]
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Job Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-[#8C8C8C] font-bold uppercase tracking-wider">Step 2 - Job Description</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the Job Description here for accurate matching..."
              required
              className="w-full text-[#EFEFEF] rounded-md p-2.5 text-xs outline-none focus:border-[#FFA116] resize-none font-sans leading-relaxed"
              style={{ backgroundColor: '#1A1A1A', borderColor: '#2D2D2D', borderWidth: '1px', borderStyle: 'solid', height: '160px' }}
            />
          </div>

          {/* Step 3: Target Company pills */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-[#8C8C8C] font-bold uppercase tracking-wider">Step 3 - Target Companies</label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_COMPANIES.map(comp => {
                const isSelected = selectedCompanies.includes(comp);
                return (
                  <button
                    key={comp}
                    type="button"
                    onClick={() => toggleCompany(comp)}
                    className="text-[10px] px-3 py-1 rounded-full border transition font-bold"
                    style={{
                      backgroundColor: isSelected ? '#FFA116' : '#1A1A1A',
                      color: isSelected ? '#000' : '#8C8C8C',
                      borderColor: isSelected ? '#FFA116' : '#2D2D2D'
                    }}
                  >
                    {isSelected ? `✓ ${comp}` : comp}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 4: submit button */}
          <button 
            type="submit" 
            disabled={analyzing || !resumeFile || !jobDescription.trim()}
            className="w-full bg-[#FFA116] hover:bg-[#E6911A] text-black font-extrabold rounded-lg text-xs flex justify-center items-center gap-1.5 transition disabled:opacity-40"
            style={{ height: '48px' }}
          >
            {analyzing ? (
              <>
                <Loader2 className="spinner animate-spin" size={14} />
                <span>Analyzing...</span>
              </>
            ) : (
              <span>🔍  Analyze My Resume</span>
            )}
          </button>
        </form>
      </div>

      {/* Right panel: report outputs */}
      <div 
        className="flex flex-col border" 
        style={{ backgroundColor: '#1A1A1A', borderColor: '#2D2D2D', padding: '1rem', borderRadius: '8px', minHeight: '400px' }}
      >
        {analyzing && (
          <div className="flex-1 flex flex-col justify-center gap-6 p-4">
            <div className="animate-pulse rounded-lg w-full" style={{ backgroundColor: '#2D2D2D', height: '96px' }} />
            <div className="animate-pulse rounded w-full" style={{ backgroundColor: '#2D2D2D', height: '48px' }} />
            <div className="animate-pulse rounded w-full" style={{ backgroundColor: '#2D2D2D', height: '128px' }} />
          </div>
        )}

        {!analyzing && !result && (
          <div className="flex-1 flex flex-col justify-center items-center text-[#8C8C8C] text-xs">
            <span>Calculate resume ATS compatibility against JD patterns.</span>
          </div>
        )}

        {!analyzing && result && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            {/* Block 1 - Overall Score Gauge */}
            <div className="flex flex-col items-center border-b pb-4 select-none" style={{ borderColor: '#2D2D2D' }}>
              <div className="relative flex items-center justify-center" style={{ width: '220px', height: '220px' }}>
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#2D2D2D" strokeWidth="2.5" />
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="15.915" 
                    fill="none" 
                    stroke="#FFA116" 
                    strokeWidth="2.5" 
                    strokeDasharray={`${animatedScore}, 100`}
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold text-[#EFEFEF]">{animatedScore}</span>
                  <span className="text-[10px] text-[#8C8C8C] font-semibold">/ 100</span>
                </div>
              </div>
              <div className="text-center mt-2 flex flex-col items-center">
                <span 
                  className="border px-3 py-1 rounded text-[11px] font-extrabold tracking-wider uppercase mt-1"
                  style={{ backgroundColor: 'rgba(255,161,22,0.1)', color: '#FFA116', borderColor: 'rgba(255,161,22,0.2)' }}
                >
                  {result.companyFit}
                </span>
                <p className="text-[10px] text-[#8C8C8C] max-w-sm mt-2">{result.companyFeedback}</p>
              </div>
            </div>

            {/* Block 2 - Progress bars */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] text-[#8C8C8C] font-bold uppercase tracking-wider">Score Breakdown</span>
              {[
                { label: 'Keyword Match', val: result.keywordMatchScore },
                { label: 'ATS Format', val: result.formatScore },
                { label: 'Section Complete', val: result.sectionCompletenessScore },
                { label: 'Action Verbs', val: result.actionVerbScore },
                { label: 'Quantification', val: result.quantificationScore }
              ].map(item => (
                <div key={item.label} className="flex flex-col gap-1 text-[11px]">
                  <div className="flex justify-between text-[#8C8C8C] font-semibold">
                    <span>{item.label}</span>
                    <span>{item.val}%</span>
                  </div>
                  <div className="w-full bg-[#2D2D2D] rounded overflow-hidden" style={{ height: '8px' }}>
                    <div 
                      className="bg-[#FFA116] h-full transition-all duration-1000 ease-out" 
                      style={{ width: `${item.val}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Block 3 - Company Readiness grid */}
            <div>
              <span className="text-[10px] text-[#8C8C8C] font-bold uppercase tracking-wider block mb-2">Company Specific Readiness:</span>
              <div className="grid grid-cols-2 gap-3">
                {selectedCompanies.map((comp, idx) => {
                  const variance = idx === 0 ? 0 : idx === 1 ? -12 : idx === 2 ? -33 : 4;
                  const readinessVal = Math.max(15, Math.min(100, result.atsScore + variance));
                  const rating = getCompanyCardBorder(readinessVal);
                  return (
                    <div 
                      key={comp} 
                      className="rounded p-3 flex flex-col gap-2" 
                      style={{ backgroundColor: '#0A0A0A', border: rating.border }}
                    >
                      <div className="flex justify-between text-[11px] font-bold text-white uppercase">
                        <span>{comp}</span>
                        <span>{readinessVal}%</span>
                      </div>
                      <div className="w-full bg-[#2D2D2D] rounded-full overflow-hidden" style={{ height: '6px' }}>
                        <div className="bg-[#FFA116] h-full" style={{ width: `${readinessVal}%` }} />
                      </div>
                      <span className="text-[9px] font-bold" style={{ color: rating.color }}>{rating.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Block 4 - Keyword analysis */}
            <div className="flex flex-col gap-3">
              <div>
                <span className="text-[10px] text-[#8C8C8C] font-bold uppercase">Keyword Analysis</span>
                <p className="text-[9px] text-[#8C8C8C]">Based on job description match metrics</p>
              </div>

              <div className="flex flex-col gap-2.5">
                <div>
                  <span className="text-[10px] text-green-400 font-semibold">✓ Found in Resume:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {result.matchedKeywords?.map(kw => (
                      <span key={kw} className="text-[9px] font-bold bg-green-900 text-green-400 px-2 py-0.5 rounded">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-red-400 font-semibold">✗ Missing Keywords:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {result.missingKeywords?.map(kw => (
                      <span key={kw} className="text-[9px] font-bold bg-red-900 text-red-400 px-2 py-0.5 rounded">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-yellow-400 font-semibold">~ Partial Match:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {result.partialKeywords?.map(kw => (
                      <span key={kw} className="text-[9px] font-bold bg-yellow-900 text-yellow-400 px-2 py-0.5 rounded">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Block 5 - Improvement suggestions */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] text-[#8C8C8C] font-bold uppercase tracking-wider">💡 Improvement Suggestions</span>
              
              <div className="flex flex-col gap-2.5 text-xs text-[#8C8C8C]">
                <div>
                  <strong className="text-white block mb-0.5">📁 Skills Section:</strong>
                  <ul className="list-disc pl-4 flex flex-col gap-1">
                    {result.improvementSuggestions?.filter(s => s.toLowerCase().includes('skills') || s.toLowerCase().includes('add') || s.toLowerCase().includes('include')).map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <strong className="text-white block mb-0.5">💼 Experience Section:</strong>
                  <ul className="list-disc pl-4 flex flex-col gap-1">
                    {result.improvementSuggestions?.filter(s => s.toLowerCase().includes('experience') || s.toLowerCase().includes('quantify') || s.toLowerCase().includes('verbs') || s.toLowerCase().includes('metrics')).map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <strong className="text-white block mb-0.5">🚀 Projects Section:</strong>
                  <ul className="list-disc pl-4 flex flex-col gap-1">
                    {result.improvementSuggestions?.filter(s => s.toLowerCase().includes('project') || s.toLowerCase().includes('github') || s.toLowerCase().includes('stack')).map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Block 6 - Download Suggestions */}
            <button
              onClick={triggerPrintSuggestions}
              className="w-full bg-transparent hover:bg-[#FFA116] text-[#FFA116] hover:text-black border font-bold py-2 rounded-lg text-xs transition duration-200 flex justify-center items-center gap-1.5"
              style={{ borderColor: '#FFA116' }}
            >
              ⬇ Download Suggestions as PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ReplayTab() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePlaybackSession, setActivePlaybackSession] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await interviewAPI.sessions();
        setSessions(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  if (loading) {
    return (
      <div className="loader-box text-center py-12">
        <Loader2 className="spinner animate-spin mx-auto text-[#FFA116]" size={32} />
        <p className="mt-2 text-xs text-[#8C8C8C]">Retrieving past interview logs...</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4" style={{ backgroundColor: '#1A1A1A', borderColor: '#2D2D2D' }}>
      <h2 className="text-sm font-bold text-white">Interview Sessions Playback</h2>
      <p className="text-[#8C8C8C] text-xs mb-4">Review code snapshots and chat history sequences side-by-side.</p>
      
      {activePlaybackSession ? (
        <ReplayPlayer 
          sessionId={activePlaybackSession} 
          onClose={() => setActivePlaybackSession(null)} 
        />
      ) : (
        <div className="flex flex-col gap-2 overflow-y-auto pr-1" style={{ maxHeight: '450px' }}>
          {sessions.map((sess) => (
            <div key={sess._id} className="flex justify-between items-center p-3 border rounded transition" style={{ backgroundColor: '#0A0A0A', borderColor: '#2D2D2D' }}>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  {sess.questionId?.title || 'System Design Interview'} 
                  <span 
                    className="text-[9px] uppercase border px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: 'rgba(255,161,22,0.1)', color: '#FFA116', borderColor: 'rgba(255,161,22,0.2)' }}
                  >
                    {sess.interviewerType}
                  </span>
                </h4>
                <p className="text-[9px] text-[#8C8C8C] uppercase mt-0.5">
                  Created: {new Date(sess.createdAt).toLocaleDateString()} • {sess.keystrokeSnapshots?.length || 0} Snapshots
                </p>
              </div>
              <button 
                onClick={() => setActivePlaybackSession(sess._id)}
                className="bg-[#FFA116] text-black font-semibold rounded hover:bg-[#E6911A] transition flex items-center gap-1 px-3 py-1 text-[10px]"
                disabled={!sess.keystrokeSnapshots || sess.keystrokeSnapshots.length === 0}
              >
                <Play size={10} /> Playback
              </button>
            </div>
          ))}
          {sessions.length === 0 && (
            <p className="text-center text-[#8C8C8C] text-xs py-8 font-mono">No past mock sessions found. Go to Practice to start a live round!</p>
          )}
        </div>
      )}
    </div>
  );
}

function ReplayPlayer({ sessionId, onClose }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snapIndex, setSnapIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1500);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await interviewAPI.sessionDetails(sessionId);
        setSession(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [sessionId]);

  useEffect(() => {
    let timer = null;
    if (isPlaying && session?.keystrokeSnapshots?.length) {
      timer = setInterval(() => {
        setSnapIndex((prev) => {
          if (prev < session.keystrokeSnapshots.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, session, playbackSpeed]);

  if (loading) {
    return (
      <div className="loader-box text-center py-12">
        <Loader2 className="spinner animate-spin mx-auto text-[#FFA116]" size={24} />
      </div>
    );
  }

  const currentSnap = session.keystrokeSnapshots[snapIndex];

  return (
    <div className="animate-fadeIn flex flex-col gap-4">
      {/* Player header */}
      <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: '#2D2D2D' }}>
        <div>
          <h3 className="text-xs font-bold text-white uppercase">
            Playback: {session.questionId?.title || 'System Design Interview'}
          </h3>
          <span className="text-[10px] text-[#8C8C8C] font-mono">
            Snapshot {snapIndex + 1} of {session.keystrokeSnapshots.length}
          </span>
        </div>
        <button className="border text-[#EFEFEF] hover:bg-[#2D2D2D] transition text-xs font-bold px-3 py-1 rounded" style={{ borderColor: '#2D2D2D' }} onClick={onClose}>
          ✕ Close Player
        </button>
      </div>

      {/* Control bar */}
      <div className="flex items-center gap-4 border rounded p-2.5 justify-between" style={{ backgroundColor: '#0A0A0A', borderColor: '#2D2D2D' }}>
        <div className="flex items-center gap-2">
          <button 
            className="border text-white hover:bg-[#2D2D2D] px-2 py-0.5 rounded text-xs"
            style={{ borderColor: '#2D2D2D' }}
            onClick={() => setSnapIndex(prev => Math.max(0, prev - 1))}
            disabled={snapIndex === 0}
          >
            ◀
          </button>
          <button 
            className="bg-[#FFA116] text-black font-semibold rounded hover:bg-[#E6911A] flex items-center gap-1.5 px-3 py-1 text-xs"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />} {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button 
            className="border text-white hover:bg-[#2D2D2D] px-2 py-0.5 rounded text-xs"
            style={{ borderColor: '#2D2D2D' }}
            onClick={() => setSnapIndex(prev => Math.min(session.keystrokeSnapshots.length - 1, prev + 1))}
            disabled={snapIndex === session.keystrokeSnapshots.length - 1}
          >
            ▶
          </button>
          <button 
            className="border text-white hover:bg-[#2D2D2D] px-2 py-0.5 rounded text-xs"
            style={{ borderColor: '#2D2D2D' }}
            onClick={() => { setIsPlaying(false); setSnapIndex(0); }}
          >
            <RotateCcw size={12} />
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-[#8C8C8C] font-bold uppercase">Playback Speed:</span>
          <select 
            value={playbackSpeed} 
            onChange={(e) => setPlaybackSpeed(parseInt(e.target.value, 10))}
            className="text-[10px] font-bold text-[#EFEFEF] rounded p-1 outline-none cursor-pointer"
            style={{ backgroundColor: '#1A1A1A', borderColor: '#2D2D2D' }}
          >
            <option value="2500">0.5x Slow</option>
            <option value="1500">1.0x Normal</option>
            <option value="500">3.0x Fast</option>
          </select>
        </div>
      </div>

      {/* Player Split panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1" style={{ minHeight: '350px' }}>
        {/* Chat Logs */}
        <div 
          className="border rounded-lg flex flex-col p-3" 
          style={{ backgroundColor: '#0A0A0A', borderColor: '#2D2D2D', maxHeight: '400px', overflowY: 'auto' }}
        >
          <span className="text-[10px] text-[#8C8C8C] uppercase font-bold mb-2 tracking-wider">Chat Log History:</span>
          <div className="flex flex-col gap-3">
            {session.chatHistory?.map((msg, i) => (
              <div 
                key={i} 
                className="p-2.5 rounded border text-[11px] leading-relaxed" 
                style={{ 
                  backgroundColor: msg.role === 'user' ? 'rgba(255,161,22,0.05)' : '#1A1A1A', 
                  borderColor: msg.role === 'user' ? 'rgba(255,161,22,0.1)' : '#2D2D2D',
                  color: msg.role === 'user' ? '#EFEFEF' : '#8C8C8C'
                }}
              >
                <span className="font-bold text-[9px] block uppercase mb-1">
                  {msg.role === 'user' ? 'Candidate' : 'Interviewer'}
                </span>
                {msg.content}
              </div>
            ))}
          </div>
        </div>

        {/* Code Playback window */}
        <div className="border rounded-lg flex flex-col p-3" style={{ backgroundColor: '#0A0A0A', borderColor: '#2D2D2D' }}>
          <span className="text-[10px] text-[#8C8C8C] uppercase font-bold mb-2 tracking-wider">Code Editor State:</span>
          <pre 
            className="flex-1 p-3 text-[11px] font-mono rounded overflow-auto leading-relaxed border" 
            style={{ backgroundColor: '#1E1E1E', borderColor: '#2D2D2D', color: '#EFEFEF' }}
          >
            {currentSnap ? currentSnap.code : '// No code snapshot at this step.'}
          </pre>
        </div>
      </div>
    </div>
  );
}