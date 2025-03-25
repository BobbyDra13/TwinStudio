export type ModelType = {
  id: number;
  name: string;
  avatar: string;
};

export type MessageType = {
  id: string;
  content: string;
  sender: "user" | "system" | "model" | "assistant";
  timestamp: Date;
  models?: number[];
  modelId?: number;
  multiModelResponse?: boolean;
  multiModelResponses?: {
    modelId: number;
    content: string;
  }[];
};

export type ConversationStage =
  | "welcome"
  | "product_category"
  | "product_volume"
  | "product_shape"
  | "additional_info"
  | "confirmation"
  | "training"
  | "chat";
