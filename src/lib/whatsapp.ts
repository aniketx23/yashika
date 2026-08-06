export const digitsOnly = (value: string): string => value.replace(/\D/g, '');

/** The RSVP has no backend by design — the reply is handed to WhatsApp. */
export const waLink = (number: string, text?: string): string =>
  `https://wa.me/${digitsOnly(number)}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
