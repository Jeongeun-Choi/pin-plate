interface SendAuthEmailParams {
  apiKey: string;
  from: string;
  subject: string;
  text: string;
  to: string;
}

interface SendVerificationEmailParams {
  apiKey: string;
  from: string;
  to: string;
  url: string;
}

interface SendPasswordResetEmailParams {
  apiKey: string;
  from: string;
  to: string;
  url: string;
}

const RESEND_EMAIL_API_URL = 'https://api.resend.com/emails';

const sendAuthEmail = async ({
  apiKey,
  from,
  subject,
  text,
  to,
}: SendAuthEmailParams): Promise<void> => {
  const response = await fetch(RESEND_EMAIL_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      text,
    }),
  });

  if (!response.ok) {
    const responseBody = await response.text();

    throw new Error(
      `Resend email request failed with ${response.status}: ${responseBody}`,
    );
  }
};

export const sendVerificationEmail = ({
  apiKey,
  from,
  to,
  url,
}: SendVerificationEmailParams): Promise<void> =>
  sendAuthEmail({
    apiKey,
    from,
    to,
    subject: 'Pin Plate 이메일 인증',
    text: `아래 링크를 열어 Pin Plate 이메일 인증을 완료해 주세요.\n\n${url}`,
  });

export const sendPasswordResetEmail = ({
  apiKey,
  from,
  to,
  url,
}: SendPasswordResetEmailParams): Promise<void> =>
  sendAuthEmail({
    apiKey,
    from,
    to,
    subject: 'Pin Plate 비밀번호 재설정',
    text: `아래 링크를 열어 Pin Plate 비밀번호를 재설정해 주세요.\n\n${url}`,
  });
