# studyquest-ai-26265-7da59025

## Getting Started

1. **Clone the repository and install dependencies**
   ```
   npm install
   ```

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env`, then edit `.env` to set your API keys and configuration:
     ```
     cp studyquest_ai/.env.example studyquest_ai/.env
     ```
   - Set your `OPENAI_API_KEY` in the new `.env` file for MCQ generation.

3. **Run the development server**
   ```
   cd studyquest_ai
   npm run dev
   ```

4. **API Documentation**
   - Visit http://localhost:3000/docs (or your configured HOST/PORT) for Swagger API docs after starting the server.

## Environment Variables

Edit `studyquest_ai/.env` to configure these:

- `PORT`  
- `HOST`
- `NODE_ENV`
- `OPENAI_API_KEY`
- `OPENAI_ENDPOINT`
- `OPENAI_MODEL`
- `MCQ_MAX_QUESTIONS`

Other third-party API keys may be added as needed by expanding `.env.example`.
