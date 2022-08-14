import { getInput, info } from '@actions/core';
import { sendMesage } from '../telegram';
import { checkEnvironmentVariableSet } from './environment';

async function main() {
  const [botToken, chatId] = checkEnvironmentVariableSet('TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID');

  const fetchedVideos = getInput('videos', { required: true });
  const videos = JSON.parse(fetchedVideos) as string[];
  info(`Videos found: ${videos.length}`);

  for (const video of videos) {
    await sendMesage(chatId, video, botToken);
  }
}

main().catch((err: Error) => {
  console.error(err.stack);
  process.exit(1);
});
