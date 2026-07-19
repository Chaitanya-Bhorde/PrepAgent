const InterviewSession = require('../models/InterviewSession');
const Problem = require('../models/Problem');
const { processInterviewTurn } = require('../services/ai/interviewerService');
const { getSystemDesignSession, processSystemDesignTurn, SYSTEM_DESIGN_TOPICS } = require('../services/ai/systemDesignInterviewerService');

// Start a new interview session (DSA, System Design, or HR)
const startSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type = 'dsa', questionId, topicId } = req.body;

    if (type === 'system-design') {
      const designSession = await getSystemDesignSession(userId, topicId);
      
      const session = await InterviewSession.create({
        userId,
        status: 'active',
        interviewerType: 'system-design',
        chatHistory: [
          {
            role: 'assistant',
            content: designSession.greeting,
            sender: 'system_design_interviewer',
            timestamp: new Date()
          }
        ],
        currentCode: '',
        currentLanguage: 'text'
      });

      return res.status(201).json({
        sessionId: session._id,
        type: 'system-design',
        topic: designSession.topic,
        greeting: designSession.greeting,
        sender: 'system_design_interviewer',
        suggestions: designSession.suggestions
      });
    }

    if (type === 'hr') {
      const greeting = "Hello, welcome to the Behavioral / HR interview round. I'm the HR Panelist. I'd like to ask you a few questions about your soft skills, problem-solving experiences, and professional alignment. Let's start with a brief introduction — can you tell me about yourself and your key achievements?";
      
      const session = await InterviewSession.create({
        userId,
        status: 'active',
        interviewerType: 'hr',
        chatHistory: [
          {
            role: 'assistant',
            content: greeting,
            sender: 'hr_interviewer',
            timestamp: new Date()
          }
        ],
        currentCode: '',
        currentLanguage: 'text'
      });

      return res.status(201).json({
        sessionId: session._id,
        type: 'hr',
        greeting,
        sender: 'hr_interviewer',
        suggestions: [
          "I'd love to introduce myself.",
          "I specialize in full-stack web applications.",
          "Let's get started, please ask the first question."
        ]
      });
    }

    // Default: DSA
    let question;
    if (questionId) {
      question = await Problem.findById(questionId);
    }
    if (!question) {
      question = await Problem.findOne();
    }

    const template = question?.starterTemplates?.find(t => t.language === 'javascript')?.code || '';

    const session = await InterviewSession.create({
      userId,
      questionId: question?._id || null,
      status: 'active',
      interviewerType: 'dsa',
      chatHistory: [],
      currentLanguage: 'javascript',
      currentCode: template
    });

    const initialTurn = await processInterviewTurn(session._id, '');

    return res.status(201).json({
      sessionId: session._id,
      type: 'dsa',
      question,
      greeting: initialTurn.response,
      sender: initialTurn.sender,
      suggestions: initialTurn.suggestions
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Fetch list of coding questions
const getQuestions = async (req, res) => {
  try {
    const questions = await Problem.find().sort({ frequency: -1 });
    return res.status(200).json(questions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Send message and get AI response
const sendMessage = async (req, res) => {
  try {
    const { sessionId, message, code, language } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Update code if sent
    if (code !== undefined) {
      session.currentCode = code;
    }
    if (language !== undefined) {
      session.currentLanguage = language;
    }

    // Save user message in history
    session.chatHistory.push({
      role: 'user',
      content: message,
      sender: 'candidate',
      timestamp: new Date()
    });
    await session.save();

    let turnResult;
    if (session.interviewerType === 'system-design') {
      // Create session payload for service helper
      const designPayload = {
        topic: SYSTEM_DESIGN_TOPICS.find(t => t.title.toLowerCase().includes(session.chatHistory[0].content.toLowerCase())) || SYSTEM_DESIGN_TOPICS[0],
        chatHistory: session.chatHistory
      };
      turnResult = await processSystemDesignTurn(designPayload, message);

      // Save AI message in history
      session.chatHistory.push({
        role: 'assistant',
        content: turnResult.response,
        sender: turnResult.sender,
        timestamp: new Date()
      });
      await session.save();
    } else {
      // DSA or HR (handled by standard processInterviewTurn)
      turnResult = await processInterviewTurn(sessionId, message);
    }
    
    return res.status(200).json({
      response: turnResult.response,
      sender: turnResult.sender,
      suggestions: turnResult.suggestions,
      sessionId: session._id
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Save code snapshot for replay
const saveSnapshot = async (req, res) => {
  try {
    const { sessionId, code } = req.body;
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Push snapshot
    session.keystrokeSnapshots.push({ code, timestamp: new Date() });
    session.currentCode = code;
    await session.save();

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// List all past sessions for user
const getSessions = async (req, res) => {
  try {
    const userId = req.user._id;
    const sessions = await InterviewSession.find({ userId })
      .populate('questionId', 'title')
      .sort({ createdAt: -1 });

    return res.status(200).json(sessions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get session details for replay
const getSessionDetails = async (req, res) => {
  try {
    const session = await InterviewSession.findById(req.params.id)
      .populate('questionId');
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    return res.status(200).json(session);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  startSession, 
  sendMessage, 
  getQuestions, 
  saveSnapshot, 
  getSessions, 
  getSessionDetails, 
  SYSTEM_DESIGN_TOPICS 
};

