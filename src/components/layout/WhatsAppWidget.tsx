import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { m, AnimatePresence } from "framer-motion";

import { WHATSAPP_NUMBER } from "@/lib/contact";

// The WhatsApp number lives in src/lib/contact.ts (WHATSAPP_NUMBER) — that is
// the single place to change it. It is shared with the Home and Contact page
// CTAs so they never drift apart.
const DEFAULT_MESSAGE = "Hola, me gustaría más información sobre los productos de LABMAREMI.";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M16.001 3C9.107 3 3.5 8.607 3.5 15.5c0 2.42.678 4.68 1.855 6.605L3 29l7.09-2.31A12.44 12.44 0 0 0 16 28c6.894 0 12.5-5.607 12.5-12.5S22.895 3 16.001 3Zm0 22.688a10.15 10.15 0 0 1-5.176-1.42l-.371-.22-4.207 1.37 1.39-4.1-.242-.386a10.13 10.13 0 0 1-1.582-5.432c0-5.626 4.576-10.202 10.202-10.202 5.626 0 10.202 4.576 10.202 10.202 0 5.626-4.576 10.188-10.216 10.188Zm5.59-7.638c-.306-.153-1.81-.893-2.09-.994-.28-.102-.484-.153-.688.153-.204.306-.79.994-.968 1.198-.178.204-.357.23-.663.077-.306-.153-1.293-.477-2.463-1.52-.91-.812-1.525-1.815-1.703-2.121-.178-.306-.019-.472.134-.624.138-.137.306-.357.459-.535.153-.178.204-.306.306-.51.102-.204.05-.383-.026-.535-.077-.153-.688-1.658-.943-2.27-.248-.596-.5-.516-.688-.526l-.586-.01c-.204 0-.535.077-.815.383-.28.306-1.068 1.043-1.068 2.545 0 1.502 1.093 2.955 1.245 3.159.153.204 2.15 3.283 5.209 4.604.728.314 1.296.502 1.739.642.73.232 1.394.2 1.92.121.586-.087 1.81-.74 2.065-1.454.255-.714.255-1.325.178-1.454-.076-.128-.28-.204-.586-.357Z" />
    </svg>
  );
}

export default function WhatsAppWidget() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close the popup card when clicking anywhere outside the widget.
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (location.pathname.startsWith("/admin")) return null;

  const chatLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <div ref={containerRef} className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <m.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-72 rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="bg-[#075E54] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <WhatsAppIcon className="w-5 h-5 text-white" />
                <span className="text-white font-semibold text-sm">LABMAREMI</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="text-white/80 hover:text-white text-lg leading-none"
              >
                ×
              </button>
            </div>
            <div className="px-4 py-4">
              <p className="text-sm text-slate-700">
                ¿En qué podemos ayudarle? Escríbanos y le responderemos a la brevedad.
              </p>
              <a
                href={chatLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-2 w-full rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-semibold py-2.5 transition-colors"
              >
                <WhatsAppIcon className="w-4 h-4" />
                Iniciar chat
              </a>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir chat de WhatsApp"
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] shadow-lg flex items-center justify-center transition-transform hover:scale-105"
      >
        <WhatsAppIcon className="w-7 h-7 text-white" />
      </button>
    </div>
  );
}
