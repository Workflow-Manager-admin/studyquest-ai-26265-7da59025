//
// Quiz Service - In-memory Session-based MCQ Quiz Management
//

/**
 * Simple in-memory session store.
 * Maps sessionId to current quiz state: { questions: [...], answers: {}, cursor, completed }
 * For production, use Redis or DB.
 */
const quizSessions = new Map();
const crypto = require('crypto');

function createSessionId() {
  return crypto.randomBytes(16).toString('hex');
}

// PUBLIC_INTERFACE
exports.startQuiz = function (questions) {
  /**
   * Starts new quiz session with the given questions.
   * Returns { sessionId, firstQuestion }
   */
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('No questions provided for quiz session');
  }
  const sessionId = createSessionId();
  quizSessions.set(sessionId, {
    questions,
    answers: {},
    cursor: 0,
    completed: false,
    startedAt: new Date()
  });
  // Don't send answer in response
  const firstQuestion = sanitizeQuestion(questions[0]);
  return { sessionId, question: firstQuestion, questionIndex: 0, total: questions.length };
};

// PUBLIC_INTERFACE
exports.getCurrentQuestion = function (sessionId) {
  /**
   * Retrieves current quiz question for session.
   * Throws error if session is missing, completed, or out of range.
   */
  const session = quizSessions.get(sessionId);
  if (!session) throw new Error('Invalid or expired session');
  if (session.completed) throw new Error('Quiz session has already completed');
  const idx = session.cursor;
  if (idx >= session.questions.length) throw new Error('No more questions remaining');
  return {
    question: sanitizeQuestion(session.questions[idx]),
    questionIndex: idx,
    total: session.questions.length
  };
};

// PUBLIC_INTERFACE
exports.answerCurrentQuestion = function (sessionId, choice) {
  /**
   * Accepts answer for current question, evaluates, advances cursor.
   * Returns feedback { correct, correctAnswer, explanation, nextQuestion?/results? }
   */
  const session = quizSessions.get(sessionId);
  if (!session) throw new Error('Invalid or expired session');
  if (session.completed) throw new Error('Quiz session already completed');
  const idx = session.cursor;
  if (idx >= session.questions.length) throw new Error('No more questions in quiz');
  const question = session.questions[idx];
  // Accept answer and evaluate
  const isCorrect = typeof choice === 'string' && choice.trim() === question.answer;

  session.answers[idx] = {
    submitted: choice,
    correctAnswer: question.answer,
    status: isCorrect ? 'correct' : 'incorrect'
  };

  // Move cursor, check if last question
  let next = null, finished = false;
  if (idx + 1 < session.questions.length) {
    session.cursor++;
    next = sanitizeQuestion(session.questions[session.cursor]);
  } else {
    session.completed = true;
    finished = true;
  }

  return {
    correct: isCorrect,
    correctAnswer: question.answer,
    questionIndex: idx,
    total: session.questions.length,
    isLast: finished,
    nextQuestion: finished ? null : next,
    score: finished ? this.getQuizResults(sessionId) : undefined
  };
};

// PUBLIC_INTERFACE
exports.getQuizResults = function (sessionId) {
  /**
   * Returns quiz result summary: { total, correct, incorrect, answers: [...] }
   */
  const session = quizSessions.get(sessionId);
  if (!session) throw new Error('Invalid or expired session');
  const total = session.questions.length;
  let correct = 0, incorrect = 0;
  for (const ans of Object.values(session.answers)) {
    if (ans.status === 'correct') correct++;
    else incorrect++;
  }
  return {
    total,
    correct,
    incorrect,
    answers: Object.entries(session.answers).map(([i, ans]) => ({
      questionIndex: Number(i),
      ...ans
    }))
  };
};

/**
 * Utility to remove correct answer from question before sending to client.
 */
function sanitizeQuestion(q) {
  const { answer, ...rest } = q;
  return { ...rest };
}

exports._quizSessions = quizSessions; // (for debugging/tests only)
