const spacing = (base, limit, unit = 'px') => {
  const output = {}
  let n = 1
  let value
  do {
    value = base * n
    output[value] = `${value}${unit}`
    n++
  } while (value <= limit)
  return output
}

module.exports = {
  darkMode: 'class',
  content: ['./public/*.html', './templates/*', './src/client/**/*.tsx'],
  theme: {
    spacing: {
      inherit: 'inherit',
      0: '0',
      1: '1px',
      2: '2px',
      4: '4px',
      ...spacing(8, 512),
    },
    maxWidth: {
      ...spacing(8, 512),
    },
    extend: {
      fontFamily: {
        base: ['Arial', 'Helvetica', 'sans-serif'],
      },
      lineHeight: {
        1: '1',
        1.25: '1.25',
        1.5: '1.5',
        2: '2',
      },
      screens: {
        phone: '480px',
        tablet: '768px',
        desktop: '1024px',
      },
      colors: {
        transparent: 'transparent',
        bac: {
          DEFAULT: 'var(--base-color)',
        },
        acc: {
          DEFAULT: 'rgb(var(--acc-color-default) / <alpha-value>)',
          100: 'rgb(var(--acc-color-100) / <alpha-value>)',
          200: 'rgb(var(--acc-color-200) / <alpha-value>)',
          300: 'rgb(var(--acc-color-300) / <alpha-value>)',
          400: 'rgb(var(--acc-color-400) / <alpha-value>)',
          500: 'rgb(var(--acc-color-500) / <alpha-value>)',
          600: 'rgb(var(--acc-color-600) / <alpha-value>)',
          700: 'rgb(var(--acc-color-700) / <alpha-value>)',
          800: 'rgb(var(--acc-color-800) / <alpha-value>)',
          900: 'rgb(var(--acc-color-900) / <alpha-value>)',
        },
        white: {
          DEFAULT: '#fff',
        },
        black: {
          DEFAULT: '#333',
          dark: '#1a1a1a',
          total: '#050505',
        },
        blue: {
          DEFAULT: '#43aff3',
          light: '#82CCFA',
          dark: '#0067D9',
          darker: '#001B5A',
          deep: '#00094E',
        },
        yellow: {
          DEFAULT: '#fef17b',
          dark: '#f0e46e',
          darker: '#9e7c07',
        },
        gold: {
          DEFAULT: '#D8B43B',
        },
        green: {
          DEFAULT: '#5CB85C',
        },
        red: {
          DEFAULT: '#EE5959',
        },
        time: {
          sunrise: '#ffd266',
          sunset: '#FF8758',
        },
      },
    },
  },
}
