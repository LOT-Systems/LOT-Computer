import _dayjs from 'dayjs'
import dayjsTimeZone from 'dayjs/plugin/timezone.js'
import dayjsUtc from 'dayjs/plugin/utc.js'
import { Dayjs as _Dayjs } from 'dayjs'

_dayjs.extend(dayjsTimeZone)
_dayjs.extend(dayjsUtc)

export default _dayjs
export type Dayjs = _Dayjs
