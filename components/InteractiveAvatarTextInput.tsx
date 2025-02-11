import { Input, Spinner, Tooltip } from "@nextui-org/react";
import { PaperPlaneRight } from "@phosphor-icons/react";
import clsx from "clsx";
import { useEffect } from "react";

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
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Simple direct submission method
      (window as any).submitText = function(text: string) {
        console.log("Directly submitting text:", text);
        setInput(text);
        onSubmit();
      };
    }

    return () => {
      if (typeof window !== "undefined") {
        (window as any).submitText = undefined;
      }
    };
  }, [setInput, onSubmit]);

  function handleSubmit() {
    if (input.trim() === "") {
      console.warn("Input is empty. Submission canceled.");
      return;
    }
    console.log(`Submitting input: ${input}`);
    onSubmit();
  }

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