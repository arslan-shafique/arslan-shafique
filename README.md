# Arslan Shafique - Portfolio

A responsive single-page portfolio with a retrieval-augmented AI assistant. The public interface is
plain HTML, CSS, and JavaScript; a small Vercel serverless function keeps the Gemini API key private.

## Chatbot architecture

```text
Visitor question
      |
      v
Browser widget (assets/js/main.js)
      |
      v  POST /api/chat
Security and input validation
      |
      v
Local portfolio retrieval (api/lib/retrieval.js)
      |
      v  top matching knowledge chunks
Gemini Generate Content API (server-side only)
      |
      v
Grounded answer + links to relevant portfolio sections
```

This is lightweight RAG: retrieval is local and deterministic, while the model is responsible only
for composing a concise answer from the retrieved facts. No embeddings database is needed for this
small knowledge base.

## Project structure

```text
index.html                         portfolio page and chatbot markup
assets/css/styles.css              site and chatbot styling
assets/js/main.js                  site behaviour and chatbot client
assets/docs/                       resume and verified experience letters
api/chat.js                        secure Vercel chat endpoint
api/lib/portfolio-knowledge.js     curated portfolio knowledge chunks
api/lib/retrieval.js               tokenisation, aliases, ranking, and fallback
scripts/dev-server.js              lightweight local static/API server
test/                              retrieval and API unit tests
.env.example                       safe environment-variable template
```

## Local setup

Requirements: Node.js 22 or newer and a Gemini API key.

1. Install dependencies:

   ```powershell
   npm.cmd install
   ```

2. Create your private local environment file:

   ```powershell
   Copy-Item .env.example .env.local
   notepad .env.local
   ```

3. Replace `your_gemini_api_key_here` with your Gemini API key. Never paste the key into browser
   code, commit it, or share it in chat. Google's Gemini documentation explains secure API-key
   setup: <https://ai.google.dev/gemini-api/docs/api-key>.

4. Start the local site:

   ```powershell
   npm.cmd run dev
   ```

5. Open <http://127.0.0.1:3000> and click **Ask my AI**.

## Testing

Run all unit tests:

```powershell
npm.cmd test
```

The tests verify retrieval ranking, CV/resume aliases, fallback behaviour, request validation,
history limits, and that retrieved context is passed to the model. The model client is mocked, so
tests do not spend API credits.

## Updating chatbot knowledge

Edit `api/lib/portfolio-knowledge.js` whenever the visible portfolio changes. Keep each chunk focused
on one role, project, skill group, or contact topic. Add likely search terms to `keywords`, then add a
test for the new information in `test/retrieval.test.js`.

Good chunks are:

- factual and consistent with the public site;
- short enough to retrieve independently;
- explicit about dates, technologies, and verification links;
- free of private information that should not be sent to an API.

## Security and cost controls

- `GEMINI_API_KEY` is read only inside `api/chat.js`.
- `.env` and `.env.local` are ignored by Git.
- Requests must be same-origin JSON `POST` requests.
- Questions are limited to 600 characters and six recent history items.
- A best-effort per-instance rate limit allows 15 requests per 10 minutes.
- The model receives only the top four retrieved chunks.
- Gemini responses are limited to 450 output tokens.
- Model output is inserted with `textContent`, not HTML.

For production, restrict the key to the Gemini API, set billing alerts, and keep secrets in environment
variables or a secret manager. See Google's Gemini API-key guidance:
<https://ai.google.dev/gemini-api/docs/api-key>.

## Vercel deployment

The GitHub repository is already connected to Vercel. Before merging the chatbot branch:

1. Open the Vercel project.
2. Go to **Settings -> Environment Variables**.
3. Add `GEMINI_API_KEY` for Production and Preview.
4. Optionally add `GEMINI_MODEL`; the default is `gemini-3.5-flash`.
5. Redeploy or merge the branch into the production branch.

Do not prefix the key with `VITE_`, `NEXT_PUBLIC_`, or any other client-visible prefix.

## Editing portfolio content

The visible content is in `index.html`. Project categories use `data-cat="ai"`, `data-cat="iot"`, or
`data-cat="web"`. Theme colours are CSS custom properties near the top of
`assets/css/styles.css`. Images and PDFs live under `assets/`.
