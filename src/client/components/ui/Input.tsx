import React from 'react'
import { cn } from '#client/utils'

type InputType =
  | 'date'
  | 'datetime-local'
  | 'email'
  | 'hidden'
  | 'month'
  | 'number'
  | 'password'
  | 'search'
  | 'tel'
  | 'text'
  | 'time'
  | 'url'
  | 'week'

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  type: InputType
  onChange?: (value: string) => void
  containerClassName?: string
}

const CLASS_NAME = cn(
  'px-[20px] py-8',
  'border border-acc text-base leading-1.5 transition-colors rounded',
  'hover:bg-acc/10 active:bg-acc/10',
  'bg-transparent placeholder:text-acc/40 focus:placeholder:text-acc/20 min-h-[42px]'
)

export const Input: React.FC<Props> = ({
  className,
  containerClassName,
  onChange,
  value,
  ...props
}) => {
  const onChangeHandler = React.useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      if (!onChange) return
      onChange(ev.target.value)
    },
    [onChange]
  )
  return (
    <div className={cn(containerClassName)}>
      <input
        className={cn(CLASS_NAME, className)}
        value={value}
        onChange={onChangeHandler}
        {...props}
      />
    </div>
  )
}

type SelectProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'onChange'
> & {
  options: Array<{
    label: string
    value: string
    disabled?: boolean
  }>
  placeholder?: string
  onChange?: (value: string) => void
  containerClassName?: string
}
export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  containerClassName,
  ...props
}) => {
  const onChangeHandler = React.useCallback(
    (ev: React.ChangeEvent<HTMLSelectElement>) => {
      if (!onChange) return
      onChange(ev.target.value)
    },
    [onChange, value]
  )
  let placeholderValue = placeholder ?? 'Select a value'
  return (
    <div className={cn(containerClassName)}>
      <select
        {...props}
        value={value || 'defaultValue'}
        onChange={onChangeHandler}
        className={cn(
          CLASS_NAME,
          'appearance-none',
          props.className,
          !value && 'text-text-disabled'
        )}
      >
        <option value={'defaultValue'} disabled className="text-text-disabled">
          {placeholderValue}
        </option>
        {options.map((x) => (
          <option key={x.value} value={x.value} disabled={x.disabled || false}>
            {x.label}
          </option>
        ))}
      </select>
    </div>
  )
}

type ResizibleGhostInputProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'onChange'
> & {
  onChange?: (value: string) => void
  containerClassName?: string
  direction: 'v' | 'vh'
}
export const ResizibleGhostInput: React.FC<ResizibleGhostInputProps> = ({
  value,
  onChange,
  containerClassName,
  className,
  direction,
  ...props
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const _onChange = React.useCallback(
    (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!onChange) return
      onChange(ev.target.value)
      if (containerRef.current) {
        containerRef.current.dataset.value = ev.target.value
      }
    },
    []
  )
  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.dataset.value = String(value)
    }
  }, [value])
  return (
    <div
      ref={containerRef}
      className={cn(
        direction === 'v' ? 'input-resizible-v' : 'input-resizible-vh',
        containerClassName
      )}
    >
      <textarea
        value={value}
        onChange={_onChange}
        rows={1}
        className={cn(
          'bg-transparent text-acc',
          'placeholder:text-acc/40 focus:placeholder:text-acc/20',
          className
        )}
        {...props}
      />
    </div>
  )
}

export type TextareaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'onChange'
> & {
  onChange?: (value: string) => void
}
export const Textarea: React.FC<TextareaProps> = ({
  onChange,
  className = '',
  rows = 4,
  ...props
}) => {
  const onChangeHandler = React.useCallback(
    (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!onChange) return
      onChange(ev.target.value)
    },
    [onChange]
  )
  return (
    <textarea
      className={cn(CLASS_NAME, 'block', className)}
      rows={rows}
      onChange={onChangeHandler}
      {...props}
    />
  )
}
