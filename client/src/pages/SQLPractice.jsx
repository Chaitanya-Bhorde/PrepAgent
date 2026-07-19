import { useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import api from '../lib/api';
import toast from 'react-hot-toast';

const SQLPractice = () => {
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/sql-problems');
      setProblems(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load SQL problems');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProblemSelect = (problem) => {
    setSelectedProblem(problem);
    setQuery(problem.solution || '-- Write your SQL query here\n');
    setResult(null);
  };

  const executeQuery = useCallback(async () => {
    if (!query.trim()) {
      toast.error('Please write a query first');
      return;
    }
    setExecuting(true);
    setResult(null);
    try {
      const { data } = await api.post('/sql/execute', {
        query,
        problemId: selectedProblem?.id || selectedProblem?._id || null,
        action: 'run',
      });
      setResult(data.data || data);
    } catch (err) {
      setResult({ error: err.response?.data?.message || 'Query execution failed' });
    } finally {
      setExecuting(false);
    }
  }, [query, selectedProblem]);

  const handleEditorMount = (editor) => {
    editor.updateOptions({
      fontSize: 14,
      fontFamily: "'Fira Code', 'Consolas', 'Courier New', monospace",
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      lineNumbers: 'on',
      renderLineHighlight: 'line',
      cursorBlinking: 'smooth',
      bracketPairColorization: { enabled: true },
    });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white">
      {/* Left Sidebar */}
      <div className="w-[350px] min-w-[350px] border-r border-gray-200 flex flex-col bg-white">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-lg font-semibold">SQL Problems</h1>
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
            <div className="p-4 text-center text-gray-500 text-sm">No SQL problems available</div>
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
                {problem.company && (
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded mt-1 inline-block">
                    {problem.company}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Side */}
      <div className="flex-1 flex flex-col">
        {selectedProblem ? (
          <>
            {/* Problem Description */}
            <div className="p-6 border-b border-gray-200">
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
              <p className="text-gray-700 text-sm">{selectedProblem.description}</p>
              {selectedProblem.tableSchema && (
                <div className="mt-3 bg-gray-50 rounded-lg p-3">
                  <h3 className="text-xs font-semibold text-gray-900 mb-1">Table Schema:</h3>
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">{selectedProblem.tableSchema}</pre>
                </div>
              )}
            </div>

            {/* SQL Editor + Results */}
            <div className="flex-1 flex flex-col bg-[#1e1e1e]">
              {/* Editor Toolbar */}
              <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-gray-700">
                <span className="text-xs text-gray-400 font-medium">SQL Query</span>
                <button
                  onClick={executeQuery}
                  disabled={executing || !query.trim()}
                  className="px-4 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {executing ? 'Running...' : '▶ Run Query'}
                </button>
              </div>

              {/* Monaco Editor for SQL */}
              <div className="h-48">
                <Editor
                  height="100%"
                  language="sql"
                  value={query}
                  onChange={(value) => setQuery(value || '')}
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
                  }}
                />
              </div>

              {/* Results Panel */}
              <div className="flex-1 border-t border-gray-700">
                <div className="px-4 py-2 bg-[#2d2d2d] border-b border-gray-700">
                  <span className="text-xs font-medium text-gray-400">Results</span>
                </div>
                <div className="p-4 overflow-y-auto max-h-[calc(100vh-28rem)]">
                  {result ? (
                    result.error ? (
                      <div className="text-red-400 text-sm font-mono">{result.error}</div>
                    ) : (
                      <div>
                        {result.executionTime !== undefined && (
                          <p className="text-gray-500 text-xs mb-2">
                            Execution time: {result.executionTime}s | Rows: {result.rowCount || 0}
                          </p>
                        )}
                        {result.rows && result.rows.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                              <thead>
                                <tr className="border-b border-gray-600">
                                  {Object.keys(result.rows[0]).map((col) => (
                                    <th key={col} className="px-3 py-2 text-gray-400 font-medium text-xs uppercase">
                                      {col}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {result.rows.map((row, idx) => (
                                  <tr key={idx} className="border-b border-gray-700 hover:bg-gray-800">
                                    {Object.values(row).map((val, colIdx) => (
                                      <td key={colIdx} className="px-3 py-2 text-gray-300 text-xs">
                                        {val === null ? <span className="text-gray-600 italic">NULL</span> : String(val)}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">Query executed successfully. No rows returned.</p>
                        )}
                      </div>
                    )
                  ) : (
                    <p className="text-gray-500 text-sm">Run a query to see results</p>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
              <p className="text-gray-500 font-medium">Select a SQL problem to start</p>
              <p className="text-gray-400 text-sm mt-1">Choose from the list on the left</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SQLPractice;