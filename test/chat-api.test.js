import test from "node:test";
import assert from "node:assert/strict";

import {
  ChatRequestError,
  answerPortfolioQuestion,
  validateChatPayload,
} from "../api/chat.js";

test("validates and trims a chat payload", () => {
  const result = validateChatPayload({
    message: "  What are Arslan's AI skills?  ",
    history: [
      { role: "user", content: "Previous question" },
      { role: "assistant", content: "Previous answer" },
    ],
  });

  assert.equal(result.message, "What are Arslan's AI skills?");
  assert.equal(result.history.length, 2);
});

test("rejects empty questions", () => {
  assert.throws(
    () => validateChatPayload({ message: "   " }),
    (error) => error instanceof ChatRequestError && error.message === "Please enter a question.",
  );
});

test("rejects oversized questions", () => {
  assert.throws(
    () => validateChatPayload({ message: "a".repeat(601) }),
    (error) => error instanceof ChatRequestError && error.message.includes("600 characters"),
  );
});

test("keeps only the six most recent history items", () => {
  const history = Array.from({ length: 9 }, (_, index) => ({ role: "user", content: `Question ${index}` }));
  const result = validateChatPayload({ message: "Current question", history });

  assert.equal(result.history.length, 6);
  assert.equal(result.history[0].content, "Question 3");
});

test("grounds the model request with retrieved context", async () => {
  let capturedRequest;
  const client = {
    responses: {
      create: async (request) => {
        capturedRequest = request;
        return { output_text: "Arslan completed an AI Engineer internship at Techohub Systems." };
      },
    },
  };

  const result = await answerPortfolioQuestion({
    message: "What did Arslan do at Techohub?",
    client,
    model: "test-model",
  });

  assert.equal(capturedRequest.model, "test-model");
  assert.equal(capturedRequest.store, false);
  assert.match(capturedRequest.input[0].content, /AI Engineer internship at Techohub Systems/);
  assert.equal(capturedRequest.input.at(-1).content, "What did Arslan do at Techohub?");
  assert.equal(result.sources[0].title, "AI Engineer internship at Techohub Systems");
});
