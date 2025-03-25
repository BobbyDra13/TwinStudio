import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import MessageList from "./components/MessageList";
import MessageInput from "./components/MessageInput";
import TrainingOverlay from "./components/TrainingOverlay";
import { ProductManager } from "./utils/mistralApi";
import { MessageType, ConversationStage, ModelType } from "./types";

// Default models
const availableModels: ModelType[] = [
  { id: 1, name: "Mistral AI", avatar: "MA" },
];

// Helper to generate unique IDs
const generateUniqueId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

function App() {
  const [stage, setStage] = useState<ConversationStage>("welcome");
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productVolume, setProductVolume] = useState("");
  const [productShape, setProductShape] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [productManager] = useState(new ProductManager());

  // Initialize the conversation
  useEffect(() => {
    const initializeConversation = async () => {
      setIsProcessing(true);

      // Get initial greeting from ProductManager or use default
      let initialGreeting =
        "Hi, I am Product AI. I help categorize and profile products. Please give me the name of your product.";

      if (productManager.getMessages().length === 1) {
        // Only system message exists, add assistant initial greeting
        await productManager.addUserMessageAndGetResponse("Hello");
        const response = productManager.getLastAssistantMessage();
        if (response) {
          initialGreeting = response;
        }
      }

      const initialMessage: MessageType = {
        id: generateUniqueId(),
        content: initialGreeting,
        sender: "assistant",
        timestamp: new Date(),
      };

      setMessages([initialMessage]);
      setIsProcessing(false);
    };

    initializeConversation();
  }, []);

  const addAssistantMessage = async (content: string) => {
    const newMessage: MessageType = {
      id: generateUniqueId(),
      content,
      sender: "assistant",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  const addSystemMessage = async (content: string, models?: number[]) => {
    const newMessage: MessageType = {
      id: generateUniqueId(),
      content,
      sender: "system",
      timestamp: new Date(),
      models,
    };

    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  // Helper function to detect if we should move to training stage
  const shouldMoveToTraining = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return lowerText.includes("processing your product information");
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (message.trim() === "" || isProcessing) return;

    const messageContent = message;
    setMessage("");

    const newMessage: MessageType = {
      id: generateUniqueId(),
      content: messageContent,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsProcessing(true);

    try {
      // Let the ProductManager handle all user messages
      const response = await productManager.addUserMessageAndGetResponse(
        messageContent
      );

      await addAssistantMessage(response);

      // Update local state with product information from ProductManager
      const currentProfile = productManager.getProductProfile();
      setProductName(currentProfile.productName);
      setProductCategory(currentProfile.productCategory);
      setProductVolume(currentProfile.productVolume);
      setProductShape(currentProfile.productShape);
      setAdditionalInfo(currentProfile.additionalInfo);

      // Determine the current stage based on the response
      updateStageFromResponse(response);

      // Check if we should move to training stage
      if (shouldMoveToTraining(response)) {
        setStage("training");

        setTimeout(async () => {
          try {
            const savedProduct = await productManager.saveProductToDatabase();
            console.log("Product saved to database:", savedProduct);

            await addSystemMessage(
              `Product information has been successfully processed and saved to database.`,
              [1]
            );

            await addAssistantMessage(`Your product information has been successfully processed and saved! Here's what you can ask about next:
  
  1. What marketing strategies would work best for my ${currentProfile.productName}?
  2. How can I improve the positioning of my product in the ${currentProfile.productCategory} market?
  3. What packaging recommendations do you have for a product with these specifications?
  
  Feel free to ask any product-related questions.`);

            setStage("chat");
          } catch (error) {
            console.error("Error saving product to database:", error);
            await addAssistantMessage(
              "I'm sorry, I encountered an error saving your product information. Please try again."
            );
          } finally {
            setIsProcessing(false);
          }
        }, 3000);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      await addAssistantMessage(
        "I'm sorry, I encountered an error processing your request. Please try again."
      );
    } finally {
      if (stage !== "training") {
        setIsProcessing(false);
      }
    }
  };

  // Add this new function to determine the stage from responses
  const updateStageFromResponse = (response: string) => {
    const lowerResponse = response.toLowerCase();

    if (lowerResponse.includes("what category does this product belong to")) {
      setStage("product_category");
    } else if (
      lowerResponse.includes("volume or dimensions") ||
      lowerResponse.includes("tell me about the volume")
    ) {
      setStage("product_volume");
    } else if (lowerResponse.includes("shape or form factor")) {
      setStage("product_shape");
    } else if (
      lowerResponse.includes("additional information") &&
      !lowerResponse.includes("here's your product profile")
    ) {
      setStage("additional_info");
    } else if (
      lowerResponse.includes("here's your product profile") ||
      lowerResponse.includes("is this information correct")
    ) {
      setStage("confirmation");
    } else if (lowerResponse.includes("processing your product information")) {
      // Stage will be set to "training" in the main function
    } else if (
      stage === "training" &&
      lowerResponse.includes("successfully processed")
    ) {
      setStage("chat");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header availableModels={availableModels} />

      <div className="flex flex-1 overflow-hidden">
        {/* Chat interface */}
        <div className="flex-1 flex flex-col">
          <MessageList messages={messages} availableModels={availableModels} />
          <MessageInput
            message={message}
            setMessage={setMessage}
            handleSendMessage={handleSendMessage}
            isProcessing={isProcessing}
            stage={stage}
          />
        </div>
      </div>

      <TrainingOverlay
        isVisible={stage === "training"}
        availableModels={availableModels}
      />
    </div>
  );
}

export default App;
