try {
  console.log('Generating verification code for:', email);
  const code = crypto.randomInt(1e5, 1e6 - 1).toString()
  const token = crypto.randomBytes(16).toString('hex')
  const magicLinkToken = crypto.randomBytes(32).toString('hex')

  console.log('Creating email code record');
  await fastify.models.EmailCode.create({
    code,
    token,
    email,
    magicLinkToken,
    validUntil: dayjs()
      .add(EMAIL_CODE_VALID_MINUTES, 'minutes')
      .toDate(),
  })

  console.log('Sending verification email');
  const emailResult = await sendEmail({
    to: email,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Welcome to Lot Systems</h2>
        <p>Your verification code is: <strong style="font-size: 24px; color: #4A5568;">${code}</strong></p>
        <p>This code will expire in ${EMAIL_CODE_VALID_MINUTES} minutes.</p>
      </div>
    `,
    subject: `Your Lot Systems Verification Code`,
  });

  if (!emailResult.success) {
    throw new Error('Failed to send email');
  }

  console.log('Email sent successfully to:', email);
  return { token }
} catch (err) {
  console.error('Email sending error:', err);
  return reply.throw.internalError(
    'Unable to send sign up code. The problem was reported. Please try again later.'
  )
}
