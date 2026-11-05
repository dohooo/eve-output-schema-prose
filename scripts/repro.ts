import { Client } from "eve/client";

const baseUrl = process.argv[2] ?? "http://127.0.0.1:2000";

const outputSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    count: { type: "integer" },
  },
  required: ["title", "count"],
} as const;

type Summary = { title: string; count: number };

const report = async (label: string, delivery: { stream(): AsyncIterable<{ type: string; data?: unknown }>; result(): Promise<{ data?: Summary }> }) => {
  let modelCalls = 0;
  let settled: unknown;
  for await (const event of delivery.stream()) {
    if (event.type === "model.started") modelCalls += 1;
    if (event.type === "turn.settled") settled = event.data;
  }
  const result = await delivery.result();
  console.log(`${label}: model calls=${modelCalls}`);
  console.log(`  turn.settled ${JSON.stringify(settled)}`);
  console.log(`  result.data ${JSON.stringify(result.data)}`);
};

const client = new Client({ baseUrl });

// 1. One turn with an output schema. The model's first step is prose.
const { session, delivery } = await client.sessions.create<Summary>({
  message: "Summarize this turn.",
  outputSchema,
});
await report("turn 1", delivery);

// 2. Asking again in the same session works: the model calls the reply tool.
const again = await session.send<Summary>("Hand in the result with the reply tool.", { outputSchema });
await report("turn 2 (asked again by hand)", again);
