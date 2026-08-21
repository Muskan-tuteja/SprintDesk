import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
} from "vitest";

import MockAdapter from "axios-mock-adapter";

import { api } from "./api";
import { useAuthStore } from "../store/authStore";
import { refreshAccessToken } from "./refreshApi";

vi.mock("./refreshApi", () => ({
  refreshAccessToken: vi.fn(),
}));

const mockAxios = new MockAdapter(api);

describe("Auth Interceptor", () => {
  beforeEach(() => {
    mockAxios.reset();

    localStorage.clear();

    useAuthStore.setState({
      accessToken: "old-access-token",
    });

    vi.clearAllMocks();
  });

  it("refreshes token and retries request after 401", async () => {
    localStorage.setItem(
      "refreshToken",
      "old-refresh-token"
    );

    vi.mocked(refreshAccessToken).mockResolvedValue({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    });

    mockAxios
      .onGet("/auth/me")
      .replyOnce(401)
      .onGet("/auth/me")
      .replyOnce(200, {
        id: 1,
        username: "muskan",
      });

    const response = await api.get("/auth/me");

    expect(response.status).toBe(200);

    expect(
      refreshAccessToken
    ).toHaveBeenCalledWith(
      "old-refresh-token"
    );

    expect(
      useAuthStore.getState().accessToken
    ).toBe("new-access-token");

    expect(
      localStorage.getItem("refreshToken")
    ).toBe("new-refresh-token");
  });

  it("rejects 401 when refresh token is missing", async () => {
    localStorage.removeItem(
      "refreshToken"
    );

    mockAxios
      .onGet("/auth/me")
      .reply(401);

    await expect(
      api.get("/auth/me")
    ).rejects.toMatchObject({
      response: {
        status: 401,
      },
    });

    expect(
      refreshAccessToken
    ).not.toHaveBeenCalled();
  });

  it("logs out when token refresh fails", async () => {
    localStorage.setItem(
      "refreshToken",
      "old-refresh-token"
    );

    const logout = vi.fn();

    useAuthStore.setState({
      accessToken: "old-access-token",
      logout,
    });

    vi.mocked(
      refreshAccessToken
    ).mockRejectedValue(
      new Error("Refresh failed")
    );

    mockAxios
      .onGet("/auth/me")
      .reply(401);

    await expect(
      api.get("/auth/me")
    ).rejects.toThrow(
      "Refresh failed"
    );

    expect(logout).toHaveBeenCalled();
  });
});