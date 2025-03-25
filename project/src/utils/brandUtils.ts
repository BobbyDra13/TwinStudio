// Helper function to generate a product description based on product details
export const generateProductDescription = (
  product: string,
  category: string,
  volume: string,
  shape: string
): string => {
  // This is a simple template-based generation
  // In a real app, this would be an API call to an LLM

  const categoryDescriptions = {
    electronics: "cutting-edge technology",
    food: "delicious culinary experience",
    clothing: "stylish fashion solution",
    household: "practical home essential",
    beauty: "premium beauty product",
    sports: "high-performance sports equipment",
    health: "essential health and wellness item",
    toys: "engaging and educational toy",
    automotive: "reliable automotive component",
    furniture: "elegant and functional furniture piece",
  };

  // Determine best category match
  let bestCategory = "product";
  for (const [key, value] of Object.entries(categoryDescriptions)) {
    if (category.toLowerCase().includes(key)) {
      bestCategory = key;
      break;
    }
  }

  // Get description for that category
  const description =
    categoryDescriptions[bestCategory as keyof typeof categoryDescriptions] ||
    "innovative product";

  // Determine size description
  let sizeDesc = "";
  if (
    volume.toLowerCase().includes("small") ||
    volume.toLowerCase().includes("compact")
  ) {
    sizeDesc = "compact";
  } else if (volume.toLowerCase().includes("medium")) {
    sizeDesc = "medium-sized";
  } else if (
    volume.toLowerCase().includes("large") ||
    volume.toLowerCase().includes("big")
  ) {
    sizeDesc = "substantial";
  } else {
    sizeDesc = "versatile";
  }

  // Generate shape-based descriptor
  let shapeDesc = "";
  if (
    shape.toLowerCase().includes("round") ||
    shape.toLowerCase().includes("circular")
  ) {
    shapeDesc = "ergonomically designed";
  } else if (
    shape.toLowerCase().includes("square") ||
    shape.toLowerCase().includes("rectangular")
  ) {
    shapeDesc = "precision-engineered";
  } else if (
    shape.toLowerCase().includes("irregular") ||
    shape.toLowerCase().includes("unique")
  ) {
    shapeDesc = "uniquely shaped";
  } else {
    shapeDesc = "carefully crafted";
  }

  const templates = [
    `${product}: A ${sizeDesc}, ${shapeDesc} ${description} designed to exceed expectations.`,
    `${product}: The ${sizeDesc} ${description} that combines functionality with elegant ${shape.toLowerCase()} design.`,
    `Experience the difference with ${product}, our ${sizeDesc} ${description} that stands out in the ${category} market.`,
    `${product}: Where innovation meets practicality in a ${sizeDesc}, ${shapeDesc} ${description}.`,
    `Introducing ${product}: The ${sizeDesc} ${description} with a ${shapeDesc} approach to solving everyday problems.`,
  ];

  return templates[Math.floor(Math.random() * templates.length)];
};

// Helper function to generate model responses about products
export const generateModelResponse = (
  productName: string,
  productCategory: string,
  productVolume: string,
  productShape: string,
  additionalInfo: string,
  query: string,
  model: string
): string => {
  // This would be an API call to the respective model in a real application

  const isAboutFeatures =
    query.toLowerCase().includes("feature") ||
    query.toLowerCase().includes("specification") ||
    query.toLowerCase().includes("spec") ||
    query.toLowerCase().includes("capability");

  const isAboutMarketing =
    query.toLowerCase().includes("market") ||
    query.toLowerCase().includes("sell") ||
    query.toLowerCase().includes("promote") ||
    query.toLowerCase().includes("advertise");

  const isAboutPackaging =
    query.toLowerCase().includes("package") ||
    query.toLowerCase().includes("box") ||
    query.toLowerCase().includes("container") ||
    query.toLowerCase().includes("wrap");

  const isAboutPricing =
    query.toLowerCase().includes("price") ||
    query.toLowerCase().includes("cost") ||
    query.toLowerCase().includes("value") ||
    query.toLowerCase().includes("worth");

  let response = "";

  if (model === "ChatGPT") {
    if (isAboutFeatures) {
      response = `Based on the information for ${productName}, I recommend highlighting these key features in your product documentation: its ${productCategory} functionality, ${productVolume} capacity, and ${productShape} design. Consider creating a comparison chart that shows how these specifications compare favorably to competitor products in the same category.`;
    } else if (isAboutMarketing) {
      response = `For marketing ${productName}, I recommend focusing on how its ${productShape} design provides unique benefits within the ${productCategory} market. Create visual content that emphasizes the product's dimensions (${productVolume}) and how this contributes to user experience. Target platforms where consumers actively search for ${productCategory} products.`;
    } else if (isAboutPackaging) {
      response = `For a ${productCategory} product with ${productVolume} dimensions and a ${productShape} form factor, I recommend packaging that securely holds the product while highlighting its shape through cut-outs or transparent elements. Consider sustainable materials that align with consumer expectations in the ${productCategory} market.`;
    } else if (isAboutPricing) {
      response = `When pricing ${productName}, consider its positioning within the ${productCategory} market. Products with similar ${productVolume} and ${productShape} characteristics typically command a premium of 15-25% over basic alternatives. Conduct competitive analysis focusing specifically on products with comparable specifications.`;
    } else {
      response = `As ChatGPT, I've analyzed your question about "${query}" in the context of ${productName}. Given that it's a ${productCategory} product with ${productVolume} dimensions and a ${productShape} design, I recommend approaching this question with those specifications in mind. ${
        additionalInfo
          ? `The additional information you provided about "${additionalInfo}" offers valuable context for this analysis.`
          : ""
      }`;
    }
  } else {
    if (isAboutFeatures) {
      response = `For your ${productName}, I recommend prioritizing these features based on your product profile: first, emphasize how its ${productShape} design provides unique advantages in the ${productCategory} space. Second, highlight how its ${productVolume} dimensions create the optimal user experience. Finally, consider adding comparison data showing how these specifications outperform competitors.`;
    } else if (isAboutMarketing) {
      response = `To effectively market ${productName}, develop a strategy that highlights how its ${productCategory} classification meets specific consumer needs. Create content demonstrating how its ${productShape} design and ${productVolume} dimensions solve common pain points. Consider influencer partnerships with content creators who specialize in reviewing ${productCategory} products.`;
    } else if (isAboutPackaging) {
      response = `For ${productName}, I recommend packaging that complements its ${productShape} form factor while protecting its ${productVolume} dimensions. Consider a design that allows consumers to partially see or interact with the product before purchase, which is particularly effective for ${productCategory} items. Use packaging to educate consumers about key features and benefits.`;
    } else if (isAboutPricing) {
      response = `When determining pricing for ${productName}, consider three key factors: 1) The perceived value of its ${productShape} design in the ${productCategory} market, 2) Production costs related to maintaining its ${productVolume} specifications, and 3) Competitor pricing for similar products. Consider a tiered pricing strategy if you plan to offer variations of the product.`;
    } else {
      response = `As Mistral AI, I've analyzed your question about "${query}" in relation to ${productName}. As a ${productCategory} product with ${productVolume} dimensions and ${productShape} design, several approaches could be effective. ${
        additionalInfo
          ? `I've also factored in the additional context about "${additionalInfo}" which provides important nuance.`
          : ""
      } My recommendation is to focus on the product's unique specifications while addressing the specific requirements of this scenario.`;
    }
  }

  return response;
};
