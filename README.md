# eve: an output-schema turn fails on the first prose step

Minimal reproduction for an eve bug: with `outputSchema`, if the model's step ends in text instead of a call to the reply tool, the turn fails right away with `OUTPUT_SCHEMA_NOT_FULFILLED`. eve doesn't ask the model again.

The agent uses `mockModel` from `eve/evals`, so it needs no API key. The model's first step in a turn is always prose. Asked again in the same turn, it calls `eve__reply`.

## Run

```bash
npm install
npm exec -- eve dev --no-ui     # in one terminal
npx tsx scripts/repro.ts        # in another
```

## Output (eve 1.0.0-rc.5)

```text
turn 1: model calls=1
  turn.settled {"error":{"code":"OUTPUT_SCHEMA_NOT_FULFILLED","message":"The agent could not produce a result matching the requested schema."},"outcome":"failed","reply":["run_0.0"],"turnId":"turn_0"}
  result.data undefined
turn 2 (asked again by hand): model calls=1
  turn.settled {"outcome":"completed","reply":["run_1.result"],"turnId":"turn_1"}
  result.data {"title":"Done","count":1}
```

Turn 1 makes one model call and fails. Turn 2 shows the model hands in the result as soon as it's asked again.
