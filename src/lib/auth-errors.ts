export function authErrorMessage(error: { error: string }) {
  const messages: Record<string, string> = {
    INVALID_EMAIL: "Bitte gib eine gültige E-Mail-Adresse ein.",
    INVALID_CREDENTIALS: "E-Mail-Adresse oder Passwort stimmen nicht.",
    EMAIL_TAKEN: "Für diese E-Mail-Adresse gibt es bereits ein Konto.",
    EMAIL_NOT_FOUND: "Für diese E-Mail-Adresse wurde kein Konto gefunden.",
    EMAIL_NOT_VERIFIED: "Bitte bestätige zuerst deine E-Mail-Adresse.",
    RATE_LIMITED: "Zu viele Versuche. Bitte warte etwas und versuche es erneut.",
    PASSWORD_TOO_SHORT: "Bitte wähle ein längeres Passwort (mindestens 10 Zeichen).",
    PASSWORD_TOO_LONG: "Dieses Passwort ist zu lang.",
    PASSWORD_TOO_COMMON: "Dieses Passwort ist zu häufig. Bitte wähle ein anderes.",
    PASSWORD_HAS_SURROUNDING_WHITESPACE:
      "Das Passwort darf nicht mit Leerzeichen beginnen oder enden.",
    MISSING_SECRET:
      "Öffne den Link in derselben App oder demselben Browser, in dem du ihn angefordert hast.",
    INVALID_CHALLENGE:
      "Dieser Link ist abgelaufen oder wurde bereits verwendet. Bitte fordere einen neuen an.",
    INCORRECT_CODE: "Dieser Link ist ungültig. Bitte fordere einen neuen an.",
  };
  return messages[error.error] ?? "Das hat nicht geklappt. Bitte versuche es erneut.";
}
