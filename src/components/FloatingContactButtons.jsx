import React from "react";

/**
 * FloatingContactButtons
 * Props:
 *  - whatsappNumber: string (in international format, e.g. +61412345678)
 *  - callNumber: string (in international format, e.g. +61456789012)
 *  - whatsappMessage: string (optional)
 *  - showCall: boolean
 *  - showWhatsapp: boolean
 *  - className: string (optional)
 */

const FloatingContactButtons = ({
  whatsappNumber = "+61412345678",
  callNumber = "+61456789012",
  whatsappMessage = "",
  showCall = true,
  showWhatsapp = true,
  className = "",
}) => {
  const openWhatsApp = (e) => {
    e.preventDefault();
    const cleaned = whatsappNumber.replace(/[^+0-9]/g, "").replace(/^\+/, "");
    const base = `https://wa.me/${cleaned}`;
    const payload = whatsappMessage
      ? `?text=${encodeURIComponent(whatsappMessage)}`
      : "";
    window.open(`${base}${payload}`, "_blank");
  };

  return (
    <div
      className={`fixed right-4 bottom-4 flex flex-col items-end gap-3 z-50 ${className}`}
    >
      {showWhatsapp && (
        <a
          onClick={openWhatsApp}
          href="#whatsapp"
          role="button"
          aria-label="Chat on WhatsApp"
          title="Chat on WhatsApp"
          className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-2xl bg-green-500 hover:scale-105 transform transition-all"
        >
          {/* WhatsApp icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="white"
            className="w-7 h-7"
          >
            <path d="M20.52 3.48A11.92 11.92 0 0 0 12 .5 11.93 11.93 0 0 0 .5 12c0 2.1.55 4.11 1.6 5.9L0 24l6.33-1.62A11.9 11.9 0 0 0 12 23.5c6.62 0 11.98-5.36 11.98-11.98 0-3.2-1.25-6.2-3.46-8.04zM12 21.5c-1.76 0-3.47-.45-4.98-1.3l-.36-.2-3.76.96.98-3.66-.23-.37A9.5 9.5 0 1 1 21.5 12 9.5 9.5 0 0 1 12 21.5z" />
            <path d="M17.3 14.2c-.3-.15-1.75-.86-2.02-.96-.27-.1-.46-.15-.65.15-.19.28-.75.96-.92 1.16-.17.19-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.31-.02-.48.13-.63.13-.13.3-.35.45-.53.15-.19.2-.31.3-.51.1-.2 0-.39-.05-.54-.05-.15-.65-1.54-.9-2.12-.24-.55-.49-.48-.65-.49-.17-.01-.37-.01-.57-.01-.2 0-.53.07-.81.34-.28.27-1.07 1.04-1.07 2.54s1.1 2.95 1.25 3.15c.15.19 2.15 3.28 5.2 4.6 3.05 1.31 3.05.87 3.6.82.55-.05 1.77-.72 2.02-1.41.25-.69.25-1.29.18-1.41-.07-.12-.27-.19-.57-.34z" />
          </svg>
        </a>
      )}

      {showCall && (
        <a
          href={`tel:${callNumber}`}
          role="button"
          aria-label="Call us"
          title="Call us"
          className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-2xl bg-blue-600 hover:scale-105 transform transition-all"
        >
          {/* Phone icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="white"
            className="w-6 h-6"
          >
            <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24 11.36 11.36 0 0 0 3.58.57 1 1 0 0 1 1 1v3.61a1 1 0 0 1-1 1A17 17 0 0 1 3 5a1 1 0 0 1 1-1h3.62a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.58 1 1 0 0 1-.24 1.01l-2.33 2.2z" />
          </svg>
        </a>
      )}
    </div>
  );
};

export default FloatingContactButtons;
