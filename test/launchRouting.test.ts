import { describe, expect, it } from "vitest";
import {
  resolveLaunchRedirect,
  shouldAllowAutomaticPaywalls,
} from "../lib/launchRouting";

describe("resolveLaunchRedirect", () => {
  it("redirects fresh installs to onboarding", () => {
    expect(
      resolveLaunchRedirect({
        pathname: "/",
        hasOnboarded: false,
        isAuthenticated: false,
      })
    ).toBe("/onboarding");
  });

  it("allows onboarding to stay on onboarding before completion", () => {
    expect(
      resolveLaunchRedirect({
        pathname: "/onboarding",
        hasOnboarded: false,
        isAuthenticated: false,
      })
    ).toBeNull();
  });

  it("redirects onboarded signed-out users to sign-in", () => {
    expect(
      resolveLaunchRedirect({
        pathname: "/",
        hasOnboarded: true,
        isAuthenticated: false,
      })
    ).toBe("/sign-in");
  });

  it("redirects authenticated users away from auth screens", () => {
    expect(
      resolveLaunchRedirect({
        pathname: "/sign-in",
        hasOnboarded: true,
        isAuthenticated: true,
      })
    ).toBe("/");
  });
});

describe("shouldAllowAutomaticPaywalls", () => {
  it("keeps automatic paywalls disabled for this release", () => {
    expect(
      shouldAllowAutomaticPaywalls({
        pathname: "/",
        hasOnboarded: true,
        isAuthenticated: true,
      })
    ).toBe(false);
  });

  it("still rejects onboarding and auth routes even if the flag is enabled", () => {
    expect(
      shouldAllowAutomaticPaywalls({
        pathname: "/onboarding",
        hasOnboarded: true,
        isAuthenticated: true,
        automaticPaywallsEnabled: true,
      })
    ).toBe(false);

    expect(
      shouldAllowAutomaticPaywalls({
        pathname: "/sign-in",
        hasOnboarded: true,
        isAuthenticated: true,
        automaticPaywallsEnabled: true,
      })
    ).toBe(false);
  });

  it("allows stable signed-in app routes when explicitly enabled", () => {
    expect(
      shouldAllowAutomaticPaywalls({
        pathname: "/",
        hasOnboarded: true,
        isAuthenticated: true,
        automaticPaywallsEnabled: true,
      })
    ).toBe(true);
  });
});
