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
  small: 'px-[11px] py-4',
  normal: 'px-[20px] py-8',
}

export const Button: React.FC<Props> = ({
  kind = 'secondary',
  size = 'normal',
  ...props
}) => {
  const isMirrorOn = useStore(stores.isMirrorOn)
  const className = cn(
    'relative overflow-hidden whitespace-nowrap',
    'disabled:opacity-80',
    kind === 'primary' &&
      cn(
        'button-primary border rounded text-black bg-blue border-blue-dark shadow-[white_inset_0_0_4px_0] transition-all hover:bg-blue-light hover:border-blue dark:bg-white dark:text-black-total dark:border-white dark:hover:bg-gray'
      ),
    kind === 'secondary' &&
      cn(
        !isMirrorOn &&
          'before:content-[""] before:absolute before:inset-0 before:bg-bac before:z-[-1]',
        'hover:bg-acc-300/20',
        'inline-flex justify-center items-center',
        'border border-acc text-acc py-8 transition-[background-color] rounded bg-transparent',
        'disabled:border-acc-300/40 disabled:text-acc-300/40'
      ),
    kind === 'secondary-rounded' &&
      cn(
        !isMirrorOn &&
          'before:content-[""] before:absolute before:inset-0 before:bg-bac before:z-[-1]',
        'hover:bg-acc-300/20',
        'inline-flex justify-center items-center transition-[background-color] rounded',
        'bg-transparent border border-acc text-acc rounded-[21px]',
        'disabled:border-acc-300/40 disabled:text-acc-300/40'
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
            '-ml-4 px-4 rounded cursor-pointer transition-[background-color] hover:bg-acc-400/10'
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
            '-ml-4 px-4 rounded cursor-pointer transition-[background-color] hover:bg-acc-400/10'
        )}
      />
    )
  }

  return <span {...props} />
}
