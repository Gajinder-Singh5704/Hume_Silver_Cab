import { useState, useRef, useEffect } from "react";

function Modal({ open, onClose, children, labelledBy }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const closeOnEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEsc);
    return () => {
      document.removeEventListener("keydown", closeOnEsc);
    };
  }, [open, onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      onMouseDown={handleOverlayClick}
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
    >
      <div className="w-full max-w-[620px] rounded-3xl bg-white p-6 md:p-10 shadow-xl">
        {children}
      </div>
    </div>
  );
}

export default function WhoopsModal({ open, onClose, onOk }) {
  const okRef = useRef(null);

  useEffect(() => {
    if (open && okRef.current) okRef.current.focus();
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} labelledBy="whoops-heading">
      <div className="text-center">
        <h2
          id="whoops-heading"
          className="text-3xl md:text-4xl font-semibold tracking-wide text-orange-500"
        >
          Whoops
        </h2>

        <p className="mx-auto mt-6 max-w-[760px] text-lg md:text-2xl leading-snug text-black/90">
          Please check you’ve entered all required information
          <br className="hidden sm:block" />
           for your booking to proceed
        </p>

        <div className="mt-10">
          <button
            ref={okRef}
            onClick={() => {
              if (onOk) onOk();
              onClose();
            }}
            className="mx-auto inline-flex items-center justify-center rounded-2xl bg-orange-500 px-10 py-4 text-xl font-semibold text-white shadow hover:bg-orange-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-300 active:translate-y-px"
          >
            OK
          </button>
        </div>
      </div>
    </Modal>
  );
}

