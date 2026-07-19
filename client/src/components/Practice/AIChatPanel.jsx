import { useRef, useEffect, useState } from 'react';
import { Send, Brain, Sparkles, Clock, Copy, X } from 'lucide-react';
import usePracticeStore from '../../stores/practiceStore';
import { interviewAPI, hintsAPI } from '../../lib/api';
import useToastStore from '../../stores/toastStore';

export default function AIChatPanel() {
  const {
    sessionId, question, chatHistory, suggestions, interviewer,
    typing, inputText, code, language,
    interviewerType, selectedTopicId, interviewDuration, timeLeft,
    setSessionId, setQuestion, setChatHistory, setSuggestions,
    setInterviewer, setTyping, setInputText, addChatMessage,
    setCode, setInterviewerType, setSelectedTopicId, setInterviewDuration,
    setTimerActive, setTimeLeft
  } = usePracticeStore();

  const showToast = useToastStore((state) => state.showToast);

  const chatEndRef = useRef(null);
  const [initializing, setInitializing] = useState(false);
  const [hintLevel, setHintLevel] = useState(1);
  const [gettingHint, setGettingHint] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, typing]);

  const startSession = async (customType = null) => {
    setInitializing(true);
    const targetType = customType || interviewerType;
    try {
      const res = await interviewAPI.start(
        targetType === 'dsa' ? (usePracticeStore.getState().selectedQuestionId || undefined) : null,
        targetType,
        targetType === 'system-design' ? selectedTopicId : null
      );
      
      const { sessionId: sId, question: qData, greeting, sender, suggestions: sug } = res.data;
      setSessionId(sId);
      
      if (targetType === 'dsa') {
        setQuestion(qData);
        const template = qData?.starterTemplates?.find(t => t.language === language)?.code || '';
        if (template) setCode(template);
      } else {
        setQuestion(null);
        setCode('');
      }

      setSuggestions(sug || []);
      setInterviewer(sender);
      setChatHistory([{ role: 'assistant', content: greeting, sender, timestamp: new Date() }]);
      
      // Start timer
      setTimeLeft(interviewDuration * 60);
      setTimerActive(true);
      setHintLevel(1);
      showToast('Interview session initialized!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Rate limit hit. Using simulated session.', 'warning');
      setSessionId('simulated_session_id');
      setChatHistory([{
        role: 'assistant',
        content: "Hello! I am your AI interviewer. Let's discuss your approach and write optimized code.",
        sender: 'dsa_interviewer',
        timestamp: new Date()
      }]);
      setTimeLeft(interviewDuration * 60);
      setTimerActive(true);
    } finally {
      setInitializing(false);
    }
  };

  const endSession = () => {
    if (window.confirm('Are you sure you want to end this interview round?')) {
      setSessionId(null);
      setChatHistory([]);
      setSuggestions([]);
      setTimerActive(false);
      showToast('Session terminated.', 'info');
    }
  };

  const sendMessage = async (textToSend) => {
    const msgText = textToSend || inputText;
    if (!msgText.trim() || typing) return;
    if (!textToSend) setInputText('');

    addChatMessage({ role: 'user', content: msgText, sender: 'candidate', timestamp: new Date() });
    setTyping(true);

    try {
      const res = await interviewAPI.message(sessionId, msgText, code, language);
      const { response: aiReply, sender: s, suggestions: nextSug } = res.data;
      addChatMessage({ role: 'assistant', content: aiReply, sender: s, timestamp: new Date() });
      setSuggestions(nextSug || []);
      setInterviewer(s);
    } catch (err) {
      console.error('Failed to send message', err);
      // Simulated response on rate-limiting
      setTimeout(() => {
        addChatMessage({
          role: 'assistant',
          content: "I received your approach. Could you walk me through the time complexity and if there are any edge cases we should cover?",
          sender: interviewer || 'dsa_interviewer',
          timestamp: new Date()
        });
        setTyping(false);
      }, 1500);
      return;
    } finally {
      setTyping(false);
    }
  };

  const requestHint = async () => {
    if (gettingHint || !sessionId) return;
    setGettingHint(true);
    try {
      const qTitle = question ? question.title : 'Coding Problem';
      const qDesc = question ? question.description : '';
      
      const res = await hintsAPI.generate(qTitle, qDesc, code, hintLevel);
      const hintMsg = `💡 [Hint Level ${hintLevel}] ${res.data.hint}`;
      
      addChatMessage({
        role: 'assistant',
        content: hintMsg,
        sender: 'dsa_interviewer',
        timestamp: new Date()
      });

      setHintLevel(prev => prev < 3 ? prev + 1 : 1);
      showToast('Hint revealed in chat!', 'info');
    } catch (err) {
      // Fallback hint
      addChatMessage({
        role: 'assistant',
        content: `💡 [Hint Level ${hintLevel}] Try using double pointers or mapping seen numbers to indices in a dictionary to retrieve targets in single traversal.`,
        sender: 'dsa_interviewer',
        timestamp: new Date()
      });
      setHintLevel(prev => prev < 3 ? prev + 1 : 1);
      showToast('Hint unlocked!', 'info');
    } finally {
      setGettingHint(false);
    }
  };

  const handleCopyCode = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Code copied to clipboard!', 'success');
  };

  const renderMessageContent = (content) => {
    if (!content.includes('```')) {
      return <p className="whitespace-pre-line">{content}</p>;
    }
    const parts = content.split('```');
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        const lines = part.split('\n');
        let lang = '';
        let codeText = part;
        const potentialLang = lines[0].trim().toLowerCase();
        if (lines.length > 0 && ['javascript', 'js', 'python', 'py', 'java', 'cpp', 'c++'].includes(potentialLang)) {
          lang = lines[0];
          codeText = lines.slice(1).join('\n');
        }
        return (
          <div key={index} className="relative group/code mt-2">
            <pre className="chat-code-block font-mono bg-[#1E1E1E] p-2 border border-[#2D2D2D] rounded text-[10px] text-[#EFEFEF] overflow-x-auto">
              {lang && <div className="text-[10px] text-[#FFA116] uppercase border-b border-[#2D2D2D] pb-1 mb-1">{lang}</div>}
              <code>{codeText}</code>
            </pre>
            <button
              onClick={() => handleCopyCode(codeText)}
              className="absolute right-2 top-2 p-1 bg-[#2D2D2D] hover:bg-[#FFA116] text-[#8C8C8C] hover:text-black rounded opacity-0 group-hover/code:opacity-100 transition-opacity"
              title="Copy Code"
            >
              <Copy size={11} />
            </button>
          </div>
        );
      }
      return <span key={index} className="whitespace-pre-line inline">{part}</span>;
    });
  };

  const getAgentHeader = () => {
    const activeInterviewer = interviewer || 'dsa_interviewer';
    if (activeInterviewer === 'dsa_interviewer') {
      return { logo: '🤖', name: 'DSA Specialist', role: 'AI Hiring Panelist' };
    } else if (activeInterviewer === 'system_design_interviewer') {
      return { logo: '🌐', name: 'System Design Expert', role: 'AI Hiring Panelist' };
    } else {
      return { logo: '👔', name: 'HR Recruiter', role: 'AI Hiring Panelist' };
    }
  };

  const agentHeader = getAgentHeader();

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section className="chat-panel-col flex flex-col h-full bg-[#1A1A1A] border border-[#2D2D2D] text-[#EFEFEF] select-none">
      {/* Top Agent tabs */}
      <div className="flex bg-[#0A0A0A] border-b border-[#2D2D2D] h-10 shrink-0">
        {[
          { type: 'dsa', icon: '🖥️', label: 'DSA' },
          { type: 'system-design', icon: '🌐', label: 'Sys Design' },
          { type: 'hr', icon: '👔', label: 'HR' }
        ].map(item => (
          <button
            key={item.type}
            onClick={() => {
              setInterviewerType(item.type);
              if (sessionId) {
                setSessionId(null);
                setChatHistory([]);
              }
            }}
            className={`flex-1 text-center text-xs font-bold border-b-2 transition ${
              interviewerType === item.type 
                ? 'border-[#FFA116] text-[#FFA116]' 
                : 'border-transparent text-[#8C8C8C] hover:text-[#EFEFEF]'
            }`}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      {/* Initialize Controls / Active Agent Card */}
      {!sessionId ? (
        <div className="flex-1 flex flex-col justify-center p-4 bg-[#0A0A0A] gap-4">
          <div className="text-center mb-2">
            <Sparkles className="text-[#FFA116] mx-auto mb-2" size={28} />
            <h4 className="text-white font-bold text-sm">Select Assessment Panelist</h4>
            <p className="text-[11px] text-zinc-500 mt-1">Pick a mock category target to verify coding approaches.</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-[#8C8C8C] font-bold uppercase tracking-wider flex items-center gap-1">
              <Clock size={11} /> Round Duration
            </label>
            <select
              value={interviewDuration}
              onChange={(e) => setInterviewDuration(parseInt(e.target.value, 10))}
              className="bg-[#1A1A1A] border border-[#2D2D2D] text-[#EFEFEF] rounded p-2 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="15">15 Minutes</option>
              <option value="30">30 Minutes</option>
              <option value="45">45 Minutes</option>
              <option value="60">60 Minutes</option>
            </select>
          </div>

          {interviewerType === 'system-design' && (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-[#8C8C8C] font-bold uppercase tracking-wider">Architecture Target</label>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="bg-[#1A1A1A] border border-[#2D2D2D] text-[#EFEFEF] rounded p-2 text-xs font-bold outline-none cursor-pointer"
              >
                <option value="url-shortener">Design URL Shortener</option>
                <option value="rate-limiter">Design API Rate Limiter</option>
                <option value="chat-system">Design Chat System</option>
              </select>
            </div>
          )}

          <button
            onClick={() => startSession()}
            className="bg-[#FFA116] text-black font-semibold rounded py-2 text-center text-xs hover:bg-[#E6911A]"
          >
            Initialize Session
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 bg-[#0A0A0A]">
          {/* Agent Card */}
          <div className="p-3 border-b border-[#2D2D2D] bg-[#1A1A1A] flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="text-xl bg-[#2D2D2D] p-1.5 rounded-lg border border-[#3F3F46]">🤖</div>
              <div>
                <h4 className="text-xs font-bold text-white">{agentHeader.name}</h4>
                <p className="text-[9px] text-[#8C8C8C]">{agentHeader.role}</p>
                <span className="text-[9px] text-[#00B8A3] flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00B8A3] inline-block"></span> Online
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[10px] text-[#FFA116] font-mono font-bold">
                Session: {formatTime(timeLeft)}
              </span>
              <button 
                onClick={endSession}
                className="text-[9px] bg-red-900/40 text-red-400 hover:bg-red-900 border border-red-800 px-2 py-0.5 rounded transition font-bold"
              >
                End Session
              </button>
            </div>
          </div>

          {/* Chat History Panel */}
          <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3 min-h-0">
            {chatHistory.map((msg, idx) => {
              const isAI = msg.role === 'assistant';
              const timeStr = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
              return (
                <div key={idx} className={`flex gap-2 max-w-[85%] ${isAI ? 'self-start' : 'self-end flex-row-reverse'}`}>
                  <div className="text-xs bg-[#2D2D2D] border border-zinc-700 w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                    {isAI ? '🤖' : '👤'}
                  </div>
                  <div className="flex flex-col">
                    <div className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                      isAI 
                        ? 'bg-[#2D2D2D] text-[#EFEFEF] rounded-tl-none border border-[#3F3F46]' 
                        : 'bg-[#FFA116] text-black rounded-tr-none font-semibold'
                    }`}>
                      {renderMessageContent(msg.content)}
                    </div>
                    {timeStr && <span className="text-[8px] text-[#8C8C8C] mt-0.5 px-1">{timeStr}</span>}
                  </div>
                </div>
              );
            })}

            {typing && (
              <div className="flex gap-2 max-w-[80%] self-start">
                <div className="text-xs bg-[#2D2D2D] border border-zinc-700 w-6 h-6 rounded-full flex items-center justify-center">
                  🤖
                </div>
                <div className="flex flex-col">
                  <div className="bg-[#2D2D2D] p-2 rounded-lg rounded-tl-none border border-[#3F3F46] flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-[#8C8C8C] rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-[#8C8C8C] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1.5 h-1.5 bg-[#8C8C8C] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Helper Actions Row */}
          <div className="px-2 py-1.5 bg-[#1A1A1A] border-t border-[#2D2D2D] flex flex-wrap gap-1">
            <button
              onClick={() => sendMessage(`Here is my code solution:\n\`\`\`${language}\n${code}\n\`\`\`\nPlease analyze this code and check for logical errors.`)}
              className="text-[9px] bg-[#2D2D2D] border border-zinc-700 rounded px-2.5 py-1 hover:bg-[#FFA116] hover:text-black transition"
            >
              🔍 Analyze Code
            </button>
            <button
              onClick={requestHint}
              className="text-[9px] bg-[#2D2D2D] border border-zinc-700 rounded px-2.5 py-1 hover:bg-[#FFA116] hover:text-black transition"
            >
              💡 Get Hint
            </button>
            <button
              onClick={() => sendMessage("Can you explain the optimal algorithmic approach for this problem?")}
              className="text-[9px] bg-[#2D2D2D] border border-zinc-700 rounded px-2.5 py-1 hover:bg-[#FFA116] hover:text-black transition"
            >
              📖 Explain
            </button>
            <button
              onClick={() => sendMessage(`Analyze the time and space complexity of my code:\n\`\`\`${language}\n${code}\n\`\`\``)}
              className="text-[9px] bg-[#2D2D2D] border border-zinc-700 rounded px-2.5 py-1 hover:bg-[#FFA116] hover:text-black transition"
            >
              ⏱ Complexity
            </button>
          </div>

          {/* Chat Input Textarea */}
          <div className="p-2 border-t border-[#2D2D2D] bg-[#0A0A0A] flex flex-col gap-1">
            <div className="flex gap-2 items-center">
              <textarea
                value={inputText}
                onChange={(e) => { if (e.target.value.length <= 500) setInputText(e.target.value); }}
                onKeyDown={handleKeyDown}
                placeholder="Ctrl+Enter to send..."
                rows={1}
                className="flex-1 bg-[#1A1A1A] border border-[#2D2D2D] text-[#EFEFEF] rounded px-2.5 py-1.5 text-xs outline-none focus:border-[#FFA116] resize-none font-sans"
              />
              <button
                onClick={() => sendMessage()}
                disabled={typing || !inputText.trim()}
                className="bg-[#FFA116] text-black font-bold p-1.5 rounded hover:bg-[#E6911A] transition disabled:opacity-40"
              >
                <Send size={13} />
              </button>
            </div>
            <div className="flex justify-between text-[9px] text-[#8C8C8C] px-1 select-none">
              <span>Shift+Enter for newline</span>
              <span>{inputText.length} / 500</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}