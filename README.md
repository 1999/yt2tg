# yt2tg

Sends new videos from your YouTube subscriptions page to Telegram.

## Environment variables

* GOOGLE_OAUTH_CLIENT_ID
* GOOGLE_OAUTH_CLIENT_SECRET
* GOOGLE_OAUTH_CLIENT_REDIRECT_URI

You can get these in [Google Developer Console](https://console.developers.google.com/). Don't forget to enrol into
YouTube Data API and People API.

* GOOGLE_OAUTH_CREDENTIALS (run `npm run token` and save the output as a serialised string)

## How to use

1. Run `npm run token` to get the credentials to run YouTube scripts
2. Run `npm run youtube` to fetch new videos
3. Run `npm run telegram` to send messages
