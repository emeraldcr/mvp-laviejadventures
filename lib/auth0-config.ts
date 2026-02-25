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

export function getAuth0Issuer(): string | undefined {
  const issuer = process.env.AUTH0_ISSUER_BASE_URL?.trim();
  if (issuer) {
    return issuer.replace(/\/+$/, "");
  }

  const domain = normalizeAuth0Domain(process.env.AUTH0_DOMAIN);
  return domain ? `https://${domain}` : undefined;
}

export function getAuth0PasswordResetUrl(): string | undefined {
  const domain = normalizeAuth0Domain(process.env.AUTH0_DOMAIN);
  return domain ? `https://${domain}/dbconnections/change_password` : undefined;
}
