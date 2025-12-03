import * as React from 'react'
import axios, { AxiosError } from 'axios'
import { Button, ErrorLine, Input, Link, P } from '#client/components/ui'
import { cn } from '#client/utils'
import { render } from '#client/utils/render'
import config from '#client/config'
import '#client/stores/theme'
import { Layout } from '#client/components/ui'

const App = () => {
  return (
    <Layout>
      <div className="flex flex-col gap-4 md:gap-0 tablet:flex-row justify-between items-baseline mb-24">
        <p>{config.appDescription}</p>
        <Link
          href="https://institute.lot-systems.com"
          rel="external"
          target="_blank"
          className="underline tablet:no-underline whitespace-nowrap pr-8"
        >
          Institute <span className="tablet:inline" style={{fontFamily: 'inherit', fontVariantEmoji: 'text' as any}}>↗</span>
        </Link>
      </div>
      <EmailLogin />
    </Layout>
  )
}

const EmailLogin = () => {
  const formRef = React.useRef<HTMLFormElement>(null)
  const [step, setStep] = React.useState<'email' | 'code'>('email')
  const [email, setEmail] = React.useState('')
  const [code, setCode] = React.useState('')
  const [token, setToken] = React.useState('')
  const [errorMessage, setErrorMessage] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  const onSubmit = React.useCallback(
    (ev: React.FormEvent) => {
      ev.preventDefault()
      if (step === 'email') {
        setIsLoading(true)
        axios
          .post('/auth/send-code', { email })
          .then(({ data }) => {
            const token = data.token
            setToken(token)
            setStep('code')
            setIsLoading(false)
          })
          .catch((_err) => {
            const err = _err as AxiosError<{ message: string }>
            const message =
              err.response?.data.message || 'Unknown error. Please try again.'
            setErrorMessage(message)
            setIsLoading(false)
          })
      } else if (step === 'code') {
        setIsLoading(true)
        axios
          .post('/auth/email/code', { email, code, token })
          .then(() => {
            setIsLoading(false)
            window.location.href = '/'
          })
          .catch((_err) => {
            const err = _err as AxiosError<{ message: string }>
            const message =
              err.response?.data.message || 'Unknown error. Please try again.'
            setErrorMessage(message)
            setIsLoading(false)
          })
      }
    },
    [step, email, code, token]
  )

  React.useEffect(() => {
    setErrorMessage('')
  }, [code, email, step])

  React.useEffect(() => {
    const input = formRef.current?.querySelector(
      'input[type="email"]'
    ) as HTMLInputElement
    if (input) {
      input.focus()
    }
  }, [])

  React.useEffect(() => {
    if (step === 'code') {
      const input = formRef.current?.querySelector(
        'input[type="text"]'
      ) as HTMLInputElement
      if (input) {
        input.focus()
      }
    }
  }, [step])

  return (
    <div>
      <form onSubmit={onSubmit} ref={formRef}>
        <div className="flex gap-x-8">
          <Input
            type="email"
            name="email"
            value={email}
            onChange={setEmail}
            placeholder="Email"
            className={cn(step === 'code' && 'text-acc/40')}
            disabled={step === 'code'}
            enterKeyHint="next"
            required
          />
          {step === 'email' && (
            <Button type="submit" kind="primary" disabled={isLoading}>
              Access code
            </Button>
          )}
        </div>
        {step === 'email' && !!errorMessage && (
          <div className="my-16">
            <ErrorLine>{errorMessage}</ErrorLine>
          </div>
        )}
        {step === 'code' && (
          <>
            <P>
              A temporary sign up code has been sent to you. Please check your
              inbox.
            </P>

            <div className="flex gap-x-8">
              <Input
                type="text"
                name="verification_code"
                value={code}
                onChange={setCode}
                placeholder="Code"
                enterKeyHint="done"
                inputMode="numeric"
                required
              />
              <Button type="submit" kind="primary" disabled={isLoading}>
                Log in
              </Button>
            </div>

            {!!errorMessage && (
              <div className="my-16">
                <ErrorLine>{errorMessage}</ErrorLine>
              </div>
            )}
          </>
        )}
      </form>
    </div>
  )
}

render(<App />)
