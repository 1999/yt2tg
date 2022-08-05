import { info, warning, setOutput } from '@actions/core';
import { getNewVideos, getVideoUrl } from '../youtube';

async function main() {
  const since = new Date();
  since.setHours(since.getHours() - 1);
  info(`Fetching videos since ${since}`);

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

  const channelVideos = await getNewVideos(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_CLIENT_REDIRECT_URI,
    JSON.parse(process.env.GOOGLE_OAUTH_CREDENTIALS),
    since
  );

  const output = new Array<string>();
  for (const { videos } of channelVideos) {
    for (const { id } of videos) {
      const videoUrl = getVideoUrl(id);
      output.push(videoUrl);
    }
  }

  setOutput('videos', output);
}

main().catch((err: Error) => {
  console.error(err.stack);
  process.exit(1);
});
