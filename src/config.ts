/** Everything the host may want to change without touching a component. */
export const INVITE = {
  venueName: 'The Farms',
  venueAddress: 'Mudimyal, Moinabad, Hyderabad, Telangana 501503',
  venueMapUrl: 'https://maps.app.goo.gl/kq4XZuCdsyTXTVdi9?g_st=iw',
  /**
   * RSVP delivery only — never rendered. A group invite URL cannot carry a
   * pre-filled message, so the reply still has to go to a person.
   */
  whatsappNumber: '919837266622',
  /** Where guests are sent to talk to everyone. */
  whatsappGroupUrl: 'https://chat.whatsapp.com/IN3o2BCKvRI8y60y19eMTP?s=sh&p=i&ilr=2&amv=1',
  showAwaits: true,
  meteorRate: 2,
  /** 8 Aug 2026, 20:08 IST. */
  target: Date.UTC(2026, 7, 8, 14, 38, 0),
} as const;
