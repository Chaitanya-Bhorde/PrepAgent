import { useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import api from '../lib/api';
import toast from 'react-hot-toast';

const LANGUAGE_MAP = {
  javascript: { id: 'javascript', label: 'JavaScript', ext: 'js' },
  python: { id: 'python', label: 'Python', ext: 'py' },
  java: { id: 'java', label: 'Java', ext: 'java' },
  cpp: { id: 'cpp', label: 'C++', ext: 'cpp' },
};

const Practice = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ difficulty: '', company: '', search: '' });
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState(null);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/problems', { params: filters });
      setProblems(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load problems');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProblemSelect = (problem) => {
    setSelectedProblem(problem);
    setCode(problem.solutionTemplate || '// Write your code here\n');
    setOutput(null);
  };

  const handleRun = useCallback(async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }
    setExecuting(true);
    setOutput(null);
    try {
      const { data } = await api.post('/execute', {
        code,
        language,
        stdin: '',
      });
      setOutput(data);
    } catch (err) {
      setOutput({
        success: false,
        output: '',
        error: err.response?.data?.message || 'Execution failed',
        exitCode: -1,
        executionTime: 0,
      });
    } finally {
      setExecuting(false);
    }
  }, [code, language]);

  const handleSubmit = useCallback(async () => {
    if (!code.trim() || !selectedProblem) {
      toast.error('Select a problem and write code first');
      return;
    }
    setExecuting(true);
    try {
      const { data } = await api.post('/submissions/submit', {
        problemId: selectedProblem.id || selectedProblem._id,
        title: selectedProblem.title,
        code,
        language,
        difficulty: selectedProblem.difficulty,
      });
      toast.success(data.message || 'Submitted successfully!');
      setOutput(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setExecuting(false);
    }
  }, [code, language, selectedProblem]);

  const handleEditorMount = (editor, monaco) => {
    // Configure editor settings
    editor.updateOptions({
      fontSize: 14,
      fontFamily: "'Fira Code', 'Consolas', 'Courier New', monospace",
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      lineNumbers: 'on',
      renderLineHighlight: 'line',
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      bracketPairColorization: { enabled: true },
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      formatOnPaste: true,
      tabSize: 2,
    });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white">
      {/* Left Sidebar - Problem List */}
      <div className="w-[350px] min-w-[350px] border-r border-gray-200 flex flex-col bg-white">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-lg font-semibold mb-3">Problems</h1>
          <input
            type="text"
            placeholder="Search problems..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 mb-2"
          />
          <div className="flex gap-2">
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
            <button
              onClick={fetchProblems}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              Filter
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <p className="text-red-500 text-sm mb-2">{error}</p>
              <button onClick={fetchProblems} className="text-indigo-600 text-sm hover:underline">Retry</button>
            </div>
          ) : problems.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">No problems found</div>
          ) : (
            problems.map((problem) => (
              <div
                key={problem.id || problem._id}
                onClick={() => handleProblemSelect(problem)}
                className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedProblem?.id === problem.id || selectedProblem?._id === problem._id
                    ? 'bg-indigo-50 border-l-4 border-l-indigo-600'
                    : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{problem.title}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    problem.difficulty === 'EASY' ? 'bg-green-100 text-green-700' :
                    problem.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {problem.difficulty}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">{problem.category}</span>
                  {problem.company && (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                      {problem.company}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Side - Problem Details + Editor */}
      <div className="flex-1 flex flex-col">
        {selectedProblem ? (
          <>
            {/* Problem Description */}
            <div className="p-6 border-b border-gray-200 overflow-y-auto max-h-[40%]">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold text-gray-900">{selectedProblem.title}</h2>
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                  selectedProblem.difficulty === 'EASY' ? 'bg-green-100 text-green-700' :
                  selectedProblem.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {selectedProblem.difficulty}
                </span>
              </div>

              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 mb-4">{selectedProblem.description}</p>

                {selectedProblem.constraints && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-sm text-gray-900 mb-2">Constraints:</h3>
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{selectedProblem.constraints}</pre>
                  </div>
                )}

                {selectedProblem.sampleInput && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-sm text-gray-900 mb-2">Example:</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Input:</p>
                        <pre className="text-sm bg-white p-2 rounded border border-gray-200">{selectedProblem.sampleInput}</pre>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Output:</p>
                        <pre className="text-sm bg-white p-2 rounded border border-gray-200">{selectedProblem.sampleOutput}</pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Code Editor + Output */}
            <div className="flex-1 flex flex-col bg-[#1e1e1e]">
              {/* Editor Toolbar */}
              <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-medium">Code</span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-[#3d3d3d] text-white text-xs px-3 py-1.5 rounded border border-gray-600 focus:outline-none focus:border-indigo-500"
                  >
                    {Object.entries(LANGUAGE_MAP).map(([key, lang]) => (
                      <option key={key} value={key}>{lang.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleRun}
                    disabled={executing}
                    className="px-4 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {executing ? 'Running...' : '▶ Run'}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={executing}
                    className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Submit
                  </button>
                </div>
              </div>

              {/* Monaco Editor */}
              <div className="flex-1">
                <Editor
                  height="100%"
                  language={LANGUAGE_MAP[language]?.id || 'javascript'}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  theme="vs-dark"
                  onMount={handleEditorMount}
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    renderLineHighlight: 'line',
                    cursorBlinking: 'smooth',
                    bracketPairColorization: { enabled: true },
                    autoClosingBrackets: 'always',
                    autoClosingQuotes: 'always',
                    formatOnPaste: true,
                    tabSize: 2,
                  }}
                />
              </div>

              {/* Output Panel */}
              {output && (
                <div className="border-t border-gray-700 bg-[#1e1e1e]">
                  <div className="px-4 py-2 bg-[#2d2d2d] border-b border-gray-700">
                    <span className="text-xs font-medium text-gray-400">
                      Output {output.success ? '(Success)' : '(Error)'}
                    </span>
                  </div>
                  <div className="p-4 max-h-32 overflow-y-auto">
                    {output.error ? (
                      <pre className="text-red-400 text-sm font-mono whitespace-pre-wrap">{output.error}</pre>
                    ) : (
                      <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">{output.output || 'No output'}</pre>
                    )}
                    {output.executionTime > 0 && (
                      <p className="text-gray-500 text-xs mt-2">
                        Execution time: {output.executionTime}ms | Exit code: {output.exitCode}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <p className="text-gray-500 font-medium">Select a problem to start coding</p>
              <p className="text-gray-400 text-sm mt-1">Choose from the list on the left</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Practice;