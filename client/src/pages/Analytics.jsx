import { useState, useEffect } from 'react';
import { analyticsAPI } from '../lib/api';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [weakAreas, setWeakAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, weakRes] = await Promise.all([
        analyticsAPI.stats(),
        analyticsAPI.weakAreas(),
      ]);
      setStats(statsRes.data.data || statsRes.data);
      setWeakAreas(weakRes.data.data || weakRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <button onClick={fetchAnalytics} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">No analytics data available yet. Start practicing to see your stats!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Analytics</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Submissions</p>
            <p className="text-3xl font-bold text-green-600">{stats.totalSubmissions || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Problems Solved</p>
            <p className="text-3xl font-bold text-blue-600">{stats.passedSubmissions || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Accuracy</p>
            <p className="text-3xl font-bold text-purple-600">{stats.accuracy || 0}%</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Points</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.totalPoints || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">🔥 Streak</h2>
            <div className="flex items-center space-x-8">
              <div className="text-center">
                <p className="text-4xl font-bold text-orange-500">{stats.currentStreak || 0}</p>
                <p className="text-sm text-gray-600 mt-1">Current Streak</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-600">{stats.longestStreak || 0}</p>
                <p className="text-sm text-gray-600 mt-1">Longest Streak</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">📊 Weak Areas</h2>
            {weakAreas.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No weak areas identified yet. Keep practicing!</p>
            ) : (
              <div className="space-y-2">
                {weakAreas.map((area, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="font-medium text-gray-800">{area.topic || area.name}</span>
                    <span className="text-sm text-red-700 font-medium">{area.failedCount || area.count} failures</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;