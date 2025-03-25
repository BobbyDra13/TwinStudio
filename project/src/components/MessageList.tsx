import React, { useRef, useEffect } from "react";
import { User, MessageSquare, SplitSquareVertical } from "lucide-react";
import { MessageType, ModelType } from "../types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import copilot_logo from "../assets/Ami_Copilot.png";

type MessageListProps = {
  messages: MessageType[];
  availableModels: ModelType[];
};

const MessageList: React.FC<MessageListProps> = ({
  messages,
  availableModels,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Component to render message content with markdown support
  const MessageContent = ({ content }: { content: string }) => {
    return (
      <ReactMarkdown
        className="prose prose-sm max-w-none prose-indigo"
        remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      <div className="max-w-3xl mx-auto space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col">
            {msg.sender === "user" && (
              <div className="flex justify-end mb-4">
                <div className="max-w-[80%]">
                  <div className="flex items-center justify-end mb-1">
                    <span className="text-xs text-gray-500 mr-2">
                      {formatTime(msg.timestamp)}
                    </span>
                    <span className="font-medium text-gray-900">You</span>
                  </div>
                  <div className="bg-indigo-600 text-white rounded-lg rounded-tr-none p-3 shadow-md">
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
                <div className="bg-indigo-700 text-white rounded-full w-8 h-8 flex items-center justify-center ml-2 flex-shrink-0 self-end">
                  <User className="h-4 w-4" />
                </div>
              </div>
            )}

            {msg.sender === "assistant" && (
              <div className="flex justify-start mb-4">
                <div className="text-white rounded-full w-8 h-8 flex items-center justify-center mr-2 flex-shrink-0 self-end">
                  <img src={copilot_logo} className="s-8" />
                </div>
                <div className="max-w-[80%]">
                  <div className="flex items-center mb-1">
                    <span className="font-medium text-gray-900">
                      TwinStudio AI
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-md border border-gray-200">
                    <MessageContent content={msg.content} />
                  </div>
                </div>
              </div>
            )}

            {msg.sender === "system" && (
              <div className="flex justify-center mb-4">
                <div className="bg-gray-100 rounded-lg p-3 shadow-sm border border-gray-200 max-w-[90%]">
                  <div className="flex items-center justify-center mb-1">
                    <MessageSquare className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="font-medium text-gray-700">System</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  <p className="text-gray-700 text-center">{msg.content}</p>

                  {msg.models && (
                    <div className="mt-2 flex flex-wrap gap-1 justify-center">
                      <span className="text-xs text-gray-500">
                        Trained models:
                      </span>
                      {msg.models.map((id) => (
                        <span
                          key={id}
                          className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                          {availableModels.find((m) => m.id === id)?.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {msg.sender === "model" &&
              msg.multiModelResponse &&
              msg.multiModelResponses && (
                <div className="mb-4">
                  <div className="flex items-center justify-center mb-2">
                    <SplitSquareVertical className="h-4 w-4 text-indigo-600 mr-1" />
                    <span className="font-medium text-gray-900">
                      AI Response
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>

                  <div className="flex justify-start mb-4">
                    <div className="text-white rounded-full w-8 h-8 flex items-center justify-center mr-2 flex-shrink-0 self-end">
                      <img src={copilot_logo} className="s-8" />
                    </div>
                    <div className="max-w-[80%]">
                      <div className="flex items-center mb-1">
                        <span className="font-medium text-gray-900">
                          Mistral AI
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-md border border-gray-200">
                        <MessageContent
                          content={msg.multiModelResponses[0].content}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
