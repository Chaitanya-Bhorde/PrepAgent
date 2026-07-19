import { useEffect, useState } from 'react';
import { Loader2, Menu, Star, Share2, Save, FileText, CheckCircle2, XCircle } from 'lucide-react';
import usePracticeStore from '../../stores/practiceStore';
import { interviewAPI } from '../../lib/api';
import useToastStore from '../../stores/toastStore';

const MOCK_SUBMISSIONS = [
  { status: 'ACCEPTED', lang: 'javascript', runtime: '64 ms', memory: '42.1 MB', time: '10 min ago' },
  { status: 'ACCEPTED', lang: 'python', runtime: '38 ms', memory: '13.9 MB', time: '1 hour ago' },
  { status: 'WRONG_ANSWER', lang: 'javascript', runtime: 'N/A', memory: 'N/A', time: '2 hours ago' },
  { status: 'COMPILE_ERROR', lang: 'cpp', runtime: 'N/A', memory: 'N/A', time: '1 day ago' },
  { status: 'ACCEPTED', lang: 'cpp', runtime: '8 ms', memory: '7.8 MB', time: '3 days ago' }
];

export default function ProblemPanel() {
  const {
    questions, loading, selectedQuestionId, question, language,
    setCode, selectQuestion, setQuestion
  } = usePracticeStore();

  const showToast = useToastStore((state) => state.showToast);

  const [activeTab, setActiveTab] = useState('description'); // 'description' | 'editorial' | 'solutions' | 'submissions' | 'notes'
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [openHints, setOpenHints] = useState({});
  const [notes, setNotes] = useState('');

  // Load Bookmarks and Notes on selected question change
  useEffect(() => {
    if (selectedQuestionId) {
      const savedBookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      setIsBookmarked(savedBookmarks.includes(selectedQuestionId));
      
      const savedNotes = localStorage.getItem(`notes_${selectedQuestionId}`) || '';
      setNotes(savedNotes);
      
      setOpenHints({});
    }
  }, [selectedQuestionId]);

  useEffect(() => {
    if (questions.length > 0 && selectedQuestionId) {
      loadQuestionDetail();
    }
  }, [selectedQuestionId, questions]);

  const loadQuestionDetail = async () => {
    try {
      const res = await interviewAPI.start(selectedQuestionId);
      setQuestion(res.data.question);
      const template = res.data.question?.starterTemplates?.find(t => t.language === language)?.code || '';
      if (template) setCode(template);
    } catch {
      const q = questions.find(q => q._id === selectedQuestionId);
      if (q) setQuestion(q);
    }
  };

  const handleNav = (direction) => {
    const currentIndex = questions.findIndex(q => q._id === selectedQuestionId);
    if (currentIndex === -1) return;

    let targetIndex = currentIndex;
    if (direction === 'prev' && currentIndex > 0) {
      targetIndex = currentIndex - 1;
    } else if (direction === 'next' && currentIndex < questions.length - 1) {
      targetIndex = currentIndex + 1;
    }

    if (targetIndex !== currentIndex) {
      selectQuestion(questions[targetIndex]._id);
    }
  };

  const toggleBookmark = () => {
    const savedBookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    let updated;
    if (savedBookmarks.includes(selectedQuestionId)) {
      updated = savedBookmarks.filter(id => id !== selectedQuestionId);
      setIsBookmarked(false);
      showToast('Bookmark removed!', 'info');
    } else {
      updated = [...savedBookmarks, selectedQuestionId];
      setIsBookmarked(true);
      showToast('Problem bookmarked!', 'success');
    }
    localStorage.setItem('bookmarks', JSON.stringify(updated));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Share link copied to clipboard!', 'success');
  };

  const toggleHint = (index) => {
    setOpenHints(prev => {
      const isOpening = !prev[index];
      if (isOpening) {
        showToast(`Hint ${index + 1} unlocked!`, 'info');
      }
      return { ...prev, [index]: isOpening };
    });
  };

  const handleSaveNotes = () => {
    localStorage.setItem(`notes_${selectedQuestionId}`, notes);
    showToast('Notes saved successfully!', 'success');
  };

  if (loading) {
    return (
      <section className="description-panel-col flex justify-center items-center h-full bg-[#1A1A1A]">
        <div className="flex flex-col items-center gap-2 text-[#8C8C8C]">
          <Loader2 className="spinner animate-spin text-[#FFA116]" size={24} />
          <span className="text-xs">Loading DSA problem statement...</span>
        </div>
      </section>
    );
  }

  const activeQuestion = question || questions.find(q => q._id === selectedQuestionId);
  const currentIndex = questions.findIndex(q => q._id === selectedQuestionId);

  const getDifficultyBadge = (diff) => {
    const d = (diff || 'easy').toLowerCase();
    if (d === 'easy') {
      return <span className="bg-green-900/40 text-green-400 text-[11px] px-2 py-0.5 rounded font-bold uppercase">Easy</span>;
    } else if (d === 'medium' || d === 'yellow') {
      return <span className="bg-yellow-900/40 text-yellow-400 text-[11px] px-2 py-0.5 rounded font-bold uppercase">Medium</span>;
    } else {
      return <span className="bg-red-900/40 text-red-400 text-[11px] px-2 py-0.5 rounded font-bold uppercase">Hard</span>;
    }
  };

  return (
    <section className="description-panel-col flex flex-col h-full bg-[#1A1A1A] text-[#EFEFEF] border border-[#2D2D2D] relative overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2D2D2D] bg-[#0A0A0A] h-10 select-none">
        <div className="flex items-center gap-2">
          <button 
            title="Problem List"
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="p-1 hover:bg-[#2D2D2D] rounded text-[#8C8C8C] hover:text-[#EFEFEF]"
          >
            <Menu size={16} />
          </button>
          <span className="text-xs font-bold text-[#EFEFEF]">
            {currentIndex !== -1 ? `${currentIndex + 1}. ` : ''}{activeQuestion?.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Navigation Controls */}
          <div className="flex items-center bg-[#1A1A1A] border border-[#2D2D2D] rounded">
            <button
              onClick={() => handleNav('prev')}
              disabled={currentIndex <= 0}
              className="px-2 py-0.5 text-[11px] text-[#8C8C8C] hover:text-white disabled:opacity-30"
            >
              &lt; Prev
            </button>
            <div className="w-[1px] h-3 bg-[#2D2D2D]" />
            <button
              onClick={() => handleNav('next')}
              disabled={currentIndex >= questions.length - 1 || currentIndex === -1}
              className="px-2 py-0.5 text-[11px] text-[#8C8C8C] hover:text-white disabled:opacity-30"
            >
              Next &gt;
            </button>
          </div>

          {/* Bookmark & Share */}
          <button 
            onClick={toggleBookmark}
            className={`p-1 hover:bg-[#2D2D2D] rounded transition ${isBookmarked ? 'text-[#FFA116]' : 'text-[#8C8C8C] hover:text-white'}`}
          >
            <Star size={14} fill={isBookmarked ? '#FFA116' : 'none'} />
          </button>
          <button 
            onClick={handleShare}
            className="p-1 hover:bg-[#2D2D2D] rounded text-[#8C8C8C] hover:text-white"
          >
            <Share2 size={14} />
          </button>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-[#2D2D2D] bg-[#0A0A0A] text-xs h-9">
        {['Description', 'Editorial', 'Solutions', 'Submissions', 'Notes'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-3 py-1.5 font-semibold border-b-2 transition ${
              activeTab === tab.toLowerCase()
                ? 'border-[#FFA116] text-white bg-[#1A1A1A]/60'
                : 'border-transparent text-[#8C8C8C] hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Side-out Problem drawer */}
      {isDrawerOpen && (
        <div className="absolute inset-0 bg-black/60 z-50 flex">
          <div className="w-64 bg-[#1A1A1A] border-r border-[#2D2D2D] h-full flex flex-col animate-fadeIn">
            <div className="p-3 border-b border-[#2D2D2D] bg-[#0A0A0A] flex justify-between items-center">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Problem Set Directory</span>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="text-xs text-[#8C8C8C] hover:text-white"
              >
                ✕ Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
              {questions.map((q, idx) => (
                <div
                  key={q._id}
                  onClick={() => {
                    selectQuestion(q._id);
                    setIsDrawerOpen(false);
                  }}
                  className={`p-2 rounded cursor-pointer transition text-xs flex justify-between items-center ${
                    selectedQuestionId === q._id ? 'bg-[#2D2D2D] border-l-2 border-[#FFA116]' : 'hover:bg-[#2D2D2D]/60'
                  }`}
                >
                  <span className="truncate pr-2">{idx + 1}. {q.title}</span>
                  <span className="text-[9px] uppercase font-bold tracking-tight text-[#8C8C8C]">{q.difficulty}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsDrawerOpen(false)} />
        </div>
      )}

      {/* Tab Panel contents */}
      <div className="flex-1 overflow-y-auto bg-[#1A1A1A] p-4">
        {activeTab === 'description' && activeQuestion && (
          <div className="flex flex-col gap-4">
            {/* Title Metadata */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {getDifficultyBadge(activeQuestion.difficulty)}
              {activeQuestion.tags && activeQuestion.tags.map(tag => (
                <span key={tag} className="bg-[#2D2D2D] text-[#8C8C8C] text-[10px] font-bold px-2 py-0.5 rounded">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Asked In section */}
            <div className="flex items-center gap-2 border-y border-[#2D2D2D] py-2 text-[11px] text-[#8C8C8C]">
              <span>Asked in:</span>
              <div className="flex gap-1.5">
                {['Amazon', 'Google', 'Microsoft', 'Adobe', 'Meta'].map(co => (
                  <span key={co} className="bg-[#2D2D2D] text-white px-2 py-0.5 rounded font-medium text-[10px]">
                    {co}
                  </span>
                ))}
              </div>
            </div>

            {/* Problem Description */}
            <div className="problem-description text-[13px] leading-relaxed text-[#EFEFEF] whitespace-pre-line font-normal">
              {activeQuestion.description}
            </div>

            {/* Examples boxes */}
            <div className="examples-section flex flex-col gap-3">
              {(activeQuestion.examples || []).map((ex, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-white">Example {idx + 1}:</span>
                  <pre className="bg-[#0A0A0A] border border-[#2D2D2D] rounded-md p-3 font-mono text-[11px] text-[#EFEFEF] leading-relaxed whitespace-pre-wrap">
                    <div><strong>Input:</strong> {ex.input}</div>
                    <div><strong>Output:</strong> {ex.output}</div>
                    {ex.explanation && <div className="mt-1 text-[#8C8C8C]"><strong>Explanation:</strong> {ex.explanation}</div>}
                  </pre>
                </div>
              ))}
            </div>

            {/* Constraints */}
            {activeQuestion.constraints && activeQuestion.constraints.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-[#8C8C8C] uppercase tracking-wider">Constraints:</span>
                <ul className="list-disc pl-5 text-[12px] text-[#8C8C8C] flex flex-col gap-1">
                  {activeQuestion.constraints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Progressive Hints Section */}
            {activeQuestion.hints && activeQuestion.hints.length > 0 && (
              <div className="border-t border-[#2D2D2D] pt-3 flex flex-col gap-2 mt-4">
                <span className="text-xs font-bold text-[#8C8C8C] uppercase tracking-wider">Hints:</span>
                <div className="flex flex-col gap-2">
                  {activeQuestion.hints.map((hint, index) => {
                    const isOpen = !!openHints[index];
                    return (
                      <div key={index} className="border border-[#2D2D2D] rounded bg-[#0A0A0A]">
                        <button
                          onClick={() => toggleHint(index)}
                          className="w-full text-left p-2 text-xs font-bold flex justify-between items-center text-[#EFEFEF]"
                        >
                          <span>💡 Hint {index + 1}</span>
                          <span className="text-[10px] text-[#FFA116]">{isOpen ? 'COLLAPSE ▲' : 'REVEAL ▶'}</span>
                        </button>
                        {isOpen && (
                          <div className="p-3 border-t border-[#2D2D2D] text-xs text-[#8C8C8C] bg-[#1A1A1A]/40 leading-relaxed">
                            {hint}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'editorial' && (
          <div className="text-xs text-[#8C8C8C] leading-relaxed flex flex-col gap-3">
            <h3 className="text-white font-bold text-sm">Official Solution Breakdown</h3>
            <p>To solve this problem efficiently, we aim to minimize space and time complexity.</p>
            <h4 className="text-white font-semibold mt-2">Approach 1: Brute Force (O(N²))</h4>
            <p>We can loop through each element x and search for target - x in the rest of the array. This is simple but slow.</p>
            <h4 className="text-white font-semibold mt-2">Approach 2: Hash Map Lookup (O(N))</h4>
            <p>Using a hash map allows us to perform lookups in O(1) time. As we traverse the items, we calculate the complement and check if it already exists in the map.</p>
          </div>
        )}

        {activeTab === 'solutions' && (
          <div className="text-xs text-[#8C8C8C] leading-relaxed flex flex-col gap-3">
            <h3 className="text-white font-bold text-sm">Community Discussion</h3>
            <div className="border border-[#2D2D2D] p-2.5 rounded bg-[#0A0A0A]">
              <span className="text-[#FFA116] font-semibold block mb-0.5">Javascript 1-liner Map solution (98% speed)</span>
              <span className="text-[10px] text-zinc-500">Submitted by user_dev • 4 hours ago</span>
            </div>
            <div className="border border-[#2D2D2D] p-2.5 rounded bg-[#0A0A0A]">
              <span className="text-[#00B8A3] font-semibold block mb-0.5">Python 3 clean double-pointer logic</span>
              <span className="text-[10px] text-zinc-500">Submitted by algorithm_master • 1 day ago</span>
            </div>
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2D2D2D] text-[#8C8C8C]">
                  <th className="py-2">Status</th>
                  <th className="py-2">Language</th>
                  <th className="py-2">Runtime</th>
                  <th className="py-2">Memory</th>
                  <th className="py-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_SUBMISSIONS.map((sub, idx) => (
                  <tr key={idx} className="border-b border-[#2D2D2D]/60 hover:bg-[#2D2D2D]/20">
                    <td className="py-2">
                      <span className={`flex items-center gap-1 font-bold ${sub.status === 'ACCEPTED' ? 'text-[#00B8A3]' : 'text-[#EF4444]'}`}>
                        {sub.status === 'ACCEPTED' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {sub.status === 'ACCEPTED' ? 'Accepted' : 'Wrong Answer'}
                      </span>
                    </td>
                    <td className="py-2 uppercase font-mono text-[#8C8C8C]">{sub.lang}</td>
                    <td className="py-2 font-mono">{sub.runtime}</td>
                    <td className="py-2 font-mono">{sub.memory}</td>
                    <td className="py-2 text-[#8C8C8C]">{sub.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="flex flex-col gap-3 h-full">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Jot down notes or pseudo-code approach for this problem..."
              className="w-full flex-1 min-h-[250px] bg-[#0A0A0A] border border-[#2D2D2D] text-[#EFEFEF] rounded p-3 text-xs outline-none focus:border-[#FFA116] resize-none leading-relaxed"
            />
            <button
              onClick={handleSaveNotes}
              className="bg-[#FFA116] text-black font-semibold rounded px-4 py-2 text-xs hover:bg-[#E6911A] transition flex items-center justify-center gap-1.5 self-end"
            >
              <Save size={14} /> Save Notes
            </button>
          </div>
        )}
      </div>
    </section>
  );
}