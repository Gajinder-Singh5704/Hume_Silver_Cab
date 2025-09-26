export default function ToggleSwitch({enabled, onToggle}) {
  

  return (
    <div
      className={`flex items-center w-14 h-8 p-1 rounded-full cursor-pointer select-none transition-colors ${
        enabled ? "bg-green-500" : "bg-red-500"
      }`}
      onClick={() => onToggle(!enabled)}
    >
      {/* Sliding circle */}
      <div
        className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${
          enabled ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </div>
  );
}
