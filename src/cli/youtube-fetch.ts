import { warning, setOutput } from '@actions/core';
import { resolve as resolvePath } from 'path';
import { promises as fs } from 'fs';
import { getNewVideos, getVideoUrl } from '../youtube';

type Logger = {
  warning: (message: string) => void;
};

const LAST_EXECUTION_DATE_ARTIFACT_NAME = 'last_execution_date';

const getLastExecutionDate = async (logger: Logger): Promise<Date> => {
  try {
    const expectedArtifactPath = resolvePath(__dirname, '../../', LAST_EXECUTION_DATE_ARTIFACT_NAME);
    const lastExecutionDate = await fs.readFile(expectedArtifactPath, { encoding: 'utf-8' });

    return new Date(lastExecutionDate);
  } catch (err) {
    logger.warning(`Could not read last execution date artifact: ${err}`);
    return new Date();
  }
};

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

  const channelVideos = await getNewVideos(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_CLIENT_REDIRECT_URI,
    JSON.parse(process.env.GOOGLE_OAUTH_CREDENTIALS),
    await getLastExecutionDate({ warning })
  );

  const output = new Array<string>();
  for (const { videos } of channelVideos) {
    for (const { id, channelTitle, title } of videos) {
      const videoUrl = getVideoUrl(id);
      output.push(`[${channelTitle} - ${title}] ${videoUrl}`);
    }
  }

  setOutput('videos', output);
}

main().catch((err: Error) => {
  console.error(err.stack);
  process.exit(1);
});
