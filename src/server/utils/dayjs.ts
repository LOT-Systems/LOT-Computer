import _dayjs from 'dayjs'
import dayjsTimeZone from 'dayjs/plugin/timezone'
import dayjsUtc from 'dayjs/plugin/utc'
import { Dayjs as _Dayjs } from 'dayjs'

_dayjs.extend(dayjsTimeZone)
_dayjs.extend(dayjsUtc)

export default _dayjs
export type Dayjs = _Dayjs
