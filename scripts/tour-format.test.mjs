import { expect, test } from "vitest";
import { parseDuration, durationLabel, initials } from "../src/lib/tour-format";

test("song durations accept minutes and seconds without silently rounding invalid input", () => {
  for (const value of ["", "3", "3:7", "3:60", "-1:30", "0:00", "120:01", "3:45 extra"])
    expect(parseDuration(value)).toBeNull();
  expect(parseDuration("3:45")).toBe(225);
  expect(parseDuration(" 120:00 ")).toBe(7200);
  expect(durationLabel(225)).toBe("3:45");
  expect(initials("  Mira Winter ")).toBe("MW");
});
