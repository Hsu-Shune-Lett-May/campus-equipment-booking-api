import { env, SELF } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";

describe("Campus Equipment Booking API", () => {
	beforeAll(async () => {
		await env.DB
			.prepare("CREATE TABLE IF NOT EXISTS equipment (id TEXT PRIMARY KEY, name TEXT NOT NULL, location TEXT NOT NULL)")
			.run();
		await env.DB
			.prepare(
				"CREATE TABLE IF NOT EXISTS bookings (id TEXT PRIMARY KEY, equipmentId TEXT NOT NULL, borrowerName TEXT NOT NULL, startAt TEXT NOT NULL, endAt TEXT NOT NULL, purpose TEXT NOT NULL, FOREIGN KEY (equipmentId) REFERENCES equipment(id) ON DELETE RESTRICT)",
			)
			.run();
		await env.DB
			.prepare("INSERT OR IGNORE INTO equipment (id, name, location) VALUES ('eq-1', 'Projector A', 'Building 1'), ('eq-2', 'Camera A', 'Building 2')")
			.run();
	});

	it("returns the seeded equipment records", async () => {
		const response = await SELF.fetch("https://example.com/api/equipment");

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual([
			{ id: "eq-1", name: "Projector A", location: "Building 1" },
			{ id: "eq-2", name: "Camera A", location: "Building 2" },
		]);
	});
});
