jest.mock("../../modules/sessions/sessionService", () => ({
	findValidSession: jest.fn(),
}));

import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { app } from "../app";
import { findValidSession } from "../../modules/sessions/sessionService";

const findValidSessionMock = findValidSession as jest.MockedFunction<
	typeof findValidSession
>;

describe("server app", () => {
	let server: Server;
	let baseUrl: string;

	beforeAll(async () => {
		server = createServer(app.callback());

		await new Promise<void>((resolve) => {
			server.listen(0, () => resolve());
		});

		const address = server.address() as AddressInfo;
		baseUrl = `http://127.0.0.1:${address.port}`;
	});

	afterAll(async () => {
		await new Promise<void>((resolve, reject) => {
			server.close((error) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
	});

	it("returns GraphQL data when no session cookie is present", async () => {
		findValidSessionMock.mockResolvedValue(null);

		const response = await fetch(`${baseUrl}/graphql`, {
			method: "POST",
			headers: {
				accept: "application/json",
				"content-type": "application/json",
			},
			body: JSON.stringify({
				query: "{ me { id } }",
			}),
		});

		const responseText = await response.text();

		expect(response.status).toBe(200);
		expect(JSON.parse(responseText)).toEqual({
			data: {
				me: null,
			},
		});
		expect(findValidSessionMock).not.toHaveBeenCalled();
	});

	it("serves Apollo Sandbox when opening GET /graphql in the browser", async () => {
		const response = await fetch(`${baseUrl}/graphql`, {
			method: "GET",
			headers: {
				accept: "text/html",
			},
		});

		const responseText = await response.text();

		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toContain("text/html");
		expect(responseText).toContain("Apollo Sandbox");
		expect(responseText).toContain("new window.EmbeddedSandbox");
	});
});