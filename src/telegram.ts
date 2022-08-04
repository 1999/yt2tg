export const sendMesage = async (chatId: string, text: string, token: string): Promise<void> => {
  const { default: fetch } = await import('node-fetch');
  const urlPath = `/bot${token}/sendMessage`;
  const urlObj = new URL(urlPath, 'https://api.telegram.org');

  const body = {
    chat_id: chatId,
    text,
    disable_notification: true,
  };

  const resp = await fetch(urlObj.toString(), {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    method: 'POST',
  });

  const response = (await resp.json()) as { ok: boolean };
  if (!response.ok) {
    throw new Error(`Failed to send message to Telegram (${resp.status})`);
  }
};
