import { useState, useEffect } from 'react';
import { subjectsAPI } from '../lib/api';
import toast from 'react-hot-toast';

const Learn = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await subjectsAPI.list();
      setSubjects(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load subjects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async (subject) => {
    setLoading(true);
    try {
      const { data } = await subjectsAPI.quiz(subject, 5);
      setQuestions(data.data || []);
      setSelectedSubject(subject);
      setCurrentQuestion(0);
      setScore(0);
      setShowResult(false);
      toast.success(`Starting ${subject} quiz!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (index) => {
    setSelectedAnswer(index);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null) return;

    if (selectedAnswer === questions[currentQuestion].correctIndex) {
      setScore(score + 1);
    }
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
      toast.success(`Quiz complete! Score: ${score + (selectedAnswer === questions[currentQuestion].correctIndex ? 1 : 0)}/${questions.length}`);
    }
  };

  if (loading && !selectedSubject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Loading subjects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <button onClick={fetchSubjects} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Learn & Practice</h1>

        {!selectedSubject ? (
          <>
            {subjects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No subjects available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {subjects.map((subject) => (
                  <div
                    key={subject.name || subject}
                    onClick={() => startQuiz(subject.name || subject)}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-indigo-300 hover:shadow-md cursor-pointer transition-all"
                  >
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">{subject.name || subject}</h3>
                    <p className="text-gray-600 text-sm mb-4">{subject.questionCount || 0} questions</p>
                    <button className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition">
                      Start Quiz
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="max-w-3xl mx-auto">
            {!showResult ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedSubject}</h2>
                    <p className="text-sm text-gray-500 mt-1">Quiz</p>
                  </div>
                  <span className="text-sm font-medium text-gray-500">
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : questions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No questions available for this subject.</p>
                ) : (
                  questions[currentQuestion] && (
                    <div>
                      <p className="text-lg font-medium text-gray-900 mb-6">
                        {questions[currentQuestion].question}
                      </p>
                      <div className="space-y-3">
                        {questions[currentQuestion].options.map((option, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleAnswer(idx)}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                              selectedAnswer === idx
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <span className="text-sm font-medium">
                              {String.fromCharCode(65 + idx)}. {option}
                            </span>
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={submitAnswer}
                        disabled={selectedAnswer === null}
                        className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {currentQuestion + 1 < questions.length ? 'Next Question' : 'Submit Quiz'}
                      </button>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
                <p className="text-xl text-gray-600 mb-2">
                  Your Score: <span className="font-bold text-indigo-600">{score}/{questions.length}</span>
                </p>
                <p className="text-lg text-gray-500 mb-6">
                  {Math.round((score / questions.length) * 100)}% correct
                </p>
                <button
                  onClick={() => setSelectedSubject(null)}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition"
                >
                  Back to Subjects
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Learn;