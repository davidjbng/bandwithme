import { useState } from "react";

import { Fonts } from "@/constants/theme";

export type NativeDateInputProps = {
  ariaLabel: string;
  onChange: (value: string) => void;
  type: "date" | "time";
  value: string;
};

export function WebNativeDateInput({ ariaLabel, onChange, type, value }: NativeDateInputProps) {
  const [inputValue, setInputValue] = useState(value);

  function handleChange(nextValue: string) {
    setInputValue(nextValue);
    onChange(nextValue);
  }

  return (
    <input
      aria-label={ariaLabel}
      onChange={(event) => handleChange(event.target.value)}
      style={{
        backgroundColor: "transparent",
        border: 0,
        boxSizing: "border-box",
        color: "inherit",
        // A DOM input does not inherit React Native Web's Text font from the surrounding View.
        // Set the app's sans stack explicitly so Safari does not fall back to its serif control font.
        fontFamily: Fonts.sans,
        fontSize: 16,
        fontWeight: 600,
        height: 46,
        letterSpacing: 0,
        lineHeight: "20px",
        padding: "0 12px",
        width: "100%",
      }}
      type={type}
      value={inputValue}
    />
  );
}
