import _dayjs from 'dayjs';
import dayjsTimeZone from 'dayjs/plugin/timezone';
import dayjsUtc from 'dayjs/plugin/utc';
_dayjs.extend(dayjsTimeZone);
_dayjs.extend(dayjsUtc);
export default _dayjs;
