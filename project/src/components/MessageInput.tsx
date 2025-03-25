import React, { useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { ConversationStage } from "../types";

type MessageInputProps = {
  message: string;
  setMessage: (message: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  isProcessing: boolean;
  stage: ConversationStage;
};

const MessageInput: React.FC<MessageInputProps> = ({
  message,
  setMessage,
  handleSendMessage,
  isProcessing,
  stage,
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Focus the textarea when the component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Maintain focus after new messages are added or processing state changes
  useEffect(() => {
    if (!isProcessing && inputRef.current && stage !== "training") {
      inputRef.current.focus();
    }
  }, [isProcessing, stage]);

  // Determine the appropriate placeholder text based on the current stage
  const getPlaceholderText = () => {
    switch (stage) {
      case "welcome":
        return "Enter your product name...";
      case "product_category":
        return "Enter product category (electronics, clothing, food, etc.)...";
      case "product_volume":
        return "Enter product volume or dimensions...";
      case "product_shape":
        return "Enter product shape or form factor...";
      case "additional_info":
        return "Add any additional information about your product (optional)...";
      case "confirmation":
        return "Confirm information or request changes...";
      case "chat":
        return "Ask a question about your product...";
      default:
        return "Type your message...";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() !== "" && !isProcessing && stage !== "training") {
        const formEvent = e as unknown as React.FormEvent;
        handleSendMessage(formEvent);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() !== "" && !isProcessing && stage !== "training") {
      handleSendMessage(e);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              className="w-full border border-indigo-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              placeholder={getPlaceholderText()}
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isProcessing || stage === "training"}
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={
              message.trim() === "" || isProcessing || stage === "training"
            }
            className={`p-3 rounded-lg ${
              message.trim() === "" || isProcessing || stage === "training"
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}>
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>

        <div className="mt-2 text-xs text-gray-500 flex justify-between">
          <span>
            {stage === "chat"
              ? "Ask questions about your product"
              : stage === "training"
              ? "Processing your product information..."
              : `Step: ${stage.replace("_", " ")}`}
          </span>
          <span>{message.length} characters</span>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
