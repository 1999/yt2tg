import { info } from '@actions/core';
import { sendMesage } from '../telegram';

async function main() {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN env is not set');
  }

  if (!process.env.TELEGRAM_CHAT_ID) {
    throw new Error('TELEGRAM_CHAT_ID env is not set');
  }

  if (!process.env.VIDEOS) {
    throw new Error('VIDEOS env is not set');
  }

  const videos = JSON.parse(process.env.VIDEOS) as string[];
  info(`Videos found: ${videos.length}`);

  for (const video of videos) {
    await sendMesage(process.env.TELEGRAM_CHAT_ID, video, process.env.TELEGRAM_BOT_TOKEN);
  }
}

main().catch((err: Error) => {
  console.error(err.stack);
  process.exit(1);
});
