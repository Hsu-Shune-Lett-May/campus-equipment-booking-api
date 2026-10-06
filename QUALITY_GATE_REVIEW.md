# Quality Gate Review

This review records the findings from the Quality Gate comparison and the improvements made afterward.

| Quality Gate area | Finding | Action taken | Evidence |
|---|---|---|---|
| Reliability / Accuracy | The equipment table was missing its `id` column even though seed data and the bookings foreign key use `equipment(id)`. | Added `id TEXT PRIMARY KEY` to `equipment`; kept `bookings.equipmentId` as a foreign key to `equipment(id)`. | The current migration declares both the primary key and foreign key in `migrations/0001_create_equipment_and_bookings.sql`. The student reported `GET /equipment` returning 200 with the seeded records. |
| Reliability / Testing | The starter tests expected the old Hello World response and did not exercise the API. | Replaced them with an API test for the seeded equipment list. The test initializes its D1 fixture before calling the endpoint. | `npx tsc --noEmit` and `npx tsc --noEmit -p test/tsconfig.json` passed; `npm test -- --run` passed with 1 test. The test uses a fixture schema, so it does not itself verify that the migration applies. |
| Delivery Quality | The project had no run instructions, API contract, or human-readable schema relationship description. | Added `README.md` and `API_CONTRACT.md` with setup, local D1 migration, run/test commands, endpoints, payloads, statuses, overlap rule, and the equipment-to-bookings relationship. | Both files are present in the project. Their commands and contract details were checked against the current Wrangler configuration and API implementation. |
| You Own It | Important AI assistance and the source of verification results were not documented, making it difficult to distinguish AI work from student verification. | Added `AI_LOG.md` that lists the actual assistance and decisions, separates AI-run TypeScript/Vitest checks from student-reported HTTP checks, and notes the test fixture limitation. | The log records the two TypeScript checks, the one passing Vitest test, and the HTTP statuses supplied by the student. The student reported: GET 200, POST 201, GET by ID 200, PATCH 200, invalid time 400, overlap 409, missing booking 404, and DELETE 204. |
| Reasoning | The overlap behavior and update-specific self-exclusion should be easy to explain during an ownership check. | Documented the strict overlap rule, allowed touching boundaries, different-equipment behavior, and exclusion of the current booking during PATCH in `API_CONTRACT.md`. | The documented behavior matches the overlap query in `src/index.ts`; the student reported an overlapping booking returning 409 and a successful PATCH returning 200. |

## Verification source

The TypeScript and Vitest results above were run by AI in the workspace. The HTTP status results were supplied by the student after completing API testing; no raw curl output was provided in this interaction.
