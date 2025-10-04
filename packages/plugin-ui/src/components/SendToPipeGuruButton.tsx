import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface SendToPipeGuruButtonProps {
  code: string;
  framework: string;
  onSend: () => Promise<void>;
  disabled?: boolean;
}

export const SendToPipeGuruButton = ({
  code,
  framework,
  onSend,
  disabled = false,
}: SendToPipeGuruButtonProps) => {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleClick = async () => {
    if (disabled || !code || status === "sending") return;

    setStatus("sending");
    setErrorMessage("");

    try {
      await onSend();
      setStatus("success");

      // Reset to idle after 3 seconds
      setTimeout(() => setStatus("idle"), 3000);
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to send to PipeGuru");

      // Reset to idle after 5 seconds
      setTimeout(() => {
        setStatus("idle");
        setErrorMessage("");
      }, 5000);
    }
  };

  const getButtonContent = () => {
    switch (status) {
      case "sending":
        return (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Sending...</span>
          </>
        );
      case "success":
        return (
          <>
            <CheckCircle2 size={16} />
            <span>Sent to PipeGuru!</span>
          </>
        );
      case "error":
        return (
          <>
            <AlertCircle size={16} />
            <span>Failed to send</span>
          </>
        );
      default:
        return (
          <>
            <Send size={16} />
            <span>Send to PipeGuru</span>
          </>
        );
    }
  };

  const getButtonStyles = () => {
    const baseStyles = "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-medium text-sm transition-all";

    switch (status) {
      case "sending":
        return `${baseStyles} bg-blue-500 text-white cursor-wait`;
      case "success":
        return `${baseStyles} bg-green-500 text-white cursor-default`;
      case "error":
        return `${baseStyles} bg-red-500 text-white cursor-pointer hover:bg-red-600`;
      default:
        return `${baseStyles} bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 ${
          disabled || !code ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`;
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleClick}
        disabled={disabled || !code || status === "sending"}
        className={getButtonStyles()}
        title={!code ? "Generate code first" : "Send HTML to PipeGuru"}
      >
        {getButtonContent()}
      </button>
      {errorMessage && (
        <p className="mt-2 text-xs text-red-500 text-center">{errorMessage}</p>
      )}
    </div>
  );
};
