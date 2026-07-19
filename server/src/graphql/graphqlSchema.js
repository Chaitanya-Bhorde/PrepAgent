const { ApolloServer } = require('@apollo/server');
const Problem = require('../models/Problem');
const UserPerformance = require('../models/UserPerformance');
const InterviewSession = require('../models/InterviewSession');
const Submission = require('../models/Submission');
const { executeCode } = require('../services/sandboxService');
const { processInterviewTurn } = require('../services/ai/interviewerService');

const typeDefs = `#graphql
  type Example {
    input: String
    output: String
    explanation: String
  }

  type StarterTemplate {
    language: String
    code: String
  }

  type Problem {
    id: ID!
    title: String!
    description: String!
    difficulty: String!
    category: String!
    examples: [Example]
    constraints: [String]
    starterTemplates: [StarterTemplate]
    acceptance: Float
    frequency: Int
  }

  type CodingStats {
    totalSubmissions: Int
    successfulSubmissions: Int
    totalProblemsSolved: Int
    easySolved: Int
    mediumSolved: Int
    hardSolved: Int
    languagesUsed: [String]
    currentStreak: Int
  }

  type UserStats {
    id: ID!
    userId: String!
    totalDaysActive: Int
    codingStats: CodingStats
  }

  type ChatMessage {
    role: String!
    content: String!
    sender: String
    timestamp: String
  }

  type InterviewSession {
    id: ID!
    userId: String!
    questionId: String!
    status: String!
    chatHistory: [ChatMessage]
    currentCode: String
    currentLanguage: String
  }

  type SubmissionResult {
    success: Boolean!
    output: String
    error: String
    exitCode: Int
    executionTime: Int
  }

  type ChatResponse {
    response: String!
    sender: String!
    suggestions: [String]
    sessionId: ID!
  }

  type Query {
    getProblems(difficulty: String, category: String): [Problem]
    getProblem(id: ID!): Problem
    getUserStats(userId: String!): UserStats
    getInterviewSession(sessionId: ID!): InterviewSession
  }

  type Mutation {
    submitCode(userId: String!, problemId: String!, code: String!, language: String!): SubmissionResult
    sendChatMessage(sessionId: ID!, message: String!, code: String, language: String): ChatResponse
  }
`;

const resolvers = {
  Query: {
    getProblems: async (_, { difficulty, category }) => {
      let query = {};
      if (difficulty) query.difficulty = difficulty.toLowerCase();
      if (category) query.category = new RegExp(category, 'i');
      return await Problem.find(query);
    },
    getProblem: async (_, { id }) => {
      return await Problem.findById(id);
    },
    getUserStats: async (_, { userId }) => {
      return await UserPerformance.findOne({ userId });
    },
    getInterviewSession: async (_, { sessionId }) => {
      return await InterviewSession.findById(sessionId);
    }
  },
  Mutation: {
    submitCode: async (_, { userId, problemId, code, language }) => {
      try {
        const result = await executeCode(code, language);
        
        // Log submission record in DB
        await Submission.create({
          userId,
          problemId,
          code,
          language,
          status: result.success ? 'ACCEPTED' : 'COMPILE_ERROR',
          executionTime: result.executionTime,
          output: result.output,
          error: result.error
        });

        return {
          success: result.success,
          output: result.output,
          error: result.error,
          exitCode: result.exitCode,
          executionTime: result.executionTime
        };
      } catch (err) {
        return {
          success: false,
          error: err.message,
          exitCode: -1,
          executionTime: 0
        };
      }
    },
    sendChatMessage: async (_, { sessionId, message, code, language }) => {
      const session = await InterviewSession.findById(sessionId);
      if (!session) {
        throw new Error('Interview session not found');
      }

      if (code !== undefined) session.currentCode = code;
      if (language !== undefined) session.currentLanguage = language;
      await session.save();

      const turn = await processInterviewTurn(sessionId, message);
      return {
        response: turn.response,
        sender: turn.sender,
        suggestions: turn.suggestions,
        sessionId: turn.sessionId
      };
    }
  }
};

const createGraphQLServer = () => {
  return new ApolloServer({
    typeDefs,
    resolvers,
  });
};

module.exports = { createGraphQLServer };
