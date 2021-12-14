import { Popover } from '@headlessui/react';
import useCalendar from '@veccu/react-calendar';
import {
  startOfMonth,
  endOfMonth,
  isSameDay,
  isAfter,
  isBefore,
  isSameMonth,
  isToday,
  isMonday,
  isSunday,
} from 'date-fns';
import clsx from 'clsx';
import { ReactNode, useReducer } from 'react';

type CalendarDate = {
  key: string;
  value: Date;
  isCurrentMonth: boolean;
  isCurrentDate: boolean;
};

type DatepickerProps = {
  children: ReactNode;
  onChange: (data: any) => void;
  range?: boolean;
};

export const Datepicker = ({
  onChange,
  range = false,
  children,
}: DatepickerProps) => {
  const {
    headers,
    body,
    year,
    month,
    day,
    cursorDate,
    navigation: { setToday, toPrev, toNext },
  } = useCalendar({
    defaultWeekStart: 1,
  });

  const firstOfMonth = startOfMonth(new Date());

  const initializerArg = {
    rangeStart: undefined,
    rangeEnd: undefined,
    done: false,
  };

  const reducer = (
    context: any,
    event: {
      type: 'CLICK' | 'MOUSEENTER';
      payload: CalendarDate;
      cb: () => void;
    }
  ) => {
    if (!range && event.type === 'CLICK') {
      setTimeout(() => {
        onChange(event.payload.value);
        event.cb();
      }, 0);
      return event.payload.value;
    } else {
      switch (event.type) {
        case 'MOUSEENTER':
          if (
            context.rangeStart &&
            !context.done &&
            !isBefore(event.payload.value, context.rangeStart.value)
          ) {
            return { ...context, rangeEnd: event.payload, done: false };
          } else {
            return context;
          }
        case 'CLICK':
          // handle clicks on days outside current month
          if (!event.payload.isCurrentMonth) {
            if (isBefore(event.payload.value, startOfMonth(cursorDate)))
              toPrev();
            if (isAfter(event.payload.value, endOfMonth(cursorDate))) toNext();
            return context;
          }

          // handle clicks on days inside current month
          if (!context.rangeStart || context.done) {
            return {
              ...context,
              rangeStart: event.payload,
              rangeEnd: undefined,
              done: false,
            };
          } else if (context.rangeStart && !context.done) {
            if (isBefore(event.payload.value, context.rangeStart.value)) {
              return { ...context, rangeStart: event.payload, done: false };
            } else {
              setTimeout(() => {
                event.cb();
              }, 0);
              const nextState = {
                ...context,
                rangeEnd: event.payload,
                done: true,
              };
              setTimeout(() => {
                onChange({
                  start: nextState.rangeStart.value,
                  end: nextState.rangeEnd.value,
                });
              });
              return nextState;
            }
          } else {
            return {
              ...context,
              rangeStart: event.payload,
              rangeEnd: undefined,
              done: false,
            };
          }
        default:
          throw new Error('Event not recognized.');
      }
    }
  };

  const [state, dispatch] = useReducer(reducer, initializerArg);

  const jumpToCurrentMonthButtonPosition = isSameMonth(firstOfMonth, cursorDate)
    ? 0.5
    : isBefore(firstOfMonth, cursorDate)
    ? 0
    : 1;

  const PrevMonthButton = () => (
    <button
      onClick={toPrev}
      className="p-2 -mx-1 text-gray-700 rounded-full hover:bg-gray-100 transform transition-transform active:scale-75 focus:outline-none focus:ring-2 ring-gray-300 ring-inset"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        height="18"
        className="rotate-180"
      >
        <path
          fillRule="evenodd"
          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
          clipRule="evenodd"
        ></path>
      </svg>
    </button>
  );

  const NextMonthButton = () => (
    <button
      onClick={toNext}
      className="p-2 -mx-1 text-gray-700 rounded-full hover:bg-gray-100 transform transition-transform active:scale-75 focus:outline-none focus:ring-2 ring-gray-300 ring-inset"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        height="18"
      >
        <path
          fillRule="evenodd"
          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
          clipRule="evenodd"
        ></path>
      </svg>
    </button>
  );
  const CurrentMonthButton = () =>
    isSameMonth(firstOfMonth, cursorDate) ? null : (
      <div className="absolute inset-0 flex">
        <div
          className="transition-all"
          style={{ flexGrow: jumpToCurrentMonthButtonPosition }}
        ></div>
        <button
          onClick={setToday}
          aria-label="Jump to current month"
          className="flex items-center justify-center text-gray-500 opacity-100 cursor-pointer w-7 h-7 hover:bg-gray-100 hover:text-gray-600 rounded-md transition-all"
        >
          <span className="inline-block w-[8px] h-[8px] border-2 rounded transition-colors border-current"></span>
        </button>
      </div>
    );

  const CurrentMonthDisplay = () => (
    <div className="inline-block px-3 py-1 font-medium outline-none pointer-events-none rounded-md transition-all transform relativering-cool-gray-300 active:scale-95 active:text-gray-700 focus:ring-2 focus:outline-none">
      {new Date(year, month, day).toLocaleString('en-US', {
        month: 'long',
        year: 'numeric',
      })}
    </div>
  );

  const Headers = () => (
    <>
      {headers.weekDays.map((day) => (
        <div
          key={day.key}
          className="text-xs text-center text-gray-700 my-1  border-b pb-1.5"
        >
          {day.value
            .toLocaleString('en-US', {
              weekday: 'short',
            })
            .slice(0, 1)}
        </div>
      ))}
    </>
  );

  const DateValue = ({ value }: { value: Date }) => (
    <span className="relative">
      {value.toLocaleString('en-US', {
        day: 'numeric',
      })}
    </span>
  );

  const isRangeStart = (value: Date) =>
    isSameDay(value, state.rangeStart?.value);

  const isRangeEnd = (value: Date) => isSameDay(value, state.rangeEnd?.value);

  const isRangeStartOrEnd = (value: Date) =>
    isRangeStart(value) || isRangeEnd(value);

  const isRangeBetween = (value: Date) =>
    isAfter(value, state.rangeStart?.value) &&
    isBefore(value, state.rangeEnd?.value);

  const DayButton = ({ day, cb }: { day: CalendarDate; cb: () => void }) => (
    <button
      onClick={() => dispatch({ type: 'CLICK', payload: day, cb })}
      onMouseEnter={() =>
        dispatch({ type: 'MOUSEENTER', payload: day, cb: () => {} })
      }
      className={clsx(
        !day.isCurrentMonth && 'opacity-50',
        isRangeStartOrEnd(day.value) && !isToday(day.value) && 'text-white',
        'w-full h-full min-h-[28px] text-sm transition-colors relative group focus:outline-none font-medium'
      )}
    >
      <div
        className={clsx(
          isRangeBetween(day.value) && 'bg-gray-200',
          isRangeStart(day.value) &&
            state.rangeEnd?.value &&
            'bg-gray-200 rounded-l-xl ml-1',
          isRangeEnd(day.value) && 'bg-gray-200 rounded-r-xl mr-1',
          isMonday(day.value) && 'rounded-l-xl',
          isSunday(day.value) && 'rounded-r-xl',
          'absolute inset-x-0 inset-y-0 transform transition-all'
        )}
      ></div>
      <div
        className={clsx(
          isToday(day.value) && 'bg-gray-100 border border-gray-400 rounded-lg',
          isRangeStartOrEnd(day.value) && 'rounded-full bg-gray-800 shadow-md',
          'absolute w-7 mx-1 top-0 h-7 transform transition-all scale-100 opacity-100'
        )}
      ></div>
      <div
        className={clsx(
          isToday(day.value) ? 'rounded-lg' : 'rounded-full',
          'absolute top-0 h-7 w-7 mx-1 z-10 transform transition-shadow group-hover:ring-2 group-focus:ring-2 ring-0 ring-gray-400'
        )}
      ></div>
      <DateValue value={day.value} />
    </button>
  );

  return (
    <Popover className="relative">
      {({ open, close }) => (
        <>
          <div className="bg-white rounded-lg md:shadow flex w-min">
            <Popover.Button
              className="h-[36px] hover:bg-gray-100 text-gray-500 focus:text-gray-600 hover:text-gray-600 focus:outline-none focus:shadow-outline-gray text-sm px-2.5 space-x-2 flex items-center truncate md:text-left font-semibold  overflow-hidden rounded-lg"
              type="button"
              aria-expanded={open || undefined}
            >
              {children}
            </Popover.Button>
          </div>
          <Popover.Panel className="absolute z-10">
            <div className="z-10 px-2 py-1 pb-2 mt-2 bg-white rounded-lg shadow-lg focus:outline-none text-cool-gray-900 w-max right-4">
              <div className="w-[250px] text-current">
                <div className="flex items-center py-0.5 mb-1">
                  <PrevMonthButton />
                  <div className="text-center flex-1 flex justify-center text-sm text-medium relative">
                    <CurrentMonthButton />
                    <CurrentMonthDisplay />
                  </div>
                  <NextMonthButton />
                </div>
              </div>
              <div className="grid grid-cols-7 gap-y-1">
                <Headers />
                {body.value.map((week) =>
                  week.value.map((day) => (
                    <DayButton key={day.key} day={day} cb={close} />
                  ))
                )}
              </div>
            </div>
          </Popover.Panel>
        </>
      )}
    </Popover>
  );
};