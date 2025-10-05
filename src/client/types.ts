export type ClientTheme =
  | 'dark'
  | 'light'
  | 'custom'
  | 'sunrise'
  | 'sunset'
  | 'fill_blue'
  | 'light_red'

export type ClientThemeMode = 'light' | 'dark'

export enum LayoutView {
  Mobile = 'mobile',
  Tablet = 'tablet',
  Desktop = 'desktop',
}

export type ClientEvents = {
  change_theme: { theme: ClientTheme }
  reset_theme: null
}
