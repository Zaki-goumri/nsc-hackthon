export const CONTACT_PREFS = {
    WHATSAPP: 'whatsapp',
    EMAIL: 'email',
    SMS: 'sms',
    CALL: 'call',
  } as const;
  
  export type ContactPref = (typeof CONTACT_PREFS)[keyof typeof CONTACT_PREFS];
  export const CONTACT_PREF_VALUES = Object.values(CONTACT_PREFS) as ContactPref[];