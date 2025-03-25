import React from "react";
import { Loader2 } from "lucide-react";
import { ModelType } from "../types";

type TrainingOverlayProps = {
  isVisible: boolean;
  availableModels: ModelType[];
};

const TrainingOverlay: React.FC<TrainingOverlayProps> = ({
  isVisible,
  availableModels,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center">
        <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4 text-indigo-600" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Processing 3D assest Information
        </h2>
        <p className="text-gray-600 mb-4">
          Analyzing your 3D assest data with Mistral AI...
        </p>
        <div className="space-y-4">
          {availableModels.map((model) => (
            <div key={model.id} className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center mr-3">
                {model.avatar}
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {model.name}
                  </span>
                  <span className="text-sm text-indigo-600">Processing...</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-indigo-600 h-2.5 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrainingOverlay;
