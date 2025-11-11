import * as React from 'react'
import { useStore } from '@nanostores/react'
import { cn } from '#client/utils'
import * as stores from '#client/stores'

type ButtonSize = 'small' | 'normal'
type ButtonKind = 'primary' | 'secondary' | 'secondary-rounded'

type CommonProps = {
  size?: ButtonSize
  kind?: ButtonKind
}
type AProps = React.AnchorHTMLAttributes<HTMLAnchorElement>
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>
type SpanProps = React.HTMLAttributes<HTMLSpanElement>

type Props = (AProps | ButtonProps) & CommonProps

const isButton = (props: Props) => {
  if (props.type === 'submit') return true
  if ((props as AProps).href !== undefined) return false
  return props.onClick !== undefined
}

const SIZE_CLASSNAME: Record<ButtonSize, string> = {
  small: 'px-[12px] py-[6px]',
  normal: 'px-[12px] py-[6px]',
}

export const Button: React.FC<Props> = ({
  kind = 'secondary',
  size = 'normal',
  ...props
}) => {
  const isMirrorOn = useStore(stores.isMirrorOn)
  const theme = useStore(stores.theme)
  const isLightTheme = theme === 'light'

  const className = cn(
    'relative overflow-hidden whitespace-nowrap',
    'disabled:opacity-80',
    kind === 'primary' &&
      cn(
        isLightTheme
          ? // Light mode: simple, modern blue button with custom colors
            'button-primary border-0 rounded-md text-white transition-all disabled:cursor-not-allowed bg-[#0080FF] hover:bg-[#0066CC] active:bg-[#004C99] disabled:bg-[#80BFFF]'
          : // Dark/themed mode: accent-colored transparent border
            cn(
              'hover:bg-acc/10',
              'inline-flex justify-center items-center',
              'border border-acc text-acc py-8 transition-[background-color] rounded bg-transparent',
              'disabled:border-acc/40 disabled:text-acc/40'
            )
      ),
    kind === 'secondary' &&
      cn(
        'hover:bg-acc/10',
        'inline-flex justify-center items-center',
        'border border-acc text-acc py-8 transition-[background-color] rounded bg-transparent',
        'disabled:border-acc/40 disabled:text-acc/40'
      ),
    kind === 'secondary-rounded' &&
      cn(
        !isMirrorOn &&
          'before:content-[""] before:absolute before:inset-0 before:bg-bac before:z-[-1]',
        'hover:bg-acc/10',
        'inline-flex justify-center items-center transition-[background-color] rounded',
        'bg-transparent border border-acc text-acc rounded-[21px]',
        'disabled:border-acc/40 disabled:text-acc/40'
      ),
    'cursor-pointer',
    SIZE_CLASSNAME[size],
    'disabled:cursor-not-allowed',
    props.className
  )

  if (isButton(props))
    return (
      <button
        {...(props as ButtonProps)}
        className={cn(className, 'select-none')}
      />
    )

  const aProps = props as AProps
  return (
    <a
      {...aProps}
      className={className}
      rel={
        aProps.rel || (aProps.target === '_blank' ? 'noreferrer' : undefined)
      }
    />
  )
}

type GhostButtonProps = AProps | ButtonProps | SpanProps
export const GhostButton: React.FC<GhostButtonProps> = ({ ...props }) => {
  if (isButton(props)) {
    return (
      <button
        {...(props as ButtonProps)}
        className={cn(
          !!(props as ButtonProps).onClick &&
            '-ml-4 px-4 rounded cursor-pointer transition-[background-color] hover:bg-acc/10'
        )}
      />
    )
  }

  if ((props as AProps).href !== undefined) {
    return (
      <a
        {...(props as AProps)}
        className={cn(
          !!(props as AProps).href &&
            '-ml-4 px-4 rounded cursor-pointer transition-[background-color] hover:bg-acc/10'
        )}
      />
    )
  }

  return <span {...props} />
}
