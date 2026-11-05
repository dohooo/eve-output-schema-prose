import { defineAgent } from "eve";
import { mockModel } from "eve/evals";

// A stand-in for a real model that sometimes ends a turn in prose instead of
// calling the reply tool. Its first step in a turn is always prose. If eve
// asks again in the same turn (a new message or a tool result), it calls the
// reply tool, as a real model does once it is told.
export default defineAgent({
  model: mockModel({
    modelId: "prose-first",
    provider: "repro",
    respond: ({ toolResults, userMessageCount }) =>
      userMessageCount > 1 || toolResults.length > 0
        ? { toolCalls: [{ name: "eve__reply", input: { title: "Done", count: 1 } }] }
        : "Done. I opened the pull request and I'm watching CI.",
  }),
});
