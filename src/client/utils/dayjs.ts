import _dayjs from 'dayjs'
import dayjsUtc from 'dayjs/plugin/utc'
import dayjsRelativeTime from 'dayjs/plugin/relativeTime'
import { Dayjs as _Dayjs } from 'dayjs'

_dayjs.extend(dayjsUtc)
_dayjs.extend(dayjsRelativeTime)

export default _dayjs
export type Dayjs = _Dayjs
