import config from '#server/config'
import axios from 'axios'

type Response = {
  _id: string
  email: string
  status: 'sent' | 'queued' | 'scheduled' | 'rejected' | 'invalid'
  reject_reason: string | null
  queued_reason: string | null
}[]

export async function sendEmail(props: {
  to: string
  subject: string
  html: string
}) {
  if (config.debug) {
    console.log(`📧 Email to ${props.to}: "${props.subject}"`)
    console.log(props.html)
    return
  }
  const response = await axios
    .post<Response>('https://mandrillapp.com/api/1.0/messages/send', {
      key: config.mailchimp.mandrillApiKey,
      message: {
        from_email: config.mailchimp.fromEmail,
        from_name: config.mailchimp.fromName,
        subject: props.subject,
        to: [{ email: props.to, type: 'to' }],
        html: props.html,
        track_opens: false,
        track_clicks: false,
        auto_text: true,
      },
    })
    .then((x) => x.data?.[0])
  // TODO: monitor rejected emails
  if (response?.status === 'rejected') {
    throw new Error(
      `Email to ${props.to} was rejected. (status: ${response?.status}, id: ${response?._id})`
    )
  }
  console.log(
    `📧 Email to ${props.to} (status: ${response?.status}, id: ${response?._id})`
  )
}
