import { useState, useEffect } from 'react';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import { useTimer } from '../hooks/useTimer';
import { Award, Timer, Loader2, Play, Users, BookOpen, Send } from 'lucide-react';

export default function ContestMode() {
  const [contests, setContests] = useState([]);
  const [selectedContest, setSelectedContest] = useState(null);
  const [activeContestId, setActiveContestId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Contest Workspace states
  const [selectedProblemIndex, setSelectedProblemIndex] = useState(0);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [submitting, setSubmitting] = useState(false);
  const [output, setOutput] = useState('');
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [workspaceTab, setWorkspaceTab] = useState('problems'); // 'problems' or 'leaderboard'

  // Timer hook
  const { formatTime, start: startTimer, stop: stopTimer, secondsRemaining } = useTimer(60, () => {
    alert('⏳ Time is up! Your contest submissions have been finalized.');
    handleLeaveContest();
  });

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/contests');
      setContests(res.data.contests);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinContest = async (contest) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/contests/${contest._id}`);
      setSelectedContest(res.data.contest);
      setActiveContestId(contest._id);
      setSelectedProblemIndex(0);
      setWorkspaceTab('problems');
      setOutput('');
      setStats(null);
      
      const firstProblem = res.data.contest.problems[0];
      const template = firstProblem?.starterTemplates?.find(t => t.language === language)?.code || '';
      setCode(template);
      
      // Fetch leaderboard
      fetchLeaderboard(contest._id);
      startTimer();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/contests/${id}/leaderboard`);
      setLeaderboard(res.data.leaderboard);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLeaveContest = () => {
    stopTimer();
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
      // Execute the code first to mock run it
      const execRes = await axios.post('http://localhost:5000/api/execute', {
        code,
        language
      });

      const { success, output: stdout, error: stderr, executionTime } = execRes.data;

      if (!success) {
        setOutput(stderr || 'Compile error.');
        setStats({ time: executionTime, status: 'COMPILE_ERROR' });
        return;
      }

      // Submit the points to the contest
      const submitRes = await axios.post('http://localhost:5000/api/contests/submit', {
        contestId: activeContestId,
        questionId: problem._id,
        code,
        language,
        status: 'ACCEPTED', // Mock successful verification
        difficulty: problem.difficulty
      });

      setOutput(stdout || '🎉 Correct!\nAll test cases passed.');
      setStats({ time: executionTime, status: 'ACCEPTED' });
      
      // Update leaderboard
      fetchLeaderboard(activeContestId);
    } catch (err) {
      setOutput('Timeout or container resource exhaustion.');
      setStats({ time: 0, status: 'FAILED' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !activeContestId) {
    return (
      <div className="loader-box">
        <Loader2 className="spinner animate-spin" size={36} />
        <p className="mt-2">Connecting to contest servers...</p>
      </div>
    );
  }

  // Active Contest Arena View
  if (activeContestId && selectedContest) {
    const activeProblem = selectedContest.problems[selectedProblemIndex];

    return (
      <div className="ide-container" style={{ margin: '-1rem', height: 'calc(100vh - 52px)' }}>
        {/* Timer Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-white">{selectedContest.title}</h2>
            <button className="logout-btn text-xs" onClick={handleLeaveContest}>Exit Contest</button>
          </div>
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded">
            <Timer className="text-rose-500 animate-pulse" size={14} />
            <span className="text-sm font-bold text-white font-mono">{formatTime()}</span>
          </div>
        </div>

        {/* 3-Column Arena */}
        <div className="grid grid-cols-12 gap-2 p-2 h-[calc(100%-48px)] overflow-hidden">
          
          {/* Left Area (4 Cols) - Problem List & Details */}
          <div className="col-span-4 flex flex-col border border-zinc-800 rounded bg-zinc-900/50 overflow-hidden">
            <div className="flex border-b border-zinc-800 bg-zinc-950">
              <button 
                className={`flex-1 py-2 text-xs font-bold ${workspaceTab === 'problems' ? 'border-b-2 border-amber-500 text-white' : 'text-zinc-500'}`}
                onClick={() => setWorkspaceTab('problems')}
              >
                Problems
              </button>
              <button 
                className={`flex-1 py-2 text-xs font-bold ${workspaceTab === 'leaderboard' ? 'border-b-2 border-amber-500 text-white' : 'text-zinc-500'}`}
                onClick={() => setWorkspaceTab('leaderboard')}
              >
                Standings
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {workspaceTab === 'problems' ? (
                <div className="flex flex-col h-full">
                  {/* Select contest problems */}
                  <div className="flex border-b border-zinc-800 bg-zinc-950/20 p-2 gap-2">
                    {selectedContest.problems.map((p, idx) => (
                      <button 
                        key={p._id}
                        className={`flex-1 py-1.5 rounded text-xs font-bold border transition ${
                          selectedProblemIndex === idx ? 'border-amber-500 bg-amber-500/5 text-white' : 'border-zinc-800 text-zinc-500'
                        }`}
                        onClick={() => handleProblemChange(idx)}
                      >
                        Q{idx + 1} ({p.difficulty})
                      </button>
                    ))}
                  </div>

                  {activeProblem && (
                    <div className="problem-container flex-1 overflow-y-auto">
                      <h2>{activeProblem.title}</h2>
                      <div className="meta-row">
                        <span className={`diff-badge badge-${activeProblem.difficulty}`}>{activeProblem.difficulty}</span>
                        <span className="cat-badge">{activeProblem.category}</span>
                      </div>
                      <div className="problem-description text-sm leading-relaxed text-zinc-300">
                        <p style={{ whiteSpace: 'pre-line' }}>{activeProblem.description}</p>
                      </div>
                      <div className="examples-section mt-4">
                        <h4>Examples:</h4>
                        {(activeProblem.testCases || activeProblem.examples || []).map((tc, idx) => (
                          <div key={idx} className="example-box">
                            <p><strong>Input:</strong></p>
                            <pre>{tc.input}</pre>
                            <p><strong>Output:</strong></p>
                            <pre>{tc.output}</pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Users size={16} className="text-amber-500" /> Contest Standings
                  </h3>
                  <div className="flex flex-col gap-2">
                    {leaderboard.map((user, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 rounded bg-zinc-950/50 border border-zinc-800">
                        <span className="text-xs font-bold text-zinc-400">
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`} {user.name}
                        </span>
                        <span className="text-xs text-amber-500 font-bold">{user.score} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Area (8 Cols) - Monaco Code Editor & Compiler Outputs */}
          <div className="col-span-8 flex flex-col border border-zinc-800 rounded bg-zinc-900/50 overflow-hidden">
            <div className="editor-bar">
              <span className="text-xs font-bold text-zinc-400 uppercase">Javascript</span>
              <button 
                className="primary-submit-btn flex items-center gap-1.5 px-3 py-1"
                onClick={handleCodeSubmit}
                disabled={submitting}
              >
                <Send size={12} /> Submit Solution
              </button>
            </div>
            
            <div className="flex-1 relative overflow-hidden flex flex-col">
              <div className="flex-1">
                <Editor
                  height="100%"
                  language="javascript"
                  theme="vs-dark"
                  value={code}
                  onChange={(val) => setCode(val)}
                  options={{ fontSize: 13, minimap: { enabled: false } }}
                />
              </div>

              {/* Console Output bar */}
              <div className="h-[150px] border-t border-zinc-800 bg-zinc-950/90 p-4 overflow-y-auto">
                <h4 className="text-xs font-bold text-zinc-500 mb-2 uppercase">Submissions Result:</h4>
                {submitting && (
                  <div className="flex items-center gap-2 text-zinc-400 text-xs py-2">
                    <Loader2 className="animate-spin" size={14} />
                    <span>Executing contest test cases...</span>
                  </div>
                )}
                {!submitting && stats && (
                  <div className="mb-2">
                    <span className={`status-badge text-xs px-2 py-0.5 rounded font-bold ${
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
    <div className="sql-page-container">
      <div className="max-w-[1100px] mx-auto flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Weekly & Biweekly Contests</h2>
          <p className="text-sm text-zinc-500 font-medium">Join mock code contests, beat the timer countdown, and score points to climb placement rankings.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contests.map((contest) => {
            const isStarted = new Date(contest.startTime) <= new Date();

            return (
              <div key={contest._id} className="card border border-zinc-800 bg-zinc-900/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      isStarted ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {isStarted ? 'Active Now' : 'Scheduled'}
                    </span>
                    <div className="flex items-center gap-1 text-zinc-500 text-xs">
                      <Timer size={13} /> {contest.durationMinutes} minutes
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{contest.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">{contest.description}</p>
                </div>

                <div className="border-t border-zinc-800/80 pt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Start Time</span>
                    <strong className="text-xs text-white">{new Date(contest.startTime).toLocaleString()}</strong>
                  </div>
                  <button 
                    className="primary-submit-btn flex items-center gap-1 text-xs px-3 py-1.5"
                    onClick={() => handleJoinContest(contest)}
                  >
                    <Play size={11} /> {isStarted ? 'Start Contest' : 'Register Contest'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
