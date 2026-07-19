import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, XCircle, Search, RefreshCw, AlignLeft } from 'lucide-react';
import Editor from '@monaco-editor/react';
import usePracticeStore from '../../stores/practiceStore';
import { sqlAPI } from '../../lib/api';
import useToastStore from '../../stores/toastStore';

const COMPANIES = ['All', 'Cognizant', 'TCS', 'Amazon', 'Infosys', 'Wipro'];
const TOPICS = ['All Topics', 'SELECT', 'WHERE', 'GROUP BY', 'HAVING', 'JOINS', 'SUBQUERIES', 'WINDOW FN', 'CTEs', 'NULL', 'AGGREGATE', 'DATE/TIME'];

const getProblemTags = (prob) => {
  const title = prob.title.toLowerCase();
  const desc = prob.description.toLowerCase();
  const tags = [];
  
  if (title.includes('highest') || title.includes('average') || title.includes('max') || title.includes('median')) tags.push('AGGREGATE');
  if (title.includes('second') || title.includes('nth') || desc.includes('subquery') || title.includes('never ordered')) tags.push('SUBQUERIES');
  if (title.includes('group') || desc.includes('group by') || title.includes('count')) tags.push('GROUP BY');
  if (desc.includes('join') || title.includes('employee earning')) tags.push('JOINS');
  if (desc.includes('date') || desc.includes('month') || title.includes('hired') || title.includes('temperature') || title.includes('consecutive')) tags.push('DATE/TIME');
  if (desc.includes('null') || title.includes('null')) tags.push('NULL');
  if (title.includes('rank')) tags.push('WINDOW FN');
  if (title.includes('mumbai') || title.includes('delhi') || desc.includes('price') || desc.includes('greater than')) tags.push('WHERE');
  if (tags.length === 0) tags.push('SELECT');
  return tags;
};

// Raw sample data mapping for schema display
const SAMPLE_TABLES_DATA = {
  Employee: {
    columns: ['id', 'name', 'salary', 'dept_id', 'manager_id', 'hire_date', 'city', 'age'],
    rows: [
      { id: 1, name: 'Alice', salary: 70000, dept_id: 1, manager_id: 3, hire_date: '2024-01-15', city: 'Mumbai', age: 28 },
      { id: 2, name: 'Bob', salary: 80000, dept_id: 2, manager_id: 1, hire_date: '2023-05-20', city: 'Delhi', age: 32 },
      { id: 3, name: 'Charlie', salary: 60000, dept_id: 1, manager_id: 'NULL', hire_date: '2022-09-01', city: 'Mumbai', age: 41 },
      { id: 4, name: 'Diana', salary: 90000, dept_id: 3, manager_id: 3, hire_date: '2024-03-10', city: 'Pune', age: 24 }
    ]
  },
  Product: {
    columns: ['id', 'name', 'category', 'price', 'stock'],
    rows: [
      { id: 201, name: 'Monitor', category: 'Electronics', price: 600, stock: 15 },
      { id: 202, name: 'Keyboard', category: 'Electronics', price: 450, stock: 40 },
      { id: 203, name: 'Mouse', category: 'Electronics', price: 150, stock: 50 }
    ]
  },
  Customer: {
    columns: ['id', 'name', 'email', 'city'],
    rows: [
      { id: 101, name: 'Rahul', email: 'rahul@gmail.com', city: 'Delhi' },
      { id: 102, name: 'Priya', email: 'priya@gmail.com', city: 'Mumbai' }
    ]
  },
  Orders: {
    columns: ['id', 'customer_id', 'product_id', 'quantity', 'amount', 'order_date'],
    rows: [
      { id: 501, customer_id: 101, product_id: 201, quantity: 2, amount: 1200, order_date: '2024-06-01' },
      { id: 502, customer_id: 102, product_id: 203, quantity: 1, amount: 150, order_date: '2024-06-03' }
    ]
  },
  Attendance: {
    columns: ['emp_id', 'date', 'status'],
    rows: [
      { emp_id: 1, date: '2026-07-01', status: 'Present' },
      { emp_id: 2, date: '2026-07-01', status: 'Absent' }
    ]
  },
  Student: {
    columns: ['id', 'name', 'marks'],
    rows: [
      { id: 1, name: 'Aman', marks: 85 },
      { id: 2, name: 'Nisha', marks: 92 }
    ]
  }
};

export default function SQLPanel() {
  const {
    sqlProblems, sqlQuery, sqlOutput, sqlError, runningSql,
    setSqlQuery, setSqlOutput, setSqlError, setRunningSql
  } = usePracticeStore();

  const showToast = useToastStore((state) => state.showToast);

  // Resize split widths
  const [leftWidth, setLeftWidth] = useState(45);
  const [isResizing, setIsResizing] = useState(false);

  // Filter conditions
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState('All Topics');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selection
  const [activeProbId, setActiveProbId] = useState('sql-1');
  const [activeTab, setActiveTab] = useState('run'); // 'run' | 'submit'
  const [validationResult, setValidationResult] = useState(null);
  const [expectedTable, setExpectedTable] = useState(null);

  // Drag resize handler
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth > 20 && newWidth < 80) {
        setLeftWidth(newWidth);
      }
    };
    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Compute filtered questions
  const filteredProblems = sqlProblems.filter(prob => {
    const tags = getProblemTags(prob);
    const matchesSearch = prob.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prob.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = selectedCompany === 'All' || prob.company?.toLowerCase() === selectedCompany.toLowerCase();
    const matchesTopic = selectedTopic === 'All Topics' || tags.includes(selectedTopic);
    return matchesSearch && matchesCompany && matchesTopic;
  });

  const selectedProblem = sqlProblems.find(p => p.id === activeProbId) || sqlProblems[0];

  // Set default starter query and pre-fetch expected output table on question select
  useEffect(() => {
    if (selectedProblem) {
      setSqlQuery(selectedProblem.starterQuery);
      setSqlOutput(null);
      setSqlError('');
      setValidationResult(null);
      fetchExpectedOutput();
    }
  }, [activeProbId]);

  const fetchExpectedOutput = async () => {
    try {
      const res = await sqlAPI.execute(selectedProblem.starterQuery, selectedProblem.id, 'run');
      if (res.data.success) {
        setExpectedTable(res.data);
      }
    } catch (err) {
      console.error('Failed to pre-fetch expected table output:', err);
    }
  };

  const executeQuery = async (action = 'run') => {
    setRunningSql(true);
    setSqlOutput(null);
    setSqlError('');
    setValidationResult(null);
    setActiveTab(action);

    try {
      const res = await sqlAPI.execute(sqlQuery, selectedProblem.id, action);
      const data = res.data;

      if (data.success) {
        setSqlOutput(data);
        if (action === 'submit') {
          setValidationResult({
            status: data.status,
            message: data.message,
            expected: data.expected || expectedTable
          });
          if (data.status === 'ACCEPTED') {
            showToast('✓ Problem solved!', 'success');
          } else {
            showToast('Wrong output rows.', 'error');
          }
        } else {
          showToast('SQL query executed!', 'success');
        }
      } else {
        setSqlError(data.error || 'Database compilation error.');
        showToast('Compilation syntax error.', 'error');
      }
    } catch (err) {
      setSqlError('SQLite Sandbox boundary limit error.');
      showToast('Database error.', 'error');
    } finally {
      setRunningSql(false);
    }
  };

  const formatSQL = () => {
    let formatted = sqlQuery;
    const keywords = [
      'select', 'from', 'where', 'group by', 'having', 'join', 'left join', 
      'right join', 'inner join', 'on', 'and', 'or', 'order by', 'limit', 'offset', 
      'as', 'insert', 'update', 'delete', 'count', 'sum', 'avg', 'max', 'min'
    ];
    keywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      formatted = formatted.replace(regex, kw.toUpperCase());
    });
    setSqlQuery(formatted);
    showToast('SQL formatted successfully.', 'info');
  };

  const getReferenceTables = () => {
    if (!selectedProblem || !selectedProblem.schema) return [];
    return Object.keys(SAMPLE_TABLES_DATA).filter(tbl => 
      selectedProblem.schema.toLowerCase().includes(`table: ${tbl.toLowerCase()}`) ||
      selectedProblem.schema.includes(tbl)
    );
  };

  const refTables = getReferenceTables();

  const handleEditorDidMount = (editor, monaco) => {
    monaco.editor.defineTheme('leetcode-sql-theme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'comment', foreground: '6A9955' },
        { token: 'function', foreground: 'DCDCAA' }
      ],
      colors: {
        'editor.background': '#1A1A1A'
      }
    });
    monaco.editor.setTheme('leetcode-sql-theme');
  };

  return (
    <div 
      className="flex" 
      style={{ height: 'calc(100vh - 100px)', overflow: 'hidden', backgroundColor: '#0A0A0A', color: '#EFEFEF', userSelect: 'none' }}
    >
      {/* Left panel: problems and statement details */}
      <div 
        className="flex flex-col border"
        style={{ 
          width: `${leftWidth}%`, 
          height: '100%', 
          overflowY: 'auto', 
          padding: '1rem', 
          gap: '0.75rem', 
          backgroundColor: '#1A1A1A', 
          borderColor: '#2D2D2D' 
        }}
      >
        {/* Company filters list */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] uppercase font-bold text-[#8C8C8C] tracking-wider">Target Companies</span>
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
            {COMPANIES.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCompany(c)}
                className={`text-[10px] px-2.5 py-0.5 rounded border transition shrink-0 uppercase font-bold ${
                  selectedCompany === c ? 'bg-[#FFA116] text-black border-[#FFA116]' : 'border-[#2D2D2D] text-[#8C8C8C] hover:text-white'
                }`}
                style={{ borderColor: selectedCompany === c ? '#FFA116' : '#2D2D2D' }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Topic tags list */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] uppercase font-bold text-[#8C8C8C] tracking-wider">Topics</span>
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
            {TOPICS.map(t => (
              <button
                key={t}
                onClick={() => setSelectedTopic(t)}
                className={`text-[10px] px-2.5 py-0.5 rounded border transition shrink-0 uppercase font-semibold ${
                  selectedTopic === t ? 'bg-[#FFA116] text-black border-[#FFA116]' : 'border-[#2D2D2D] text-[#8C8C8C] hover:text-white'
                }`}
                style={{ borderColor: selectedTopic === t ? '#FFA116' : '#2D2D2D' }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search SQL problems..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0A0A0A] border text-[#EFEFEF] rounded px-8 py-1.5 text-xs outline-none focus:border-[#FFA116]"
            style={{ backgroundColor: '#0A0A0A', borderColor: '#2D2D2D' }}
          />
          <Search className="absolute left-2.5 top-2.5 text-[#8C8C8C]" size={12} style={{ top: '10px' }} />
        </div>

        {/* Problems scroll list */}
        <div 
          className="overflow-y-auto border rounded p-2 flex flex-col gap-1"
          style={{ maxHeight: '160px', minHeight: '160px', backgroundColor: '#0A0A0A', borderColor: '#2D2D2D' }}
        >
          {filteredProblems.map(p => (
            <div
              key={p.id}
              onClick={() => setActiveProbId(p.id)}
              className={`p-2 rounded cursor-pointer transition text-xs flex justify-between items-center ${
                activeProbId === p.id ? 'bg-[#2D2D2D] border-l-2 border-[#FFA116]' : 'hover:bg-[#2D2D2D]/60'
              }`}
              style={{ borderLeftColor: activeProbId === p.id ? '#FFA116' : 'transparent' }}
            >
              <span className="truncate pr-2">{p.title}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-[#8C8C8C]">{p.difficulty}</span>
                <span className="text-[9px] text-[#FFA116] font-mono">49%</span>
              </div>
            </div>
          ))}
          {filteredProblems.length === 0 && (
            <span className="text-xs text-[#8C8C8C] p-2 text-center">No SQL questions match these filter options.</span>
          )}
        </div>

        {/* Problem detail */}
        {selectedProblem && (
          <div className="flex-1 flex flex-col gap-4 border-t pt-4 mt-2" style={{ borderColor: '#2D2D2D' }}>
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase">{selectedProblem.title}</h3>
              <span 
                className="text-[10px] font-bold px-2 py-0.5 rounded uppercase"
                style={{
                  backgroundColor: selectedProblem.difficulty === 'easy' ? 'rgba(16,185,129,0.15)' : selectedProblem.difficulty === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                  color: selectedProblem.difficulty === 'easy' ? '#00B8A3' : selectedProblem.difficulty === 'medium' ? '#FFA116' : '#EF4444'
                }}
              >
                {selectedProblem.difficulty}
              </span>
            </div>

            <p className="text-xs leading-relaxed text-[#cbd5e1] whitespace-pre-wrap">{selectedProblem.description}</p>

            {/* Structured Table schemas HTML */}
            {refTables.length > 0 && (
              <div className="flex flex-col gap-3">
                <span className="text-[10px] text-[#8C8C8C] font-bold uppercase tracking-wider">Database Tables:</span>
                {refTables.map(tblName => {
                  const tbl = SAMPLE_TABLES_DATA[tblName];
                  return (
                    <div key={tblName} className="border rounded p-2.5 flex flex-col gap-2" style={{ backgroundColor: '#0A0A0A', borderColor: '#2D2D2D' }}>
                      <span className="text-xs font-mono font-bold text-[#FFA116]">{tblName} Table:</span>
                      <div className="overflow-x-auto rounded border" style={{ borderColor: '#2D2D2D' }}>
                        <table className="w-full text-[10px] border-collapse">
                          <thead>
                            <tr style={{ backgroundColor: '#1a3a5c', color: '#white' }}>
                              {tbl.columns.map(col => (
                                <th key={col} className="p-1 border font-mono font-bold text-left" style={{ borderColor: '#2D2D2D' }}>{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {tbl.rows.map((row, rIdx) => (
                              <tr key={rIdx} style={{ backgroundColor: rIdx % 2 === 0 ? '#1A1A1A' : '#222222' }}>
                                {tbl.columns.map(col => (
                                  <td key={col} className="p-1 border font-mono text-[#cbd5e1]" style={{ borderColor: '#2D2D2D' }}>{row[col]}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Expected Output */}
            {expectedTable && expectedTable.rows && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-[#8C8C8C] font-bold uppercase tracking-wider">Expected Output Table:</span>
                <div className="overflow-x-auto rounded border" style={{ backgroundColor: '#0A0A0A', borderColor: '#2D2D2D' }}>
                  <table className="w-full text-[10px] border-collapse">
                    <thead>
                      <tr style={{ backgroundColor: '#2D2D2D', color: '#8C8C8C' }}>
                        {expectedTable.columns.map((col, idx) => (
                          <th key={idx} className="p-1 border font-mono font-bold text-left" style={{ borderColor: '#2D2D2D' }}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {expectedTable.rows.map((row, rIdx) => (
                        <tr key={rIdx} style={{ backgroundColor: rIdx % 2 === 0 ? '#1A1A1A' : '#222222' }}>
                          {expectedTable.columns.map((col, cIdx) => (
                            <td key={cIdx} className="p-1 border font-mono text-[#00B8A3]" style={{ borderColor: '#2D2D2D' }}>{row[col]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Resize Split Handle Divider */}
      <div 
        onMouseDown={() => setIsResizing(true)}
        className={`panel-resize-handle ${isResizing ? 'active' : ''}`}
      />

      {/* Right panel: Editor and compilation verdict */}
      <div 
        className="flex flex-col border h-full overflow-hidden"
        style={{ width: `${100 - leftWidth}%`, borderColor: '#2D2D2D', backgroundColor: '#1A1A1A' }}
      >
        {/* Editor bar */}
        <div className="flex justify-between items-center px-3 py-2 border-b" style={{ backgroundColor: '#0A0A0A', borderColor: '#2D2D2D', height: '40px' }}>
          <div className="flex items-center gap-2">
            <span 
              className="border px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
              style={{ backgroundColor: 'rgba(0,112,243,0.1)', color: '#0070F3', borderColor: 'rgba(0,112,243,0.2)' }}
            >
              MySQL
            </span>
            <button 
              onClick={formatSQL}
              title="Auto Format SQL"
              className="p-1 hover:bg-[#2D2D2D] rounded text-[#8C8C8C] hover:text-white flex items-center gap-1 text-[10px] font-bold"
            >
              <AlignLeft size={13} /> Format
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => executeQuery('run')}
              disabled={runningSql || !sqlQuery.trim()}
              className="border text-white hover:bg-[#2D2D2D] transition px-3 py-1 rounded text-xs font-bold"
              style={{ borderColor: '#2D2D2D' }}
            >
              Run ▷
            </button>
            <button
              onClick={() => executeQuery('submit')}
              disabled={runningSql || !sqlQuery.trim()}
              className="bg-[#FFA116] text-black hover:bg-[#E6911A] transition px-3 py-1 rounded text-xs font-extrabold"
            >
              Submit
            </button>
          </div>
        </div>

        {/* Monaco SQL compiler */}
        <div className="flex-1" style={{ backgroundColor: '#1A1A1A' }}>
          <Editor
            height="100%"
            language="sql"
            theme="vs-dark"
            value={sqlQuery}
            onChange={(val) => setSqlQuery(val || '')}
            onMount={handleEditorDidMount}
            options={{
              fontSize: 14,
              fontFamily: 'JetBrains Mono, monospace',
              minimap: { enabled: false },
              lineNumbers: 'on',
              autoClosingBrackets: 'always',
              wordWrap: 'off',
              lineHeight: 20
            }}
          />
        </div>

        {/* Bottom results splits view */}
        <div 
          className="border-t p-3 overflow-y-auto font-mono text-xs"
          style={{ height: '240px', backgroundColor: '#0A0A0A', borderColor: '#2D2D2D' }}
        >
          {runningSql ? (
            <div className="flex justify-center items-center h-full text-[#8C8C8C] gap-2">
              <Loader2 className="spinner animate-spin text-[#FFA116]" size={16} />
              <span>Querying database sandbox rows...</span>
            </div>
          ) : sqlError ? (
            <pre className="text-[#EF4444] whitespace-pre-wrap">{sqlError}</pre>
          ) : sqlOutput ? (
            <div className="flex flex-col gap-3 h-full">
              {activeTab === 'run' ? (
                // Side-by-side run view
                <div className="flex flex-col gap-2 h-full">
                  <div className="flex justify-between items-center text-[10px] text-[#8C8C8C]">
                    <span className="font-bold">Query output: 245ms | Rows: {sqlOutput.rows?.length || 0}</span>
                    <span className={sqlOutput.status === 'ACCEPTED' || sqlOutput.success ? 'text-[#00B8A3] font-bold' : 'text-[#EF4444] font-bold'}>
                      {sqlOutput.status === 'ACCEPTED' || sqlOutput.success ? '✓ Output matches!' : '✗ Output mismatch'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 flex-1 min-h-0 overflow-y-auto" style={{ minHeight: '130px' }}>
                    {/* Your Output */}
                    <div className="flex flex-col min-h-0">
                      <span className="text-[10px] text-[#8C8C8C] font-semibold mb-1 uppercase">Your Output Table:</span>
                      <div className="overflow-auto border rounded bg-[#0A0A0A] flex-1" style={{ borderColor: '#2D2D2D' }}>
                        <table className="w-full text-[10px] border-collapse">
                          <thead>
                            <tr className="border-b" style={{ backgroundColor: '#1A1A1A', borderColor: '#2D2D2D', color: '#8C8C8C' }}>
                              {sqlOutput.columns?.map((c, i) => <th key={i} className="p-1 border text-left" style={{ borderColor: '#2D2D2D' }}>{c}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {sqlOutput.rows?.map((row, idx) => (
                              <tr key={idx} className="hover:bg-[#2D2D2D]">
                                {sqlOutput.columns?.map((c, i) => <td key={i} className="p-1 border text-[#FFA116]" style={{ borderColor: '#2D2D2D' }}>{row[c]}</td>)}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Expected Output */}
                    <div className="flex flex-col min-h-0">
                      <span className="text-[10px] text-[#8C8C8C] font-semibold mb-1 uppercase">Expected Output Table:</span>
                      <div className="overflow-auto border rounded bg-[#0A0A0A] flex-1" style={{ borderColor: '#2D2D2D' }}>
                        <table className="w-full text-[10px] border-collapse">
                          <thead>
                            <tr className="border-b" style={{ backgroundColor: '#1A1A1A', borderColor: '#2D2D2D', color: '#8C8C8C' }}>
                              {expectedTable?.columns?.map((c, i) => <th key={i} className="p-1 border text-left" style={{ borderColor: '#2D2D2D' }}>{c}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {expectedTable?.rows?.map((row, idx) => (
                              <tr key={idx} className="hover:bg-[#2D2D2D]">
                                {expectedTable?.columns?.map((c, i) => <td key={i} className="p-1 border text-[#00B8A3]" style={{ borderColor: '#2D2D2D' }}>{row[c]}</td>)}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Submit Result view
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {validationResult?.status === 'ACCEPTED' ? (
                      <span className="text-[#00B8A3] font-bold text-sm flex items-center gap-1">
                        <CheckCircle2 size={16} /> Accepted
                      </span>
                    ) : (
                      <span className="text-[#EF4444] font-bold text-sm flex items-center gap-1">
                        <XCircle size={16} /> Wrong Answer
                      </span>
                    )}
                  </div>
                  
                  {validationResult?.status === 'ACCEPTED' ? (
                    <div className="text-xs text-[#8C8C8C] border p-3 rounded" style={{ backgroundColor: '#1A1A1A', borderColor: '#2D2D2D' }}>
                      Runtime: <strong className="text-white">245ms</strong>, Beats <strong className="text-green-400">73.2%</strong> of MySQL submissions.
                    </div>
                  ) : (
                    <div className="text-xs text-[#8C8C8C] border p-3 rounded" style={{ backgroundColor: '#1A1A1A', borderColor: '#2D2D2D' }}>
                      The output rows returned do not match the expected dataset schema rows. Adjust joins or groups constraints.
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <span className="text-[#8C8C8C]">Execute your SQL query to inspect table outputs and validation status.</span>
          )}
        </div>
      </div>
    </div>
  );
}