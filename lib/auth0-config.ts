const protocolPattern = /^https?:\/\//i;

function normalizeAuth0Domain(input?: string | null): string | undefined {
  const trimmed = input?.trim();
  if (!trimmed) {
    return undefined;
  }

  const withoutProtocol = trimmed.replace(protocolPattern, "");
  const domain = withoutProtocol.replace(/\/+$/, "");

  return domain || undefined;
}

function normalizeAuth0Issuer(input?: string | null): string | undefined {
  const trimmed = input?.trim();
  if (!trimmed) {
    return undefined;
  }

  const withProtocol = protocolPattern.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    return `${url.protocol}//${url.host}`;
  } catch {
    return undefined;
  }
}

function normalizeAbsoluteUrl(input?: string | null): string | undefined {
  const trimmed = input?.trim();
  if (!trimmed) {
    return undefined;
  }

  const withProtocol = protocolPattern.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    return `${url.protocol}//${url.host}`;
  } catch {
    return undefined;
  }
}

export function getAuth0Issuer(): string | undefined {
  const issuer = normalizeAuth0Issuer(
    process.env.AUTH0_ISSUER_BASE_URL ?? process.env.AUTH0_ISSUER
  );
  if (issuer) {
    return issuer;
  }

  const domain = normalizeAuth0Domain(process.env.AUTH0_DOMAIN);
  return domain ? `https://${domain}` : undefined;
}

export function getAuth0PasswordResetUrl(): string | undefined {
  const domain = normalizeAuth0Domain(process.env.AUTH0_DOMAIN);
  return domain ? `https://${domain}/dbconnections/change_password` : undefined;
}

export function getAuth0CallbackUrl(): string | undefined {
  const explicitCallback = normalizeAbsoluteUrl(process.env.AUTH0_CALLBACK_URL);
  if (explicitCallback) {
    return explicitCallback;
  }

  const appBaseUrl = normalizeAbsoluteUrl(process.env.APP_BASE_URL ?? process.env.AUTH_URL);
  return appBaseUrl ? `${appBaseUrl}/api/auth/callback/auth0` : undefined;
}
