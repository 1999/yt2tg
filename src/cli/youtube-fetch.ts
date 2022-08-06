import { info, warning, setOutput } from '@actions/core';
import { getNewVideos, getVideoUrl } from '../youtube';

async function main() {
  const since = new Date();
  since.setHours(since.getHours() - 1);
  info(`Fetching videos since ${since}`);

  // if (!process.env.GOOGLE_OAUTH_CLIENT_ID) {
  //   throw new Error('GOOGLE_OAUTH_CLIENT_ID env is not set');
  // }
  //
  // if (!process.env.GOOGLE_OAUTH_CLIENT_SECRET) {
  //   throw new Error('GOOGLE_OAUTH_CLIENT_SECRET env is not set');
  // }
  //
  // if (!process.env.GOOGLE_OAUTH_CLIENT_REDIRECT_URI) {
  //   throw new Error('GOOGLE_OAUTH_CLIENT_REDIRECT_URI env is not set');
  // }
  //
  // if (!process.env.GOOGLE_OAUTH_CREDENTIALS) {
  //   throw new Error('GOOGLE_OAUTH_CREDENTIALS env is not set');
  // }

  process.env.GOOGLE_OAUTH_CLIENT_ID = '786228919943-fcln3p4nv863k65cdht7m2ltf8npke3e.apps.googleusercontent.com';
  process.env.GOOGLE_OAUTH_CLIENT_SECRET = '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';
  process.env.GOOGLE_OAUTH_CLIENT_REDIRECT_URI = 'http://localhost:3000/oauth2callback';

  process.env.GOOGLE_OAUTH_CREDENTIALS = JSON.stringify({
    access_token:
      'ya29.A0AVA9y1tzF6ubid7BFAKlPeZiBMZJwFPyQnp_dde2KabzNn-3abDzwFLrvP7rKMRAzZ71o8kDi9YgyPyZ9wfmab2_AFB7vcMHAmx5mRt84qXTyGkO1tYxHTus-9RqcS9XHXTWSRt8cQyXHNUwTwPib6OGWEEgYUNnWUtBVEFTQVRBU0ZRRTY1ZHI4OUNzaURQN3B1T0hQbzhjVGlqS3NoQQ0163',
    refresh_token:
      '1//0gYSWBoY7u_dWCgYIARAAGBASNwF-L9IroyMDTHbf5JNvCU4qzMISRxqXFDX1TUTxQf_evnvdJ65J5vpyuuRZO8i6j15KpnziFGs',
    scope:
      'https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtubepartner https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtubepartner-channel-audit https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.channel-memberships.creator',
    token_type: 'Bearer',
    expiry_date: 1659447701173,
  });

  const channelVideos = await getNewVideos(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_CLIENT_REDIRECT_URI,
    JSON.parse(process.env.GOOGLE_OAUTH_CREDENTIALS),
    since
  );

  const output = new Array<string>();
  for (const { channel, videos } of channelVideos) {
    for (const video of videos) {
      const message = `[${video.id}] ${channel.title} - ${video.title}`;
      output.push(message);
    }
  }

  setOutput('videos', output);
}

main().catch((err: Error) => {
  console.error(err.stack);
  process.exit(1);
});
