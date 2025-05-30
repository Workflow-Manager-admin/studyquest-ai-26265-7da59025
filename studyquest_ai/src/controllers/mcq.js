const mcqService = require('../services/mcq');

// PUBLIC_INTERFACE
exports.generate = async function (req, res) {
  /**
   * Controller endpoint for POST /generate-mcqs.
   * Expects: { text: string, maxQuestions?: number, language?: string }
   * Returns: { status, questions: [...], info }
   */
  try {
    const { text, maxQuestions, language } = req.body;
    if (!text) {
      return res.status(400).json({ status: 'fail', message: 'No text supplied for MCQ generation' });
    }
    const questions = await mcqService.generateMCQsFromText(text, { maxQuestions, language });
    return res.status(200).json({
      status: 'success',
      count: questions.length,
      questions
    });
  } catch (err) {
    return res
      .status(500)
      .json({ status: 'error', message: err.message || 'Failed to generate MCQs' });
  }
};
