const quizService = require('../services/quiz');

// PUBLIC_INTERFACE
exports.startQuizSession = async function (req, res) {
  /**
   * POST /quiz/start
   * Body: { questions: [{question, choices, answer}, ...] }
   * Starts session, returns first question (without answer).
   */
  try {
    const { questions } = req.body;
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ status: 'fail', message: 'No MCQs supplied to start quiz' });
    }
    const { sessionId, question, questionIndex, total } = quizService.startQuiz(questions);
    res.status(201).json({
      status: 'success',
      sessionId,
      question,
      questionIndex,
      total
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message || 'Failed to start quiz session' });
  }
};

// PUBLIC_INTERFACE
exports.getCurrentQuestion = async function (req, res) {
  /**
   * GET /quiz/:sessionId/question
   * Returns current unanswered question for quiz session.
   */
  try {
    const { sessionId } = req.params;
    const q = quizService.getCurrentQuestion(sessionId);
    res.status(200).json({ status: 'success', ...q });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// PUBLIC_INTERFACE
exports.answerCurrentQuestion = async function (req, res) {
  /**
   * POST /quiz/:sessionId/answer
   * Body: { choice: string }
   * Accepts answer, returns { correct, nextQuestion?/results? }
   */
  try {
    const { sessionId } = req.params;
    const { choice } = req.body;
    if (typeof choice !== 'string' || !choice) {
      return res.status(400).json({ status: 'fail', message: 'Missing or invalid answer choice' });
    }
    const feedback = quizService.answerCurrentQuestion(sessionId, choice);
    res.status(200).json({ status: 'success', ...feedback });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// PUBLIC_INTERFACE
exports.getQuizResults = async function (req, res) {
  /**
   * GET /quiz/:sessionId/results
   * Returns quiz result summary
   */
  try {
    const { sessionId } = req.params;
    const results = quizService.getQuizResults(sessionId);
    res.status(200).json({ status: 'success', results });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
