

export default function CabUnavailableModal({
  open = false,
  onClose = () => {},
  title = "Sorry, we don't offer cabs in\nthis area",
  subtitle = 'Please contact the local cab company',
  buttonLabel = 'OK',
}) {
  if (!open) return null

  return (
    // overlay
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      {/* dim background */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-none"
        onClick={onClose}
      />

      {/* modal card */}
      <div className="relative z-10 w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-10 sm:p-12">
        {/* Header (centered) */}
        <div className="text-center">
          <h2 className="whitespace-pre-line text-3xl sm:text-4xl font-extrabold text-orange-600 leading-tight">
            {title}
          </h2>

          <p className="mt-6 text-lg sm:text-xl text-gray-800 font-medium">
            {subtitle}
          </p>
        </div>

        {/* Button area */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={onClose}
            className="w-64 sm:w-80 text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-200 rounded-lg py-4 text-lg font-semibold shadow-sm"
          >
            {buttonLabel}
          </button>
        </div>

        {/* optional close icon top-right */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-2 rounded-md hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

/*
Notes & tips:
- This component uses Tailwind utility classes. Ensure Tailwind is configured in your project.
- The overlay (background dim) closes modal when clicked. If you want to disable that, remove the onClick from the absolute overlay div.
- The text uses `whitespace-pre-line` so the default `title` contains a `\n` to wrap exactly like the screenshot. You can pass a single-line title or use your own markup.
- You can easily add transition animations using Tailwind's transition classes or a library like Headless UI / Framer Motion.
- Accessibility: the component uses role="dialog" and aria-modal="true". For full accessibility (keyboard focus trap) consider adding focus trap logic (e.g., use-focus-trap or Headless UI Dialog).
*/
