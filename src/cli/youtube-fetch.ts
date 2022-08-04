import { getNewVideos } from '../youtube';

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

  if (!process.env.GOOGLE_OAUTH_CREDENTIALS) {
    throw new Error('GOOGLE_OAUTH_CREDENTIALS env is not set');
  }

  const videos = await getNewVideos(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_CLIENT_REDIRECT_URI,
    JSON.parse(process.env.GOOGLE_OAUTH_CREDENTIALS),
    new Date()
  );

  console.log(JSON.stringify(videos, null, 2));
}

main().catch((err: Error) => {
  console.error(err.stack);
  process.exit(1);
});
