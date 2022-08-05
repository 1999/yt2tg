import { sendMesage } from '../telegram';

async function main() {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN env is not set');
  }

  if (!process.env.TELEGRAM_CHAT_ID) {
    throw new Error('TELEGRAM_CHAT_ID env is not set');
  }

  await sendMesage(
    process.env.TELEGRAM_CHAT_ID,
    'Function executed through Github actions',
    process.env.TELEGRAM_BOT_TOKEN
  );
}

main().catch((err: Error) => {
  console.error(err.stack);
  process.exit(1);
});
