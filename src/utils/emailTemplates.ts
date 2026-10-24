/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

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
