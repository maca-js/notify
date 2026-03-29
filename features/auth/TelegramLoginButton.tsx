"use client";

import Script from "next/script";

type Props = {
  botUsername: string;
  authUrl: string;
};

export function TelegramLoginButton({ botUsername, authUrl }: Props) {
  return (
    <div className="flex justify-center">
      <Script
        src="https://telegram.org/js/telegram-widget.js#22"
        data-telegram-login={botUsername}
        data-size="large"
        data-auth-url={authUrl}
        data-request-access="write"
        strategy="lazyOnload"
      />
    </div>
  );
}
