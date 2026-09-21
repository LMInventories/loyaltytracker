/**
 * Single source of truth for the legal identity shown on /privacy and /terms.
 *
 * TODO before launch: replace every "[...]" placeholder below. UK GDPR
 * requires the privacy notice to name the data controller and give contact
 * details. Anything still in square brackets is a launch blocker.
 */
export const LEGAL = {
  // The legal person that operates Local Loyalty — a registered company name,
  // or your own name if you're operating as a sole trader.
  entityName: "[Company or trading name]",
  // e.g. "Registered in England and Wales, company number 01234567".
  registrationLine: "[Registered in England and Wales, company number XXXXXXXX]",
  // Postal address where you can be reached.
  address: "[Registered office / contact address]",
  // ICO data protection fee registration number (ZAxxxxxx). Most UK
  // organisations that process personal data must register and pay the fee
  // unless an exemption applies: https://ico.org.uk/for-organisations/data-protection-fee/
  icoRegistrationNumber: "[ICO registration number]",
  // Prefer an address on your own domain over a personal Gmail account.
  contactEmail: "localloyaltydev@gmail.com",
  privacyLastUpdated: "21 September 2026",
  termsLastUpdated: "21 September 2026",
} as const;
