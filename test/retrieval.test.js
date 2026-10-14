import test from "node:test";
import assert from "node:assert/strict";

import { formatRetrievedContext, retrievePortfolioContext, tokenize } from "../api/lib/retrieval.js";

test("tokenize normalizes accents and removes filler words", () => {
  assert.deepEqual(tokenize("Where is the résumé for Arslan?"), ["resume", "arslan"]);
});

test("retrieves Techohub experience for an internship question", () => {
  const [first] = retrievePortfolioContext("What did Arslan do during his Techohub internship?");
  assert.equal(first.id, "experience-techohub");
});

test("retrieves the BCG project for financial chatbot questions", () => {
  const [first] = retrievePortfolioContext("Tell me about the BCG SEC 10-K financial chatbot");
  assert.equal(first.id, "project-financial-chatbot");
});

test("retrieves the Pylint contribution for open-source linter questions", () => {
  const [first] = retrievePortfolioContext("What open-source work did Arslan do for Pylint?");
  assert.equal(first.id, "open-source-pylint");
});

test("retrieves the Oppia contribution for coverage questions", () => {
  const [first] = retrievePortfolioContext("Tell me about Arslan's Oppia branch coverage contribution");
  assert.equal(first.id, "open-source-oppia");
});

test("understands CV as an alias for resume", () => {
  const [first] = retrievePortfolioContext("Where can I download his CV?");
  assert.equal(first.id, "contact-resume");
});

test("falls back to overview and contact for unrelated questions", () => {
  const results = retrievePortfolioContext("weather forecast tokyo tomorrow");
  assert.deepEqual(results.map((item) => item.id), ["profile-overview", "contact-resume"]);
});

test("formats retrieved chunks for grounding", () => {
  const chunks = retrievePortfolioContext("education", 1);
  const context = formatRetrievedContext(chunks);
  assert.match(context, /^\[1\] Education \(About\)/);
  assert.match(context, /University of Central Punjab/);
});
