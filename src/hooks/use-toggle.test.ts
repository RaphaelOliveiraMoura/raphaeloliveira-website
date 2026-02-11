import { act, renderHook } from "@testing-library/react";

import { useToggle } from "./use-toggle";

describe("useToggle", () => {
  it("starts with initial value", () => {
    const { result } = renderHook(() => useToggle(false));
    expect(result.current[0]).toBe(false);
  });

  it("toggles value", () => {
    const { result } = renderHook(() => useToggle(false));

    act(() => result.current[1]());
    expect(result.current[0]).toBe(true);

    act(() => result.current[1]());
    expect(result.current[0]).toBe(false);
  });

  it("setTrue and setFalse work correctly", () => {
    const { result } = renderHook(() => useToggle(false));

    act(() => result.current[2]()); // setTrue
    expect(result.current[0]).toBe(true);

    act(() => result.current[2]()); // setTrue again
    expect(result.current[0]).toBe(true);

    act(() => result.current[3]()); // setFalse
    expect(result.current[0]).toBe(false);
  });
});
