import { Input, Spinner, Tooltip } from "@nextui-org/react";
import { PaperPlaneRight } from "@phosphor-icons/react";
import clsx from "clsx";
import { useEffect, useCallback } from "react";

interface StreamingAvatarTextInputProps {
  label: string;
  placeholder: string;
  input: string;
  onSubmit: () => void;
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
  // Memoize the handleSubmit function
  const handleSubmit = useCallback(() => {
    if (input.trim() === "") {
      console.warn("Input is empty. Submission canceled.");
      return;
    }
    console.log(`Submitting input: ${input}`);
    onSubmit(); // Trigger the parent's submit handler
    setInput(""); // Clear the input after submission
  }, [input, onSubmit, setInput]);

  // Function to handle Unity's interaction
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Unity function to set the input text
      (window as any).setTranscriptionInput = function (text: string) {
        const inputField = document.getElementById(
          "transcription",
        ) as HTMLInputElement;
        if (inputField) {
          console.log(`Setting input text to: ${text}`);
          setInput(text); // Update React state
          inputField.value = text; // Update DOM input field value
          const event = new Event("input", { bubbles: true });
          inputField.dispatchEvent(event); // Trigger React's state update
          console.log("Input text set successfully!");
        } else {
          console.error("Input field with ID 'transcription' not found!");
        }
      };

      // Unity function to trigger the submit
      (window as any).triggerSubmit = function () {
        // Add a small delay to ensure state is updated
        setTimeout(() => {
          const inputField = document.getElementById(
            "transcription",
          ) as HTMLInputElement;
          if (inputField) {
            console.log("triggerSubmit called");
            console.log("Input field value:", inputField.value);
            console.log("React input state:", input);
            
            // Use the input field value directly
            if (input && input.trim() !== "") {
              console.log("Triggering submit with input:", input);
              onSubmit();
            } else {
              console.warn("Cannot submit: Input is empty.");
            }
          } else {
            console.warn("Cannot submit: Input field not found.");
          }
        }, 100); // Small delay to ensure state is updated
      };
    }

    return () => {
      if (typeof window !== "undefined") {
        (window as any).setTranscriptionInput = undefined;
        (window as any).triggerSubmit = undefined;
      }
    };
  }, [onSubmit, setInput]); // Remove input from dependencies

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
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleSubmit();
        }
      }}
      onValueChange={setInput}
      isDisabled={disabled}
    />
  );
}