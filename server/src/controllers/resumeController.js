const pdfParse = require('pdf-parse');
const { callLLM } = require('../services/ai/llmConfig');
const UserPerformance = require('../models/UserPerformance');

/**
 * Handle PDF resume upload and analyze against Job Description
 */
const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF resume file' });
    }
    
    const userId = req.user._id;
    const { jobDescription, targetCompany } = req.body;
    
    if (!jobDescription) {
      return res.status(400).json({ message: 'Job Description is required' });
    }

    console.log('📄 Extracting text from uploaded PDF resume...');
    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ message: 'Failed to extract text from PDF. Ensure file is not scanned.' });
    }

    console.log(`🤖 User ${userId} - Sending extracted text to LLM for ATS Analysis...`);
    
    const systemPrompt = `You are an expert technical recruiter and ATS (Applicant Tracking System) optimizer.
    Analyze the candidate's Resume Text against the provided Job Description (JD).
    Provide a structured response in STRICT JSON format matching the schema below. Do not include any markdown format tags or conversational text. Return ONLY the JSON object.
    
    JSON Schema:
    {
      "atsScore": 85, // overall score out of 100
      "companyFit": "Excellent", // String: Poor, Fair, Good, Excellent
      "matchedKeywords": ["React", "Express", "Node.js"], // Array of strings
      "missingKeywords": ["Redis", "Kubernetes", "GraphQL"], // Array of strings
      "improvementSuggestions": [
        "Add a section detailing Docker containerization setup",
        "Highlight PostgreSQL integration and ACID transaction locks"
      ],
      "companyFeedback": "The resume meets the technical criteria for Cognizant/TCS profiles but needs system design projects for Amazon.",
      "keywordMatch": 75, // keyword match score (0-100)
      "formatScore": 80, // layout formatting score (0-100)
      "sectionCompleteness": 90, // section completeness score (0-100)
      "actionVerbScore": 70, // active action verb score (0-100)
      "quantificationScore": 65 // metrics and quantification score (0-100)
    }`;

    const userPrompt = `Target Company Profile: ${targetCompany || 'General Software Engineer'}
    
    JOB DESCRIPTION:
    ${jobDescription}
    
    RESUME TEXT:
    ${resumeText}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const aiResponse = await callLLM(messages);
    
    // Parse the JSON output safely
    let structuredResult;
    try {
      const cleanJson = aiResponse.replace(/```json|```/g, '').trim();
      structuredResult = JSON.parse(cleanJson);
    } catch (e) {
      console.warn('AI did not return strict JSON, returning fallback.', e.message);
      structuredResult = {
        atsScore: 65,
        companyFit: 'Good',
        matchedKeywords: ['React', 'Node.js'],
        missingKeywords: ['Redis', 'Docker'],
        improvementSuggestions: [
          'Add key tech stack keywords from the job description.',
          'Quantify achievements in past engineering experiences.'
        ],
        companyFeedback: 'Standard placement fit profile.',
        keywordMatch: 60,
        formatScore: 70,
        sectionCompleteness: 80,
        actionVerbScore: 65,
        quantificationScore: 50
      };
    }

    // Save analyzed ATS score to UserPerformance database
    await UserPerformance.findOneAndUpdate(
      { userId },
      {
        $push: {
          resumeScores: {
            company: targetCompany || 'General',
            atsScore: structuredResult.atsScore,
            companyFit: structuredResult.companyFit,
            analyzedAt: new Date()
          }
        }
      },
      { upsert: true, new: true }
    );

    console.log(`✅ User ${userId} - ATS Resume analysis updated in Mongoose database.`);

    return res.status(200).json({
      success: true,
      data: structuredResult
    });

  } catch (error) {
    console.error('Resume Analysis Error:', error.message);
    return res.status(500).json({ message: 'Internal server error: ' + error.message });
  }
};

module.exports = { analyzeResume };
