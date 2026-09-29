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
