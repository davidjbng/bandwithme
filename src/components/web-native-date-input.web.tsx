import { useState } from "react";

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
        fontFamily: "inherit",
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
