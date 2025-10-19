import { Check, X } from "lucide-react";

export default function ToggleSwitch({ enabled, onToggle }) {
  return (
    <div
      className={`flex items-center w-14 h-8 p-1 rounded-full cursor-pointer select-none transition-colors ${
        enabled ? "bg-green-500" : "bg-gray-300"
      }`}
       onClick={onToggle}
    >
      {/* Sliding circle */}
      <div
        className={`flex items-center justify-center bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${
          enabled ? "translate-x-6" : "translate-x-0"
        }`}
      >
        {enabled ? (
          <Check size={14} className="text-green-500" />
        ) : (
          <X size={14} className="text-gray-500" />
        )}
      </div>
    </div>
  );
}
