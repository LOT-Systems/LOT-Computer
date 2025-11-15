export const verificationEmailTemplate = (
  code: string,
  version?: string,
  date?: string
) => `
Welcome to LOT!

Your verification code is: ${code}

This code will expire in 10 minutes.

${date ? `Date: ${date}` : ''}
${version ? `Version: ${version}` : ''}
`.trim();
