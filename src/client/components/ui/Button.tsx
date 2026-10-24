/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

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
type InnerProps = AProps | ButtonProps

const isButton = (props: InnerProps): boolean => {
  if ((props as ButtonProps).type === 'submit') return true
  if ((props as AProps).href !== undefined) return false
  return (props as ButtonProps).onClick !== undefined
}

const SIZE_CLASSNAME: Record<ButtonSize, string> = {
  small: 'px-[18px] py-[6px]',
  normal: 'px-[18px] py-[6px] min-h-[42px]',
}

const BASE = cn(
  'relative overflow-hidden whitespace-nowrap',
  'disabled:opacity-30',
  'inline-flex justify-center items-center',
  'text-base leading-1.5',
  'cursor-pointer',
  'disabled:cursor-not-allowed'
)

function renderEl(props: InnerProps, className: string): React.ReactElement {
  if (isButton(props))
    return (
      <button {...(props as ButtonProps)} className={cn(className, 'select-none')} />
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

// Subscribes to stores.theme only — rendered when kind === 'primary'
const PrimaryBtn: React.FC<{ size: ButtonSize } & InnerProps> = ({
  size,
  ...props
}) => {
  const theme = useStore(stores.theme)
  const isLightTheme = theme === 'light'
  return renderEl(
    props as InnerProps,
    cn(
      BASE,
      isLightTheme
        ? 'button-primary border-0 rounded-md text-white transition-all disabled:cursor-not-allowed bg-[#0080FF] hover:bg-[#0066CC] active:bg-[#004C99] disabled:bg-[#80BFFF]'
        : cn(
            'grid-fill-hover',
            'border border-acc text-acc rounded bg-transparent',
            'disabled:border-acc/40 disabled:text-acc/40'
          ),
      SIZE_CLASSNAME[size],
      props.className
    )
  )
}

// Subscribes to stores.isMirrorOn only — rendered when kind === 'secondary-rounded'
const SecondaryRoundedBtn: React.FC<{ size: ButtonSize } & InnerProps> = ({
  size,
  ...props
}) => {
  const isMirrorOn = useStore(stores.isMirrorOn)
  return renderEl(
    props as InnerProps,
    cn(
      BASE,
      !isMirrorOn &&
        'before:content-[""] before:absolute before:inset-0 before:bg-bac before:z-[-1]',
      isMirrorOn
        ? 'hover:bg-white/10 transition-[background-color] border border-white text-white rounded-[21px] disabled:border-white/40 disabled:text-white/40'
        : 'grid-fill-hover bg-transparent border border-acc text-acc rounded-[21px] disabled:border-acc/40 disabled:text-acc/40',
      SIZE_CLASSNAME[size],
      props.className
    )
  )
}

export const Button: React.FC<Props> = ({
  kind = 'secondary',
  size = 'normal',
  ...props
}) => {
  if (kind === 'primary')
    return <PrimaryBtn size={size} {...(props as InnerProps)} />
  if (kind === 'secondary-rounded')
    return <SecondaryRoundedBtn size={size} {...(props as InnerProps)} />

  // secondary: no store subscriptions
  return renderEl(
    props as InnerProps,
    cn(
      BASE,
      'grid-fill-hover',
      'border border-acc text-acc rounded bg-transparent',
      'disabled:border-acc/40 disabled:text-acc/40',
      SIZE_CLASSNAME[size],
      props.className
    )
  )
}

type GhostButtonProps = AProps | ButtonProps | SpanProps
export const GhostButton: React.FC<GhostButtonProps> = ({ ...props }) => {
  if (isButton(props as InnerProps)) {
    return (
      <button
        {...(props as ButtonProps)}
        className={cn(
          !!(props as ButtonProps).onClick &&
            '-ml-4 px-4 rounded cursor-pointer grid-fill-hover'
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
            '-ml-4 px-4 rounded cursor-pointer grid-fill-hover'
        )}
      />
    )
  }

  return <span {...props} />
}
