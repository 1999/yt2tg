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

  info('VIDEOS: ' + process.env.VIDEOS + '.');
  const videos = JSON.parse(process.env.VIDEOS) as string[];
  info(`Videos found: ${videos.length}`);

  const ops = new Array<Promise<void>>();
  for (const video of videos) {
    ops.push(sendMesage(process.env.TELEGRAM_CHAT_ID, video, process.env.TELEGRAM_BOT_TOKEN));
  }

  await Promise.all(ops);
}

main().catch((err: Error) => {
  console.error(err.stack);
  process.exit(1);
});
