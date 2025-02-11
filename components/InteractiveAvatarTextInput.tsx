import { Input, Spinner, Tooltip } from "@nextui-org/react";
import { PaperPlaneRight } from "@phosphor-icons/react";
import clsx from "clsx";
import { useEffect, useRef } from "react";

interface StreamingAvatarTextInputProps {
  label: string;
  placeholder: string;
  input: string;
  onSubmit: (text?: string) => void;  // Modified to accept a text parameter
  setInput: (value: string) => void;
  endContent?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}

export default function InteractiveAvatarTextInput({
  label,
  placeholder,
  input,
  onSubmit,
  setInput,
  endContent,
  disabled = true,
  loading = false,
}: StreamingAvatarTextInputProps) {
  const inputRef = useRef<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).setTranscriptionInput = function (text: string) {
        const inputField = document.getElementById(
          "transcription",
        ) as HTMLInputElement;
        if (inputField) {
          console.log(`Setting input text to: ${text}`);
          inputRef.current = text;
          setInput(text);
          inputField.value = text;
          const event = new Event("input", { bubbles: true });
          inputField.dispatchEvent(event);
          console.log("Input text set successfully with value:", text);
        }
      };

      (window as any).triggerSubmit = function () {
        const inputField = document.getElementById(
          "transcription",
        ) as HTMLInputElement;
        const currentValue = inputField?.value || inputRef.current;
        
        console.log("Triggering submit with current value:", currentValue);
        
        if (currentValue && currentValue.trim() !== "") {
          // Pass the current value directly to onSubmit
          onSubmit(currentValue);
          console.log("Submit triggered with value:", currentValue);
        } else {
          console.warn("Cannot submit: No valid input value found");
        }
      };
    }

    return () => {
      if (typeof window !== "undefined") {
        (window as any).setTranscriptionInput = undefined;
        (window as any).triggerSubmit = undefined;
      }
    };
  }, [setInput, onSubmit]);

  function handleSubmit() {
    const currentValue = input || inputRef.current;
    if (!currentValue || currentValue.trim() === "") {
      console.warn("Input is empty. Submission canceled.");
      return;
    }
    console.log(`Submitting input: ${currentValue}`);
    onSubmit(currentValue);
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Input
      id="transcription"
      endContent={
        <div className="flex flex-row items-center h-full">
          {endContent}
          <Tooltip content="Send message">
            {loading ? (
              <Spinner
                className="text-indigo-300 hover:text-indigo-200"
                size="sm"
                color="default"
              />
            ) : (
              <button
                type="submit"
                className="focus:outline-none"
                onClick={handleSubmit}
                disabled={disabled || loading}
              >
                <PaperPlaneRight
                  className={clsx(
                    "text-indigo-300 hover:text-indigo-200",
                    (disabled || loading) && "opacity-50",
                  )}
                  size={24}
                />
              </button>
            )}
          </Tooltip>
        </div>
      }
      label={label}
      placeholder={placeholder}
      size="sm"
      value={input}
      onKeyDown={handleKeyDown}
      onValueChange={(value) => {
        setInput(value);
        inputRef.current = value;
      }}
      isDisabled={disabled}
      classNames={{
        input: "min-h-unit-12",
        inputWrapper: "min-h-unit-12",
      }}
    />
  );
}