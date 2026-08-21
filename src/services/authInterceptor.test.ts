import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
} from "vitest";

import { api } from "./api";
import { useAuthStore } from "../store/authStore";
import { refreshAccessToken } from "./refreshApi";

vi.mock("./refreshApi", () => ({
  refreshAccessToken: vi.fn(),
}));

describe("Auth Interceptor", () => {
  beforeEach(() => {
    localStorage.clear();

    useAuthStore.setState({
      accessToken: "old-access-token",
    });

    vi.clearAllMocks();

    api.defaults.validateStatus = (status) =>
      status >= 200 && status < 300;
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

    let requestCount = 0;

    api.defaults.adapter = async (config) => {
      requestCount++;

      if (requestCount === 1) {
        return Promise.reject({
          config,
          response: {
            status: 401,
            data: {},
            headers: {},
          },
        });
      }

      return {
        data: {
          id: 1,
          username: "muskan",
        },
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      };
    };

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

    expect(requestCount).toBe(2);
  });

  it("rejects 401 when refresh token is missing", async () => {
    localStorage.removeItem("refreshToken");

    api.defaults.adapter = async (config) => {
      return Promise.reject({
        config,
        response: {
          status: 401,
          data: {},
          headers: {},
        },
      });
    };

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

    api.defaults.adapter = async (config) => {
      return Promise.reject({
        config,
        response: {
          status: 401,
          data: {},
          headers: {},
        },
      });
    };

    await expect(
      api.get("/auth/me")
    ).rejects.toThrow("Refresh failed");

    expect(logout).toHaveBeenCalled();
  });
});