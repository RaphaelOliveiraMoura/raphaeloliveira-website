import type { ReactNode } from "react";

import { act, renderHook } from "@testing-library/react";

import { ThemeProvider, useTheme } from "./theme-provider";

function createWrapper(defaultTheme?: "light" | "dark" | "system") {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ThemeProvider defaultTheme={defaultTheme}>{children}</ThemeProvider>
    );
  };
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("light", "dark");

    // Mock window.matchMedia (not available in jsdom)
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("provides default theme", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper("light"),
    });
    expect(result.current.theme).toBe("light");
    expect(result.current.resolvedTheme).toBe("light");
  });

  it("toggles theme between light and dark", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper("light"),
    });

    act(() => result.current.toggleTheme());
    expect(result.current.resolvedTheme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    act(() => result.current.toggleTheme());
    expect(result.current.resolvedTheme).toBe("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
  });

  it("persists theme in localStorage", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper("light"),
    });

    act(() => result.current.setTheme("dark"));
    expect(localStorage.getItem("core-stack-theme")).toBe("dark");
  });

  it("reads saved theme from localStorage", () => {
    localStorage.setItem("core-stack-theme", "dark");

    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper("light"),
    });

    expect(result.current.theme).toBe("dark");
  });

  it("throws if useTheme is used outside of ThemeProvider", () => {
    expect(() => {
      renderHook(() => useTheme());
    }).toThrow("useTheme must be used within a ThemeProvider");
  });
});
