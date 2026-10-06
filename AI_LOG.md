# AI Usage Log

AI was used as an assistant during this lab for project inspection, implementation, debugging, documentation, and review. This log separates AI-assisted work from checks the student reported performing.

## Important assistance and prompts

| Lab step | Prompt or request summary | AI assistance and decisions |
|---|---|---|
| Project inspection | Inspect the current workspace without modifying files; report its files, runtime/framework, Hono and D1 setup, and what the API needs. | Inspected the project files and configuration. Reported that it was a Cloudflare TypeScript Worker starter, with neither Hono nor a D1 binding configured at that point. |
| First API implementation | Implement the Campus Equipment Booking API using TypeScript, Workers, Hono, and D1, with the specified routes, validation, overlap checks, status codes, and bound SQL. | Retrieved current Cloudflare D1 documentation as required by `AGENTS.md`; installed Hono; implemented the API routes and validation; added the D1 binding and initial migration; regenerated Worker types. The configured D1 ID was left as a local-development placeholder rather than creating a remote database. |
| Exam brief and rubric audit | Read `exam_brief_en.md` and `rubric_en.md`; compare each requirement with the implementation; do not edit. | Read both documents and audited the source, migration, tests, and submission files. Identified that the equipment table lacked its `id` column, the Hello World tests were stale, and submission documentation/evidence was missing. |
| Migration and test repair | Fix the equipment primary key and foreign-key setup, replace the Hello World test, preserve booking logic, and run TypeScript checks and relevant tests. | Added `id TEXT PRIMARY KEY` to equipment and retained the booking foreign key to `equipment(id)`. Replaced the old tests with a `GET /api/equipment` test. The first test attempt exposed that the Vitest D1 database had no tables, so the test now creates its own fixture schema and seed records. Both TypeScript checks passed; the final Vitest run passed 1 test. The test fixture creates its own schema; it does not apply the migration file. |
| Quality Gate audit | Read `quality_gate.md`, inspect the committed project, and report mark- or submission-impacting issues without editing. | Identified the test fixture's independence from the migration, missing README/API contract and schema summary, missing saved curl evidence, and missing `AI_LOG.md` and `QUALITY_GATE_REVIEW.md`. |
| Submission documentation | Create `README.md` and `API_CONTRACT.md` from the instructor brief and current implementation without changing API code. | Retrieved current Cloudflare D1 Wrangler command documentation, then wrote the local setup/run instructions, endpoint contract, example request/response, error codes, overlap rule, and schema relationship. |
| This documentation request | Create the AI log and Quality Gate review using actual assistance, decisions, and verification; do not invent evidence. | Recorded the assistance above and distinguished tool-run checks from the HTTP status results reported by the student. |

## Verification record

### Checks run by AI in the project workspace

- `npx tsc --noEmit` — passed.
- `npx tsc --noEmit -p test/tsconfig.json` — passed.
- `npm test -- --run` — passed: 1 test file and 1 test. This test checks `GET /api/equipment` against test fixture records.

### HTTP checks reported by the student

The student reported completing API testing and supplied these results:

| Request case | Reported status |
|---|---:|
| GET `/equipment` | 200 |
| POST `/bookings` | 201 |
| GET `/bookings/:id` | 200 |
| PATCH `/bookings/:id` | 200 |
| Invalid time | 400 |
| Overlapping booking | 409 |
| Missing booking | 404 |
| DELETE `/bookings/:id` | 204 |

These HTTP outcomes are recorded as student-reported results; no curl transcript or separate HTTP evidence file was provided to the AI in this interaction.
