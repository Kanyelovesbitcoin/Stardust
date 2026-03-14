export default {
  providers: [
    {
      type: 'customJwt' as const,
      issuer: 'https://qrdvcxfhmduaptlzbvas.supabase.co/auth/v1',
      jwks: 'https://qrdvcxfhmduaptlzbvas.supabase.co/auth/v1/.well-known/jwks.json',
      algorithm: 'ES256' as const,
      applicationID: 'authenticated',
    },
  ],
};
