import { useState, useEffect } from 'react';
import { Loader2, Flame, Award, ArrowUpRight, Star } from 'lucide-react';
import { userAPI } from '../lib/api';

const LEADERBOARD_DATA = [
  { rank: 1, name: 'Rajesh Kumar', college: 'IIT Bombay', score: 95, streak: 42, medal: '🥇' },
  { rank: 2, name: 'Sneha Gupta', college: 'BITS Pilani', score: 92, streak: 31, medal: '🥈' },
  { rank: 3, name: 'Amit Patel', college: 'DTU', score: 89, streak: 28, medal: '🥉' },
  { rank: 4, name: 'Priya Sharma', college: 'NSUT', score: 87, streak: 22 },
  { rank: 5, name: 'Rohan Sen', college: 'VIT Vellore', score: 85, streak: 19 },
  { rank: 6, name: 'Neha Joshi', college: 'SRM Chennai', score: 83, streak: 18 },
  { rank: 7, name: 'Vikram Dev', college: 'NIT Trichy', score: 82, streak: 15 },
  { rank: 8, name: 'Aman Singh', college: 'IIIT Hyderabad', score: 80, streak: 12 },
  { rank: 9, name: 'Abhishek Jha', college: 'DTU Delhi', score: 78, streak: 10 },
  { rank: 10, name: 'Swati Bose', college: 'IIT Delhi', score: 77, streak: 8 },
  { rank: 11, name: 'Candidate (You)', college: 'VJTI Mumbai', score: 75, streak: 7, isCurrentUser: true },
  { rank: 12, name: 'Karan Shah', college: 'VJTI Mumbai', score: 74, streak: 6 },
  { rank: 13, name: 'Nisha Mehta', college: 'COEP Pune', score: 72, streak: 5 },
  { rank: 14, name: 'Ravi Teja', college: 'IIT Madras', score: 71, streak: 4 },
  { rank: 15, name: 'Divya Nair', college: 'NIT Calicut', score: 70, streak: 4 },
  { rank: 16, name: 'Sanjay Dutt', college: 'BITS Goa', score: 68, streak: 3 },
  { rank: 17, name: 'Pooja Hegde', college: 'RVCE Bangalore', score: 67, streak: 3 },
  { rank: 18, name: 'Vijay Devar', college: 'IIIT Bangalore', score: 66, streak: 2 },
  { rank: 19, name: 'Arjun Reddy', college: 'OU Hyderabad', score: 64, streak: 2 },
  { rank: 20, name: 'Kabir Singh', college: 'IIT Roorkee', score: 62, streak: 1 }
];

const TOPICS = ['Arrays', 'Strings', 'Trees', 'DP', 'Graphs', 'SQL', 'Stack', 'Binary Search'];

export default function Journey() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const [hoverText, setHoverText] = useState('Hover over heatmap cell to view details');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await userAPI.stats();
        setStats(statsRes.data.stats);
      } catch (err) {
        console.error('Failed to load journey statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-120px)] bg-[#0A0A0A] text-[#8C8C8C]">
        <Loader2 className="spinner animate-spin text-[#FFA116] mb-2" size={32} />
        <span className="text-xs">Loading analytics dashboard...</span>
      </div>
    );
  }

  // Aggregate metrics
  const totalSolved = (stats?.solvedCount?.easy || 0) + (stats?.solvedCount?.medium || 0) + (stats?.solvedCount?.hard || 0) || 12;
  const streak = stats?.streak?.count || 7;
  const accuracy = stats?.accuracyRate || 74;
  const mockScore = stats?.mockInterviewScore || 8.5;

  // Paginated Leaderboard Slice
  const leaderboardStartIdx = (leaderboardPage - 1) * 10;
  const paginatedLeaderboard = LEADERBOARD_DATA.slice(leaderboardStartIdx, leaderboardStartIdx + 10);

  return (
    <div className="flex flex-col gap-4 p-4 bg-[#0A0A0A] min-h-[calc(100vh-80px)] text-[#EFEFEF]">
      
      {/* Hero Header */}
      <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
            📊 Placement Analytics Console
          </h2>
          <p className="text-xs text-[#8C8C8C] mt-0.5">
            Monitor real-time progress indicators, compilation stats, and cohort standing metrics.
          </p>
        </div>
      </div>

      {/* TOP ROW: 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-lg p-4 relative overflow-hidden group hover:scale-[1.01] transition-all duration-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#FFA116]" />
          <span className="text-[10px] text-[#8C8C8C] uppercase font-bold tracking-wider">Problems Solved</span>
          <p className="text-2xl font-extrabold text-white mt-2 flex items-baseline gap-1.5">
            {totalSolved} <span className="text-xs text-[#8C8C8C] font-normal">Questions</span>
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-lg p-4 relative overflow-hidden group hover:scale-[1.01] transition-all duration-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#FFA116]" />
          <span className="text-[10px] text-[#8C8C8C] uppercase font-bold tracking-wider">Current Streak</span>
          <p className="text-2xl font-extrabold text-white mt-2 flex items-baseline gap-1.5">
            {streak} <span className="text-xs text-[#8C8C8C] font-normal">Days 🔥</span>
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-lg p-4 relative overflow-hidden group hover:scale-[1.01] transition-all duration-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#FFA116]" />
          <span className="text-[10px] text-[#8C8C8C] uppercase font-bold tracking-wider">Accuracy Rate</span>
          <p className="text-2xl font-extrabold text-[#00B8A3] mt-2 flex items-baseline gap-1">
            {accuracy}% <span className="text-[10px] text-[#00B8A3] flex items-center"><ArrowUpRight size={10} /> +2.5%</span>
          </p>
        </div>

        {/* Card 4 */}
        <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-lg p-4 relative overflow-hidden group hover:scale-[1.01] transition-all duration-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#FFA116]" />
          <span className="text-[10px] text-[#8C8C8C] uppercase font-bold tracking-wider">Interview Score</span>
          <p className="text-2xl font-extrabold text-white mt-2 flex items-baseline gap-1.5">
            {mockScore}/10
            <span className="flex text-[#FFA116] ml-1 text-xs">
              <Star size={11} fill="#FFA116" />
              <Star size={11} fill="#FFA116" />
              <Star size={11} fill="#FFA116" />
              <Star size={11} fill="#FFA116" />
            </span>
          </p>
        </div>
      </div>

      {/* MIDDLE ROW: 2 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Problems by Topic (Horizontal Bar Chart) */}
        <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-lg p-4 flex flex-col justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Problems by Topic</h3>
          
          <div className="py-2">
            <svg viewBox="0 0 350 200" className="w-full">
              {/* Render 8 Topics */}
              {TOPICS.map((topic, i) => {
                // Simulate solved distribution
                const val = i === 0 ? 8 : i === 1 ? 6 : i === 3 ? 5 : i === 5 ? 7 : i === 2 ? 4 : 2;
                const barWidth = val * 25; // Scale bar
                const yPos = 15 + i * 22;

                return (
                  <g key={topic}>
                    {/* Label */}
                    <text x="5" y={yPos + 11} fill="#8C8C8C" fontSize="10" fontWeight="600">{topic}</text>
                    
                    {/* Background Bar */}
                    <rect x="90" y={yPos} width="220" height="14" rx="2" fill="#2D2D2D" />
                    
                    {/* Solved Filled Bar */}
                    <rect x="90" y={yPos} width={barWidth} height="14" rx="2" fill="#FFA116" />
                    
                    {/* Count Label */}
                    <text x={95 + barWidth} y={yPos + 11} fill="#EFEFEF" fontSize="9" fontWeight="bold">{val}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right: Performance Over Time (Line Graph) */}
        <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-lg p-4 flex flex-col justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Performance Over Time</h3>
          
          <div className="py-2">
            <svg viewBox="0 0 320 200" className="w-full">
              {/* Grid Lines */}
              <line x1="30" y1="20" x2="300" y2="20" stroke="#2D2D2D" strokeWidth="0.5" />
              <line x1="30" y1="70" x2="300" y2="70" stroke="#2D2D2D" strokeWidth="0.5" />
              <line x1="30" y1="120" x2="300" y2="120" stroke="#2D2D2D" strokeWidth="0.5" />
              <line x1="30" y1="170" x2="300" y2="170" stroke="#2D2D2D" strokeWidth="0.5" />

              {/* Path line (last 14 days values) */}
              <path
                d="M 40 150 Q 80 120 120 130 T 200 60 T 280 40"
                fill="none"
                stroke="#FFA116"
                strokeWidth="2"
              />

              {/* Circles on Nodes */}
              <circle cx="40" cy="150" r="3.5" fill="#FFA116" stroke="#1A1A1A" strokeWidth="1" />
              <circle cx="80" cy="120" r="3.5" fill="#FFA116" stroke="#1A1A1A" strokeWidth="1" />
              <circle cx="120" cy="130" r="3.5" fill="#FFA116" stroke="#1A1A1A" strokeWidth="1" />
              <circle cx="160" cy="90" r="3.5" fill="#FFA116" stroke="#1A1A1A" strokeWidth="1" />
              <circle cx="200" cy="60" r="3.5" fill="#FFA116" stroke="#1A1A1A" strokeWidth="1" />
              <circle cx="240" cy="80" r="3.5" fill="#FFA116" stroke="#1A1A1A" strokeWidth="1" />
              <circle cx="280" cy="40" r="3.5" fill="#FFA116" stroke="#1A1A1A" strokeWidth="1" />

              {/* Axis Labels */}
              <text x="40" y="185" fill="#8C8C8C" fontSize="8" textAnchor="middle">Day 1</text>
              <text x="120" y="185" fill="#8C8C8C" fontSize="8" textAnchor="middle">Day 5</text>
              <text x="200" y="185" fill="#8C8C8C" fontSize="8" textAnchor="middle">Day 9</text>
              <text x="280" y="185" fill="#8C8C8C" fontSize="8" textAnchor="middle">Day 14</text>

              {/* Values tags */}
              <text x="40" y="140" fill="#EFEFEF" fontSize="8" textAnchor="middle">1</text>
              <text x="120" y="120" fill="#EFEFEF" fontSize="8" textAnchor="middle">3</text>
              <text x="200" y="50" fill="#EFEFEF" fontSize="8" textAnchor="middle">7</text>
              <text x="280" y="30" fill="#EFEFEF" fontSize="8" textAnchor="middle">9</text>
            </svg>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Heatmap & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left: Weak Topics Heatmap (7 columns x 8 topics) */}
        <div className="lg:col-span-6 bg-[#1A1A1A] border border-[#2D2D2D] rounded-lg p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Weak Topics Heatmap</h3>
            <p className="text-[10px] text-[#8C8C8C] mb-3">Double intensity squares show weaker skills that need more practice.</p>
          </div>

          <div className="flex gap-2">
            {/* Topic labels */}
            <div className="flex flex-col justify-between h-[150px] pr-2 text-right">
              {TOPICS.slice(0, 6).map(topic => (
                <span key={topic} className="text-[9px] text-[#8C8C8C] font-semibold h-4 leading-4">{topic}</span>
              ))}
            </div>

            {/* Heatmap cells */}
            <div className="flex-1 flex flex-col justify-between h-[150px]">
              {TOPICS.slice(0, 6).map((topic, tIdx) => (
                <div key={topic} className="flex justify-between gap-1">
                  {Array.from({ length: 8 }).map((_, wIdx) => {
                    // Simulate cell strength
                    const solved = (tIdx + wIdx) % 4;
                    const colors = {
                      0: 'bg-[#2D2D2D] hover:bg-[#8C8C8C]',
                      1: 'bg-[#6b4002] hover:bg-[#FFA116]/60',
                      2: 'bg-[#b56a00] hover:bg-[#FFA116]/80',
                      3: 'bg-[#FFA116] hover:scale-105'
                    };
                    const label = `${topic} - Week ${wIdx + 1}: ${solved} problems solved`;
                    return (
                      <div
                        key={wIdx}
                        title={label}
                        onMouseEnter={() => setHoverText(label)}
                        className={`h-4 w-full rounded-sm cursor-pointer transition ${colors[solved]}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend and Tooltip status */}
          <div className="flex justify-between items-center border-t border-[#2D2D2D] pt-2.5 mt-4 text-[10px]">
            <span className="text-[#8C8C8C] font-mono">{hoverText}</span>
            <div className="flex gap-1.5 items-center text-[#8C8C8C]">
              <span>Weaker</span>
              <div className="w-2.5 h-2.5 bg-[#FFA116] rounded-sm" />
              <div className="w-2.5 h-2.5 bg-[#b56a00] rounded-sm" />
              <div className="w-2.5 h-2.5 bg-[#6b4002] rounded-sm" />
              <div className="w-2.5 h-2.5 bg-[#2D2D2D] rounded-sm" />
              <span>Stronger</span>
            </div>
          </div>
        </div>

        {/* Right: Leaderboard */}
        <div className="lg:col-span-6 bg-[#1A1A1A] border border-[#2D2D2D] rounded-lg p-4 flex flex-col justify-between min-h-[250px]">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Global placement Leaderboard</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2D2D2D] text-[#8C8C8C]">
                  <th className="py-2 font-semibold">Rank</th>
                  <th className="py-2 font-semibold">Name</th>
                  <th className="py-2 font-semibold">College</th>
                  <th className="py-2 font-semibold">Score</th>
                  <th className="py-2 font-semibold">Streak</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLeaderboard.map((row) => (
                  <tr 
                    key={row.rank} 
                    className={`border-b border-[#2D2D2D]/60 hover:bg-[#2D2D2D]/20 ${
                      row.isCurrentUser ? 'bg-[#FFA116]/10 font-bold border-l-2 border-[#FFA116]' : ''
                    }`}
                  >
                    <td className="py-2 font-mono flex items-center gap-1">
                      {row.medal ? <span>{row.medal}</span> : <span>#{row.rank}</span>}
                    </td>
                    <td className="py-2">{row.name}</td>
                    <td className="py-2 text-[#8C8C8C]">{row.college}</td>
                    <td className="py-2 text-[#00B8A3] font-semibold">{row.score}%</td>
                    <td className="py-2 font-mono">{row.streak}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center border-t border-[#2D2D2D] pt-3 mt-3">
            <span className="text-[10px] text-[#8C8C8C]">
              Showing page {leaderboardPage} of 2
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setLeaderboardPage(1)}
                disabled={leaderboardPage === 1}
                className="px-2 py-0.5 border border-[#2D2D2D] text-[#EFEFEF] rounded text-[10px] font-bold hover:bg-[#2D2D2D] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ◀ Page 1
              </button>
              <button
                onClick={() => setLeaderboardPage(2)}
                disabled={leaderboardPage === 2}
                className="px-2 py-0.5 border border-[#2D2D2D] text-[#EFEFEF] rounded text-[10px] font-bold hover:bg-[#2D2D2D] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Page 2 ▶
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}