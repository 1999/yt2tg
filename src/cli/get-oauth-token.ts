import { getOAuthTokens } from '../auth';

async function main() {
  if (!process.env.GOOGLE_OAUTH_CLIENT_ID) {
    throw new Error('GOOGLE_OAUTH_CLIENT_ID env is not set');
  }

  if (!process.env.GOOGLE_OAUTH_CLIENT_SECRET) {
    throw new Error('GOOGLE_OAUTH_CLIENT_SECRET env is not set');
  }

  if (!process.env.GOOGLE_OAUTH_CLIENT_REDIRECT_URI) {
    throw new Error('GOOGLE_OAUTH_CLIENT_REDIRECT_URI env is not set');
  }

  const tokens = await getOAuthTokens(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_CLIENT_REDIRECT_URI
  );

  console.log(JSON.stringify(tokens));
}

main().catch((err: Error) => {
  console.error(err.stack);
  process.exit(1);
});
