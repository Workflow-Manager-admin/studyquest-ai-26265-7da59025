const express = require('express');
const healthController = require('../controllers/health');
const uploadController = require('../controllers/upload');
const mcqController = require('../controllers/mcq');
const upload = require('../middleware/upload');
const quizController = require('../controllers/quiz');

const router = express.Router();
// Health endpoint

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health endpoint
 *     responses:
 *       200:
 *         description: Service health check passed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Service is healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 */
router.get('/', healthController.check.bind(healthController));

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload a PDF or DOCX file
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 file:
 *                   type: object
 *                   properties:
 *                     filename:
 *                       type: string
 *                     originalName:
 *                       type: string
 *                     size:
 *                       type: integer
 *                     mimetype:
 *                       type: string
 *                     path:
 *                       type: string
 *                     uploadTime:
 *                       type: string
 *       400:
 *         description: Failed validation or missing file
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 */

// POST /upload (PDF/DOCX only)
router.post('/upload', upload.single('file'), uploadController.uploadFile);

/**
 * @swagger
 * /generate-mcqs:
 *   post:
 *     summary: Generate MCQs from extracted text
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: The extracted plain text from a study material
 *               maxQuestions:
 *                 type: integer
 *                 description: Maximum number of MCQs to generate (default 10)
 *               language:
 *                 type: string
 *                 description: Language for MCQs (default English)
 *             required:
 *               - text
 *     responses:
 *       200:
 *         description: Array of generated MCQs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 count:
 *                   type: integer
 *                 questions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       question:
 *                         type: string
 *                       choices:
 *                         type: array
 *                         items:
 *                           type: string
 *                       answer:
 *                         type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *       500:
 *         description: API or server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /quiz/start:
 *   post:
 *     summary: Start a new quiz session
 *     description: Starts a quiz session with a list of MCQs. Returns a sessionId and the first question (without answer field).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     question:
 *                       type: string
 *                     choices:
 *                       type: array
 *                       items:
 *                         type: string
 *                     answer:
 *                       type: string
 *     responses:
 *       201:
 *         description: Quiz session started.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string }
 *                 sessionId: { type: string }
 *                 question: { type: object }
 *                 questionIndex: { type: integer }
 *                 total: { type: integer }
 *       400: { description: Validation error }
 *       500: { description: Server error }
 */
router.post('/quiz/start', quizController.startQuizSession);

/**
 * @swagger
 * /quiz/{sessionId}/question:
 *   get:
 *     summary: Get current question for session
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the quiz session
 *     responses:
 *       200:
 *         description: Current question and progress
 *       400:
 *         description: Bad session or no more questions
 */
router.get('/quiz/:sessionId/question', quizController.getCurrentQuestion);

/**
 * @swagger
 * /quiz/{sessionId}/answer:
 *   post:
 *     summary: Answer current question
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               choice:
 *                 type: string
 *     responses:
 *       200: { description: Answer feedback and optional next question/results }
 *       400: { description: Error }
 */
router.post('/quiz/:sessionId/answer', quizController.answerCurrentQuestion);

/**
 * @swagger
 * /quiz/{sessionId}/results:
 *   get:
 *     summary: Get results for quiz session
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200: { description: Result summary }
 *       400: { description: Error }
 */
router.get('/quiz/:sessionId/results', quizController.getQuizResults);

// MCQ generation endpoint
router.post('/generate-mcqs', mcqController.generate);

module.exports = router;
