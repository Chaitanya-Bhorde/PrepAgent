// RAG-based company-specific question retrieval
// Uses keyword matching as vector DB is not available
// Ready for Pinecone/Weaviate integration

const COMPANY_QUESTIONS = {
  amazon: [
    {
      question: 'Design a function to find the top K frequent elements in an array.',
      topic: 'Arrays & Hashing',
      difficulty: 'medium',
      company: 'Amazon',
      frequency: 95,
    },
    {
      question: 'Implement LRU Cache with O(1) get and put operations.',
      topic: 'Design',
      difficulty: 'medium',
      company: 'Amazon',
      frequency: 90,
    },
    {
      question: 'Design Amazon\'s product recommendation system.',
      topic: 'System Design',
      difficulty: 'hard',
      company: 'Amazon',
      frequency: 85,
    },
    {
      question: 'Find the number of islands in a 2D grid.',
      topic: 'Graphs',
      difficulty: 'medium',
      company: 'Amazon',
      frequency: 88,
    },
  ],
  google: [
    {
      question: 'Design a function to serialize and deserialize a binary tree.',
      topic: 'Trees',
      difficulty: 'hard',
      company: 'Google',
      frequency: 92,
    },
    {
      question: 'Find the median of two sorted arrays.',
      topic: 'Binary Search',
      difficulty: 'hard',
      company: 'Google',
      frequency: 90,
    },
    {
      question: 'Design Google Docs real-time collaboration feature.',
      topic: 'System Design',
      difficulty: 'hard',
      company: 'Google',
      frequency: 80,
    },
  ],
  microsoft: [
    {
      question: 'Implement a function to check if a linked list has a cycle.',
      topic: 'Linked Lists',
      difficulty: 'easy',
      company: 'Microsoft',
      frequency: 85,
    },
    {
      question: 'Design a task scheduler that can handle millions of tasks.',
      topic: 'System Design',
      difficulty: 'hard',
      company: 'Microsoft',
      frequency: 75,
    },
  ],
  cognizant: [
    {
      question: 'Write a SQL query to find employees earning more than their managers.',
      topic: 'SQL',
      difficulty: 'easy',
      company: 'Cognizant',
      frequency: 90,
    },
    {
      question: 'Design a REST API for a library management system.',
      topic: 'API Design',
      difficulty: 'medium',
      company: 'Cognizant',
      frequency: 80,
    },
  ],
  tcs: [
    {
      question: 'Write a program to check if a string is a palindrome.',
      topic: 'Strings',
      difficulty: 'easy',
      company: 'TCS',
      frequency: 95,
    },
    {
      question: 'Design a database schema for an employee management system.',
      topic: 'Database Design',
      difficulty: 'medium',
      company: 'TCS',
      frequency: 85,
    },
  ],
};

const getCompanyQuestions = (company, topic) => {
  const companyData = COMPANY_QUESTIONS[company.toLowerCase()] || [];
  if (topic) {
    return companyData.filter(q => q.topic.toLowerCase() === topic.toLowerCase());
  }
  return companyData;
};

const getRecommendedQuestions = (weakTopics, targetCompany) => {
  const recommendations = [];
  
  // Get company-specific questions
  if (targetCompany) {
    const companyQs = getCompanyQuestions(targetCompany);
    recommendations.push(...companyQs);
  }

  // Get questions for weak topics
  if (weakTopics && weakTopics.length > 0) {
    for (const company of Object.values(COMPANY_QUESTIONS)) {
      for (const q of company) {
        if (weakTopics.some(t => q.topic.toLowerCase().includes(t.toLowerCase()))) {
          recommendations.push(q);
        }
      }
    }
  }

  // Sort by frequency (most asked first)
  return recommendations
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10);
};

module.exports = { getCompanyQuestions, getRecommendedQuestions, COMPANY_QUESTIONS };