import { getInput, info } from '@actions/core';
import { sendMesage } from '../telegram';

async function main() {
  const botToken = getInput('telegram_bot_token', { required: true });
  const chatId = getInput('telegram_chat_id', { required: true });
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
