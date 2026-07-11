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
        color: "inherit",
        fontFamily: "inherit",
        fontSize: 16,
        minHeight: 44,
        padding: "0 12px",
        width: "100%",
      }}
      type={type}
      value={inputValue}
    />
  );
}
