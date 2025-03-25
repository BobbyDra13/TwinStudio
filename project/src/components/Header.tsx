import React from "react";
import { Tag } from "lucide-react";
import { ModelType } from "../types";

type HeaderProps = {
  availableModels: ModelType[];
};

const Header: React.FC<HeaderProps> = ({ availableModels }) => {
  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between">
      <div className="flex items-center">
        <Tag className="text-indigo-600 mr-2" />
        <h1 className="text-xl font-semibold text-gray-800">TwinStudio AI</h1>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">Models:</span>
        <div className="flex items-center space-x-1">
          {availableModels.map((model) => (
            <div
              key={model.id}
              className="flex items-center bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-sm">
              <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center mr-1 text-xs">
                {model.avatar}
              </div>
              <span>{model.name}</span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
