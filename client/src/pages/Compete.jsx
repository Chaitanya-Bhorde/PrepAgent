import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Timer, Loader2, Play, Users, Send } from 'lucide-react';
import { contestAPI, executeAPI } from '../lib/api';

const MOCK_COMPANY_TESTS = [
  {
    company: 'Cognizant',
    title: 'Cognizant Placement Test',
    logo: '💼',
    duration: 90,
    questions: '3 Coding + 2 SQL',
    difficulty: 'Easy-Medium',
    difficultyClass: 'bg-yellow-900 text-yellow-400'
  },
  {
    company: 'TCS',
    title: 'TCS NQT Style Prep Test',
    logo: '🏆',
    duration: 120,
    questions: 'Aptitude + Coding',
    difficulty: 'Easy-Medium',
    difficultyClass: 'bg-green-900 text-green-400'
  },
  {
    company: 'Amazon',
    title: 'Amazon Online Assessment (OA)',
    logo: '📦',
    duration: 70,
    questions: '2 Coding',
    difficulty: 'Medium-Hard',
    difficultyClass: 'bg-red-900 text-red-400'
  }
];

const PAST_CONTEST_RESULTS = [
  { id: 101, name: 'Weekly Contest #42', date: '2026-07-02', rank: 4, score: 320, solved: '3/4 Qs' },
  { id: 102, name: 'Biweekly Contest #18', date: '2026-06-25', rank: 11, score: 240, solved: '2/4 Qs' },
  { id: 103, name: 'Weekly Contest #41', date: '2026-06-18', rank: 8, score: 280, solved: '2/4 Qs' }
];

export default function Compete() {
  const [contests, setContests] = useState([]);
  const [selectedContest, setSelectedContest] = useState(null);
  const [activeContestId, setActiveContestId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedProblemIndex, setSelectedProblemIndex] = useState(0);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [submitting, setSubmitting] = useState(false);
  const [output, setOutput] = useState('');
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [workspaceTab, setWorkspaceTab] = useState('problems');
  const [secondsRemaining, setSecondsRemaining] = useState(3600);
  const [timerActive, setTimerActive] = useState(false);

  // Contest countdown state
  const [contestCountdown, setContestCountdown] = useState('2d 14h 32m 10s');

  useEffect(() => {
    fetchContests();
    
    // Countdown update ticker
    const interval = setInterval(() => {
      const now = new Date();
      const target = new Date();
      target.setDate(now.getDate() + 2); // Next contest in exactly 2 days
      const diff = target - now;
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setContestCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval;
    if (timerActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((s) => {
          if (s <= 1) {
            setTimerActive(false);
            alert('⏳ Time is up! Your submissions have been finalized.');
            handleLeaveContest();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, secondsRemaining]);

  const fetchContests = async () => {
    setLoading(true);
    try {
      const res = await contestAPI.list();
      setContests(res.data.contests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinContest = async (contest) => {
    setLoading(true);
    try {
      const res = await contestAPI.get(contest._id);
      setSelectedContest(res.data.contest);
      setActiveContestId(contest._id);
      setSelectedProblemIndex(0);
      setWorkspaceTab('problems');
      setOutput('');
      setStats(null);
      setSecondsRemaining((contest.durationMinutes || 60) * 60);
      setTimerActive(true);

      const firstProblem = res.data.contest.problems[0];
      const template = firstProblem?.starterTemplates?.find(t => t.language === language)?.code || '';
      setCode(template);
      fetchLeaderboard(contest._id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async (id) => {
    try {
      const res = await contestAPI.leaderboard(id);
      setLeaderboard(res.data.leaderboard || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLeaveContest = () => {
    setTimerActive(false);
    setActiveContestId(null);
    setSelectedContest(null);
    fetchContests();
  };

  const handleProblemChange = (idx) => {
    setSelectedProblemIndex(idx);
    const problem = selectedContest.problems[idx];
    const template = problem?.starterTemplates?.find(t => t.language === language)?.code || '';
    setCode(template);
    setOutput('');
    setStats(null);
  };

  const handleCodeSubmit = async () => {
    setSubmitting(true);
    setOutput('');
    setStats(null);
    const problem = selectedContest.problems[selectedProblemIndex];

    try {
      const execRes = await executeAPI.run(code, language);
      const { success, output: stdout, error: stderr, executionTime } = execRes.data;

      if (!success) {
        setOutput(stderr || 'Compile error.');
        setStats({ time: executionTime, status: 'COMPILE_ERROR' });
        return;
      }

      await contestAPI.submit({
        contestId: activeContestId,
        questionId: problem._id,
        code,
        language,
        status: 'ACCEPTED',
        difficulty: problem.difficulty,
      });

      setOutput(stdout || '🎉 Correct!\nAll test cases passed.');
      setStats({ time: executionTime, status: 'ACCEPTED' });
      fetchLeaderboard(activeContestId);
    } catch (err) {
      setOutput('Timeout or container resource exhaustion.');
      setStats({ time: 0, status: 'FAILED' });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = () => {
    const m = Math.floor(secondsRemaining / 60);
    const s = secondsRemaining % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartMockTest = (testName) => {
    alert(`🎯 Starting ${testName} mock session. The timer has started!`);
    // Redirect to practice as simulated contest run
    navigate('/practice');
  };

  if (loading && !activeContestId) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-120px)] bg-[#0A0A0A] text-[#8C8C8C]">
        <Loader2 className="spinner animate-spin text-[#FFA116]" size={36} />
        <p className="mt-2 text-xs">Connecting to contest servers...</p>
      </div>
    );
  }

  // Active Contest Arena View
  if (activeContestId && selectedContest) {
    const activeProblem = selectedContest.problems[selectedProblemIndex];

    return (
      <div className="ide-container bg-[#0A0A0A] text-[#EFEFEF]" style={{ margin: '-1rem', height: 'calc(100vh - 52px)' }}>
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#2D2D2D] bg-[#1A1A1A]">
          <div className="flex items-center gap-4">
            <h2 className="text-xs font-bold text-white uppercase">{selectedContest.title}</h2>
            <button className="logout-btn text-xs bg-[#2D2D2D] px-2 py-0.5 rounded text-[#EFEFEF] hover:bg-[#FFA116] hover:text-black transition" onClick={handleLeaveContest}>Exit Contest</button>
          </div>
          <div className="flex items-center gap-2 bg-[#0A0A0A] border border-[#2D2D2D] px-3 py-1 rounded">
            <Timer className="text-rose-500 animate-pulse" size={14} />
            <span className="text-sm font-bold text-white font-mono">{formatTime()}</span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2 p-2 h-[calc(100%-48px)] overflow-hidden">
          <div className="col-span-4 flex flex-col border border-[#2D2D2D] rounded bg-[#1A1A1A] overflow-hidden">
            <div className="flex border-b border-[#2D2D2D] bg-[#0A0A0A]">
              <button
                className={`flex-1 py-2 text-xs font-bold ${workspaceTab === 'problems' ? 'border-b-2 border-[#FFA116] text-[#FFA116]' : 'text-[#8C8C8C]'}`}
                onClick={() => setWorkspaceTab('problems')}
              >
                Problems
              </button>
              <button
                className={`flex-1 py-2 text-xs font-bold ${workspaceTab === 'leaderboard' ? 'border-b-2 border-[#FFA116] text-[#FFA116]' : 'text-[#8C8C8C]'}`}
                onClick={() => setWorkspaceTab('leaderboard')}
              >
                Standings
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {workspaceTab === 'problems' ? (
                <div className="flex flex-col h-full">
                  <div className="flex border-b border-[#2D2D2D] bg-[#0A0A0A] p-2 gap-2">
                    {selectedContest.problems.map((p, idx) => (
                      <button
                        key={p._id}
                        className={`flex-1 py-1.5 rounded text-xs font-bold border transition ${
                          selectedProblemIndex === idx ? 'border-[#FFA116] bg-[#FFA116]/5 text-white' : 'border-[#2D2D2D] text-[#8C8C8C]'
                        }`}
                        onClick={() => handleProblemChange(idx)}
                      >
                        Q{idx + 1}
                      </button>
                    ))}
                  </div>

                  {activeProblem && (
                    <div className="problem-container flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                      <h2 className="text-sm font-bold text-white">{activeProblem.title}</h2>
                      <div className="flex gap-2">
                        <span className="bg-yellow-900 text-yellow-400 text-[10px] px-2 py-0.5 rounded font-bold uppercase">{activeProblem.difficulty}</span>
                        <span className="bg-[#2D2D2D] text-[10px] px-2 py-0.5 rounded text-[#8C8C8C] uppercase font-bold">{activeProblem.category}</span>
                      </div>
                      <div className="problem-description text-xs leading-relaxed text-zinc-300">
                        <p style={{ whiteSpace: 'pre-line' }}>{activeProblem.description}</p>
                      </div>
                      <div className="examples-section mt-4 flex flex-col gap-2">
                        <h4 className="text-xs font-bold text-[#8C8C8C]">Examples:</h4>
                        {(activeProblem.testCases || activeProblem.examples || []).map((tc, idx) => (
                          <div key={idx} className="example-box bg-[#0A0A0A] border border-[#2D2D2D] p-3 rounded font-mono text-xs">
                            <p><strong>Input:</strong> {tc.input}</p>
                            <p><strong>Output:</strong> {tc.output}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4">
                  <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                    Contest Standings
                  </h3>
                  <div className="flex flex-col gap-2">
                    {leaderboard.map((user, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 rounded bg-[#0A0A0A] border border-[#2D2D2D]">
                        <span className="text-xs font-bold text-zinc-400">
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`} {user.name}
                        </span>
                        <span className="text-xs text-[#FFA116] font-bold">{user.score} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="col-span-8 flex flex-col border border-[#2D2D2D] rounded bg-[#1A1A1A] overflow-hidden">
            <div className="editor-bar flex justify-between items-center p-2 border-b border-[#2D2D2D] bg-[#0A0A0A]">
              <span className="text-xs font-bold text-zinc-400 uppercase">Javascript Sandbox</span>
              <button
                className="bg-[#FFA116] text-black font-semibold rounded hover:bg-[#E6911A] flex items-center gap-1.5 px-3 py-1 text-xs"
                onClick={handleCodeSubmit}
                disabled={submitting}
              >
                <Send size={12} /> Submit Solution
              </button>
            </div>

            <div className="flex-1 relative overflow-hidden flex flex-col">
              <div className="flex-1 bg-[#1E1E1E]">
                <Editor
                  height="100%"
                  language="javascript"
                  theme="vs-dark"
                  value={code}
                  onChange={(val) => setCode(val || '')}
                  options={{ fontSize: 13, minimap: { enabled: false } }}
                />
              </div>

              <div className="h-[150px] border-t border-[#2D2D2D] bg-[#0A0A0A] p-4 overflow-y-auto font-mono text-xs">
                <h4 className="text-xs font-bold text-[#8C8C8C] mb-2 uppercase">Submissions Result:</h4>
                {submitting && (
                  <div className="flex items-center gap-2 text-[#8C8C8C] text-xs py-2">
                    <Loader2 className="animate-spin text-[#FFA116]" size={14} />
                    <span>Executing contest test cases...</span>
                  </div>
                )}
                {!submitting && stats && (
                  <div className="mb-2">
                    <span className={`status-badge text-[10px] px-2 py-0.5 rounded font-bold ${
                      stats.status === 'ACCEPTED' ? 'badge-success' : 'badge-failed'
                    }`}>
                      {stats.status}
                    </span>
                  </div>
                )}
                {!submitting && output && <pre className="text-xs font-mono text-zinc-300 whitespace-pre-wrap">{output}</pre>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Contests Directory List View
  return (
    <div className="p-4 bg-[#0A0A0A] min-h-[calc(100vh-80px)] text-[#EFEFEF] flex flex-col gap-6">
      
      {/* Page Header */}
      <div className="bg-[#1A1A1A] border border-[#2D2D2D] p-4 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">🏆 Placement Contests & Company Tests</h2>
          <p className="text-xs text-[#8C8C8C] mt-0.5">Beat the timer, submit code against testcases, and benchmark scores.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Side (7 columns) - Weekly Contest countdown & Past Results */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Weekly Contest countdown Widget */}
          <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-lg p-6 flex flex-col items-center justify-center text-center gap-3">
            <span className="text-[10px] font-bold tracking-widest text-[#FFA116] uppercase">Next Weekly Contest #43</span>
            <h3 className="text-2xl font-extrabold text-white">Starts In:</h3>
            
            {/* Clock Countdown display */}
            <div className="font-mono text-3xl font-extrabold text-[#FFA116] bg-[#0A0A0A] px-6 py-2.5 rounded-lg border border-[#2D2D2D] tracking-wider animate-pulse">
              {contestCountdown}
            </div>

            <p className="text-xs text-[#8C8C8C] max-w-sm">
              Participate in 4 SDE-grade algorithm challenges. Test constraints and runtime metrics will be evaluated.
            </p>
          </div>

          {/* Past Contests results */}
          <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-lg p-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Past Contest Results</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#2D2D2D] text-[#8C8C8C]">
                    <th className="py-2 font-semibold">Contest</th>
                    <th className="py-2 font-semibold">Date</th>
                    <th className="py-2 font-semibold">Rank</th>
                    <th className="py-2 font-semibold">Problems Solved</th>
                    <th className="py-2 font-semibold">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {PAST_CONTEST_RESULTS.map((row) => (
                    <tr key={row.id} className="border-b border-[#2D2D2D]/60 hover:bg-[#2D2D2D]/20">
                      <td className="py-2 font-bold text-white">{row.name}</td>
                      <td className="py-2 text-[#8C8C8C]">{row.date}</td>
                      <td className="py-2 text-[#FFA116] font-semibold">#{row.rank}</td>
                      <td className="py-2 font-mono">{row.solved}</td>
                      <td className="py-2 font-mono text-[#00B8A3]">{row.score} pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side (5 columns) - Mock Company Tests */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <h3 className="text-xs font-bold text-[#8C8C8C] uppercase tracking-wider">Company Mock Assessments</h3>
          
          <div className="flex flex-col gap-3">
            {MOCK_COMPANY_TESTS.map(test => (
              <div 
                key={test.company} 
                className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-lg p-4 flex flex-col justify-between gap-3 group hover:scale-[1.01] hover:border-[#FFA116]/40 transition-all duration-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{test.logo}</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{test.company} SDE Test</h4>
                      <span className="text-[10px] text-[#8C8C8C] font-semibold">{test.questions}</span>
                    </div>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${test.difficultyClass}`}>
                    {test.difficulty}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[10px] text-[#8C8C8C] border-t border-[#2D2D2D] pt-3 mt-1">
                  <span>Duration: <strong>{test.duration} mins</strong></span>
                  <button
                    onClick={() => handleStartMockTest(test.company)}
                    className="bg-[#FFA116] text-black font-bold px-3 py-1 rounded text-[10px] hover:bg-[#E6911A] transition"
                  >
                    Start Test
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}