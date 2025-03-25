import MistralClient from "@mistralai/mistralai";
const apiKey = import.meta.env.VITE_MISTRAL_API_KEY;

console.log(apiKey);

const mistral = new MistralClient(apiKey);

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Send a query to the Mistral AI API
 */
export const queryMistral = async (messages: Message[]): Promise<string> => {
  try {
    const chatResponse = await mistral.chat({
      model: "mistral-large-latest",
      messages: messages,
    });

    if (!chatResponse.choices?.[0]?.message?.content) {
      throw new Error("Invalid response format from Mistral API");
    }

    return chatResponse.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error calling Mistral API:", error);

    if (error instanceof Error) {
      throw new Error(`Mistral AI error: ${error.message}`);
    }

    throw new Error("Failed to get response from Mistral API");
  }
};

// Create a product information manager
export class ProductManager {
  private messages: Message[] = [];
  private productName: string = "";
  private productCategory: string = "";
  private productVolume: string = "";
  private productShape: string = "";
  private additionalInfo: string = "";
  private initialized: boolean = false;
  private apiUrl: string = "http://localhost:5000/api";

  constructor() {
    // Initialize with system prompt
    this.messages.push({
      role: "system",
      content: `You are Product AI, an expert in product profiling and categorization. 
      
Your task is to help users profile their products through a structured conversation:

1. First, ask for their product name
2. Ask about the product category (e.g., electronics, food, clothing, etc.)
3. Ask about the product volume (dimensions or quantity)
4. Ask about the product shape or form factor
5. Ask for any additional information that would be helpful for profiling the product
6. Confirm all the details with the user showing a formatted product profile with all collected information
7. The user edits or confirms all this information
8. When they're ready, inform them that their product profile is complete

Guidelines:
- Keep responses under 150 words unless detailed explanation is necessary
- Be conversational and helpful
- If the user doesn't have specific details about category, volume, or shape, ask one more time but then proceed
- Never repeat the same question twice in a row
- If the user has already confirmed something, don't ask for confirmation again
- Use markdown formatting for better readability
- Respond to the user's exact input, don't make assumptions about what they meant
- At the end, display the complete product profile as a set of key-value pairs

When the user indicates they're ready to proceed with all information provided, tell them "processing your product information" and display the complete product profile on the console.`,
    });
  }

  // Add a user message and get AI response
  async addUserMessageAndGetResponse(userMessage: string): Promise<string> {
    // Check if the message contains "processing your product information"
    if (
      this.getLastAssistantMessage()?.includes(
        "processing your product information"
      )
    ) {
      // Save product profile to database
      try {
        const savedProduct = await this.saveProductToDatabase();
        console.log("Product saved to database:", savedProduct);
      } catch (error) {
        console.error("Error saving product to database:", error);
      }
    }

    // Add user message to history
    this.messages.push({
      role: "user",
      content: userMessage,
    });

    // Update the system message with the current product information
    this.updateSystemMessage();

    // Get response from Mistral
    const response = await queryMistral(this.messages);

    // Add assistant response to history
    this.messages.push({
      role: "assistant",
      content: response,
    });

    // Try to extract product information from the conversation
    this.extractProductInfoFromConversation();

    return response;
  }

  // Update the system message with current product information
  private updateSystemMessage(): void {
    // Get the basic system prompt
    const baseSystemPrompt = `You are Product AI, an expert in product profiling and categorization. 
      
Your task is to help users profile their products through a structured conversation:

1. First, ask for their product name
2. Ask about the product category (e.g., electronics, food, clothing, etc.)
3. Ask about the product volume (dimensions or quantity)
4. Ask about the product shape or form factor
5. Ask for any additional information that would be helpful for profiling the product
6. Confirm all the details with the user showing a formatted product profile with all collected information
7. The user edits or confirms all this information
8. When they're ready, inform them that their product profile is complete

Guidelines:
- Keep responses under 150 words unless detailed explanation is necessary
- Be conversational and helpful
- If the user doesn't have specific details about category, volume, or shape, ask one more time but then proceed
- Never repeat the same question twice in a row
- If the user has already confirmed something, don't ask for confirmation again
- Use markdown formatting for better readability
- Respond to the user's exact input, don't make assumptions about what they meant
- At the end, display the complete product profile as a set of key-value pairs

When the user indicates they're ready to proceed with all information provided, tell them "processing your product information" and display the complete product profile on the console.`;

    // Add current product information to system prompt if available
    let systemPrompt = baseSystemPrompt;

    if (
      this.productName ||
      this.productCategory ||
      this.productVolume ||
      this.productShape ||
      this.additionalInfo
    ) {
      systemPrompt += "\n\nCurrent product information:";

      if (this.productName) {
        systemPrompt += `\n- Product Name: ${this.productName}`;
      }

      if (this.productCategory) {
        systemPrompt += `\n- Product Category: ${this.productCategory}`;
      }

      if (this.productVolume) {
        systemPrompt += `\n- Product Volume: ${this.productVolume}`;
      }

      if (this.productShape) {
        systemPrompt += `\n- Product Shape: ${this.productShape}`;
      }

      if (this.additionalInfo) {
        systemPrompt += `\n- Additional Information: ${this.additionalInfo}`;
      }

      systemPrompt +=
        "\n\nPlease use this information when continuing the conversation. If the user updates any of these details, incorporate the changes into your understanding of the product.";
    }

    // Update the system message
    this.messages[0] = {
      role: "system",
      content: systemPrompt,
    };
  }

  // Extract product information from the conversation
  private extractProductInfoFromConversation(): void {
    // Use the last few exchanges to identify potential updates to product information
    const lastUserMessages = this.messages
      .filter((msg) => msg.role === "user")
      .slice(-3)
      .map((msg) => msg.content);

    const lastAssistantMessages = this.messages
      .filter((msg) => msg.role === "assistant")
      .slice(-3)
      .map((msg) => msg.content);

    // Check for possible name updates
    for (const msg of lastUserMessages) {
      // Look for "the name is..." or similar patterns
      if (
        msg.toLowerCase().includes("name is") ||
        msg.toLowerCase().includes("called") ||
        msg.toLowerCase().includes("product name")
      ) {
        const potentialName = msg
          .split(/name is|called|product name/i)[1]
          ?.trim();
        if (
          potentialName &&
          potentialName.length > 0 &&
          potentialName.length < 50
        ) {
          this.productName = potentialName.replace(/[".]/g, "");
        }
      }
    }

    // Check for possible category updates
    for (const msg of lastUserMessages) {
      if (
        msg.toLowerCase().includes("category is") ||
        msg.toLowerCase().includes("categorized as") ||
        msg.toLowerCase().includes("product category")
      ) {
        const potentialCategory = msg
          .split(/category is|categorized as|product category/i)[1]
          ?.trim();
        if (
          potentialCategory &&
          potentialCategory.length > 0 &&
          potentialCategory.length < 50
        ) {
          this.productCategory = potentialCategory.replace(/[".]/g, "");
        }
      }
    }

    // Check for volume updates
    for (const msg of lastUserMessages) {
      if (
        msg.toLowerCase().includes("volume is") ||
        msg.toLowerCase().includes("dimensions are") ||
        msg.toLowerCase().includes("size is") ||
        msg.toLowerCase().includes("product volume")
      ) {
        const potentialVolume = msg
          .split(/volume is|dimensions are|size is|product volume/i)[1]
          ?.trim();
        if (
          potentialVolume &&
          potentialVolume.length > 0 &&
          potentialVolume.length < 50
        ) {
          this.productVolume = potentialVolume.replace(/[".]/g, "");
        }
      }
    }

    // Check for shape updates
    for (const msg of lastUserMessages) {
      if (
        msg.toLowerCase().includes("shape is") ||
        msg.toLowerCase().includes("form factor is") ||
        msg.toLowerCase().includes("product shape")
      ) {
        const potentialShape = msg
          .split(/shape is|form factor is|product shape/i)[1]
          ?.trim();
        if (
          potentialShape &&
          potentialShape.length > 0 &&
          potentialShape.length < 50
        ) {
          this.productShape = potentialShape.replace(/[".]/g, "");
        }
      }
    }

    // Check assistant messages for extracted information
    for (const msg of lastAssistantMessages) {
      // Look for a formatted product profile
      if (msg.includes("Product Name") || msg.includes("productName")) {
        const lines = msg.split("\n");

        for (const line of lines) {
          if (line.includes("Product Name") || line.includes("productName")) {
            const name = line.split(/[":]/)[1]?.trim();
            if (name && name.length > 0) {
              this.productName = name.replace(/[",]/g, "");
            }
          }

          if (line.includes("Category") || line.includes("productCategory")) {
            const category = line.split(/[":]/)[1]?.trim();
            if (category && category.length > 0) {
              this.productCategory = category.replace(/[",]/g, "");
            }
          }

          if (line.includes("Volume") || line.includes("productVolume")) {
            const volume = line.split(/[":]/)[1]?.trim();
            if (volume && volume.length > 0) {
              this.productVolume = volume.replace(/[",]/g, "");
            }
          }

          if (line.includes("Shape") || line.includes("productShape")) {
            const shape = line.split(/[":]/)[1]?.trim();
            if (shape && shape.length > 0) {
              this.productShape = shape.replace(/[",]/g, "");
            }
          }
        }
      }
    }
  }

  // Set product name
  setProductName(name: string) {
    this.productName = name;
    // After setting the name, update the system message
    this.updateSystemMessage();
  }

  // Set product category
  setProductCategory(category: string) {
    this.productCategory = category;
    this.updateSystemMessage();
  }

  // Set product volume
  setProductVolume(volume: string) {
    this.productVolume = volume;
    this.updateSystemMessage();
  }

  // Set product shape
  setProductShape(shape: string) {
    this.productShape = shape;
    this.updateSystemMessage();
  }

  // Add additional info
  addAdditionalInfo(info: string) {
    this.additionalInfo = this.additionalInfo
      ? `${this.additionalInfo}\n\n${info}`
      : info;
    this.updateSystemMessage();
  }

  // Get product-specific response for chat stage
  async getProductResponse(query: string): Promise<string> {
    const messages: Message[] = [
      {
        role: "system",
        content: `You are a product profiling expert. You're helping categorize a product called "${
          this.productName
        }". 
        Category: "${this.productCategory}"
        Volume: "${this.productVolume}"
        Shape: "${this.productShape}"
        ${
          this.additionalInfo
            ? `Additional information: "${this.additionalInfo}"`
            : ""
        } 
        
Provide specific, actionable advice based on this information. Keep your response under 200 words and focus on being practical and insightful. Use markdown formatting for better readability.`,
      },
      {
        role: "user",
        content: query,
      },
    ];

    try {
      return await queryMistral(messages);
    } catch (error) {
      console.error("Error generating model response:", error);
      return "I apologize, but I'm having trouble connecting to my knowledge base right now. Please try again with your question.";
    }
  }

  // Get conversation history
  getMessages(): Message[] {
    return this.messages;
  }

  // Get the last assistant message
  getLastAssistantMessage(): string | null {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      if (this.messages[i].role === "assistant") {
        return this.messages[i].content;
      }
    }
    return null;
  }

  // Reset the conversation while preserving product information
  resetConversation(): void {
    // Save the current system message
    const systemMessage = this.messages[0];

    // Clear messages array
    this.messages = [];

    // Re-add system message with updated product info
    this.messages.push(systemMessage);

    // Update system message with current product information
    this.updateSystemMessage();
  }

  // Get complete product profile
  getProductProfile(): object {
    return {
      productName: this.productName,
      productCategory: this.productCategory,
      productVolume: this.productVolume,
      productShape: this.productShape,
      additionalInfo: this.additionalInfo,
    };
  }

  // New methods for database interaction

  /**
   * Save product profile to MongoDB database
   * @returns Promise with saved product data
   */
  async saveProductToDatabase(): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/products/save-product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.getProductProfile()),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Error ${response.status}: ${errorData.message || "Unknown error"}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error saving product to database:", error);
      throw error;
    }
  }

  /**
   * Get all products from database
   * @returns Promise with array of products
   */
  async getAllProducts(): Promise<any[]> {
    try {
      const response = await fetch(`${this.apiUrl}/products`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Error ${response.status}: ${errorData.message || "Unknown error"}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }

  /**
   * Get a specific product by ID
   * @param id The MongoDB ID of the product
   * @returns Promise with product data
   */
  async getProductById(id: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/products/${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Error ${response.status}: ${errorData.message || "Unknown error"}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update a product in the database
   * @param id The MongoDB ID of the product
   * @param updateData The data to update
   * @returns Promise with updated product data
   */
  async updateProduct(id: string, updateData: Partial<any>): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Error ${response.status}: ${errorData.message || "Unknown error"}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating product with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a product from the database
   * @param id The MongoDB ID of the product
   * @returns Promise with deletion confirmation
   */
  async deleteProduct(id: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Error ${response.status}: ${errorData.message || "Unknown error"}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`Error deleting product with ID ${id}:`, error);
      throw error;
    }
  }
}

// Helper function to generate model responses to user queries about products
export const generateProductResponse = async (
  productName: string,
  productCategory: string,
  productVolume: string,
  productShape: string,
  additionalInfo: string,
  query: string
): Promise<string> => {
  const messages: Message[] = [
    {
      role: "system",
      content: `You are a product profiling expert. You're helping categorize a product called "${productName}".
      Category: "${productCategory}"
      Volume: "${productVolume}"
      Shape: "${productShape}"
      ${additionalInfo ? `Additional information: "${additionalInfo}"` : ""} 
      
Provide specific, actionable advice based on this information. Keep your response under 200 words and focus on being practical and insightful. Use markdown formatting for better readability.`,
    },
    {
      role: "user",
      content: query,
    },
  ];

  try {
    return await queryMistral(messages);
  } catch (error) {
    console.error("Error generating model response:", error);
    return "I apologize, but I'm having trouble connecting to my knowledge base right now. Please try again with your question.";
  }
};
