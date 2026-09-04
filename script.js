const NORMAL_OPERATING_DAYS = [1, 4, 6]; // Monday, Thursday, Saturday

// Add temporary, Town-announced changes here. Use YYYY-MM-DD for the date.
// Set status to "closed" for a closure, or "open" and include hours to add or change an open day.
const SPECIAL_SCHEDULE_UPDATES = {
    "2026-09-08": {
        status: "open",
        openingTime: "08:00",
        closingTime: "19:45",
        reason: "Open because it's the day after labor day...even though it's usually closed on Tuesdays."
    }
};

// Main function to determine if the Transfer Station is open.
function isTransferStationOpen(targetDate = new Date(), now = new Date()) {
    const selectedDate = startOfDay(targetDate);
    const today = startOfDay(now);
    const schedule = getScheduleForDate(selectedDate);
    const specialUpdate = getSpecialScheduleUpdate(selectedDate);
    const isToday = isSameDate(selectedDate, today);

    if (!schedule) {
        return {
            status: "NO",
            isOpen: false,
            schedule,
            specialUpdate,
            nextOpen: getNextOpenTime(isToday ? now : selectedDate)
        };
    }

    if (!isToday) {
        return {
            status: "YES",
            isOpen: true,
            schedule,
            specialUpdate
        };
    }

    const isOpenNow = now >= schedule.openingTime && now <= schedule.closingTime;

    return {
        status: isOpenNow ? "YES" : "NO",
        isOpen: isOpenNow,
        schedule,
        specialUpdate,
        nextOpen: isOpenNow ? null : getNextOpenTime(now)
    };
}

function getScheduleForDate(date) {
    const targetDate = startOfDay(date);
    const specialUpdate = getSpecialScheduleUpdate(targetDate);
    const dayOfWeek = targetDate.getDay();
    const isTuesdayAfterIndigenousPeoplesDay = isTuesdayAfterHoliday(targetDate, getIndigenousPeoplesDay(targetDate.getFullYear()));
    const isTuesdayAfterSundayHoliday = isTuesdayAfterSundayHolidayClosure(targetDate);

    if (specialUpdate) {
        return specialUpdate.status === "open" ? getScheduleFromSpecialUpdate(targetDate, specialUpdate) : null;
    }

    if (isClosedForHoliday(targetDate)) {
        return null;
    }

    if (dayOfWeek === 1 || dayOfWeek === 4 || isTuesdayAfterIndigenousPeoplesDay || isTuesdayAfterSundayHoliday) {
        return {
            openingTime: setTime(targetDate, 8, 0),
            closingTime: setTime(targetDate, 19, 45)
        };
    }

    if (dayOfWeek === 6) {
        return {
            openingTime: setTime(targetDate, 8, 0),
            closingTime: isSpecialHalfDaySaturday(targetDate) ? setTime(targetDate, 12, 0) : setTime(targetDate, 15, 0)
        };
    }

    return null;
}

function getSpecialScheduleUpdate(date) {
    return SPECIAL_SCHEDULE_UPDATES[formatDateInputValue(startOfDay(date))] || null;
}

function getScheduleFromSpecialUpdate(date, update) {
    if (!update.openingTime || !update.closingTime) {
        return {
            openingTime: setTime(date, 8, 0),
            closingTime: setTime(date, 19, 45)
        };
    }

    return {
        openingTime: setTimeFromString(date, update.openingTime),
        closingTime: setTimeFromString(date, update.closingTime)
    };
}

function isClosedForHoliday(date) {
    const targetDate = startOfDay(date);
    const holidays = getHolidaysForYear(targetDate.getFullYear());
    const isHoliday = holidays.some(holiday => isSameDate(holiday, targetDate));
    const isMondayAfterSundayHoliday = holidays.some(holiday => holiday.getDay() === 0 && isSameDate(addDays(holiday, 1), targetDate));

    return (isHoliday || isMondayAfterSundayHoliday) && NORMAL_OPERATING_DAYS.includes(targetDate.getDay());
}

// Function to get the next opening time after the provided date and time.
function getNextOpenTime(afterDate) {
    let nextOpenDate = new Date(afterDate);

    for (let i = 0; i < 30; i++) {
        const dateToCheck = startOfDay(nextOpenDate);
        const schedule = getScheduleForDate(dateToCheck);

        if (schedule && schedule.openingTime > afterDate) {
            return schedule.openingTime;
        }

        nextOpenDate = addDays(dateToCheck, 1);
    }

    return null;
}

function getSevenDayOutlook(startDate) {
    const selectedDate = startOfDay(startDate);
    const days = [];

    for (let i = 0; i < 7; i++) {
        const date = addDays(selectedDate, i);
        const schedule = getScheduleForDate(date);

        days.push({
            date,
            isOpen: Boolean(schedule),
            schedule,
            specialUpdate: getSpecialScheduleUpdate(date)
        });
    }

    return days;
}

function getHolidaysForYear(year) {
    return [
        // New Year's Day
        new Date(year, 0, 1),
        // Memorial Day
        getLastMondayOfMonth(year, 4),
        // Independence Day
        new Date(year, 6, 4),
        // Labor Day
        getFirstMondayOfMonth(year, 8),
        // Columbus/Indigenous People Day
        getIndigenousPeoplesDay(year),
        // Thanksgiving Day
        getNthWeekdayOfMonth(year, 10, 4, 4),
        // Christmas Day
        new Date(year, 11, 25),
        // Durham Fair Saturday
        getLastSaturdayOfMonth(year, 8)
    ];
}

function getIndigenousPeoplesDay(year) {
    return getNthWeekdayOfMonth(year, 9, 1, 2);
}

function isTuesdayAfterHoliday(date, holiday) {
    return holiday && date.getDay() === 2 && isSameDate(addDays(holiday, 1), date);
}

function isTuesdayAfterSundayHolidayClosure(date) {
    const targetDate = startOfDay(date);
    const holidays = getHolidaysForYear(targetDate.getFullYear());

    return targetDate.getDay() === 2 && holidays.some(holiday => holiday.getDay() === 0 && isSameDate(addDays(holiday, 2), targetDate));
}

function isSpecialHalfDaySaturday(date) {
    const targetDate = startOfDay(date);
    const christmas = new Date(targetDate.getFullYear(), 11, 25);
    const newYearsDay = new Date(targetDate.getFullYear() + 1, 0, 1);

    return targetDate.getDay() === 6 &&
           (
               (christmas.getDay() === 0 && isSameDate(addDays(christmas, -1), targetDate)) ||
               (newYearsDay.getDay() === 0 && isSameDate(addDays(newYearsDay, -1), targetDate))
           );
}

// Helper functions

function getLastMondayOfMonth(year, month) {
    return getLastWeekdayOfMonth(year, month, 1);
}

function getFirstMondayOfMonth(year, month) {
    const date = new Date(year, month, 1);
    while (date.getDay() !== 1) {
        date.setDate(date.getDate() + 1);
    }
    return date;
}

function getLastSaturdayOfMonth(year, month) {
    return getLastWeekdayOfMonth(year, month, 6);
}

function getLastWeekdayOfMonth(year, month, weekday) {
    const date = new Date(year, month + 1, 0);
    while (date.getDay() !== weekday) {
        date.setDate(date.getDate() - 1);
    }
    return date;
}

function getNthWeekdayOfMonth(year, month, weekday, n) {
    const date = new Date(year, month, 1);
    let count = 0;
    while (date.getMonth() === month) {
        if (date.getDay() === weekday) {
            count++;
            if (count === n) {
                return new Date(date);
            }
        }
        date.setDate(date.getDate() + 1);
    }
    return null;
}

function isSameDate(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function setTime(date, hours, minutes) {
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
}

function setTimeFromString(date, time) {
    const [hours, minutes] = time.split(":").map(Number);
    return setTime(date, hours, minutes);
}

function formatDateInputValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function parseDateInputValue(value) {
    const parts = value.split("-").map(Number);

    if (parts.length !== 3 || parts.some(Number.isNaN)) {
        return null;
    }

    const date = new Date(parts[0], parts[1] - 1, parts[2]);

    if (date.getFullYear() !== parts[0] || date.getMonth() !== parts[1] - 1 || date.getDate() !== parts[2]) {
        return null;
    }

    return date;
}

function formatTimeRange(schedule) {
    return `${formatTime(schedule.openingTime)}-${formatTime(schedule.closingTime)}`;
}

function formatTime(date) {
    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
    });
}

function formatOutlookDate(date) {
    return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric"
    });
}

function formatNextOpenDate(date) {
    return date.toLocaleString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
}

// DOM manipulation
document.addEventListener("DOMContentLoaded", function() {
    const dateInput = document.getElementById("status-date");
    const statusElement = document.getElementById("status");
    const scheduleNoteElement = document.getElementById("schedule-note");
    const nextOpenElement = document.getElementById("next-open");
    const outlookList = document.getElementById("outlook-list");
    const today = startOfDay(new Date());
    const todayInputValue = formatDateInputValue(today);

    dateInput.min = todayInputValue;
    dateInput.value = todayInputValue;
    dateInput.addEventListener("change", updateStatus);

    updateStatus();

    function updateStatus() {
        let selectedDate = parseDateInputValue(dateInput.value);

        if (!selectedDate || selectedDate < today) {
            selectedDate = today;
            dateInput.value = todayInputValue;
        }

        const result = isTransferStationOpen(selectedDate);

        statusElement.innerText = result.status;
        updatePageState(result.isOpen);
        updateScheduleNote(result.specialUpdate);
        updateNextOpenMessage(result.nextOpen);
        updateOutlook(selectedDate);
    }

    function updateScheduleNote(specialUpdate) {
        if (!specialUpdate) {
            scheduleNoteElement.hidden = true;
            scheduleNoteElement.innerText = "";
            return;
        }

        scheduleNoteElement.hidden = false;
        scheduleNoteElement.innerText = `${specialUpdate.reason} Keeping track of one-off schedule changes can be a lot — we have you covered.`;
    }

    function updatePageState(isOpen) {
        document.body.classList.toggle("open", isOpen);
        document.body.classList.toggle("closed", !isOpen);
        document.querySelector(".container").classList.toggle("open", isOpen);
        document.querySelector(".container").classList.toggle("closed", !isOpen);
    }

    function updateNextOpenMessage(nextOpen) {
        if (!nextOpen) {
            nextOpenElement.innerText = "";
            nextOpenElement.hidden = true;
            return;
        }

        nextOpenElement.hidden = false;
        nextOpenElement.innerText = `Next open: ${formatNextOpenDate(nextOpen)}.`;
    }

    function updateOutlook(selectedDate) {
        outlookList.innerHTML = "";

        getSevenDayOutlook(selectedDate).forEach(day => {
            const item = document.createElement("li");
            const dateElement = document.createElement("span");
            const statusElement = document.createElement("span");

            dateElement.className = "outlook-date";
            dateElement.innerText = formatOutlookDate(day.date);
            statusElement.className = day.isOpen ? "outlook-status open-day" : "outlook-status closed-day";
            statusElement.innerText = day.isOpen ? `Open ${formatTimeRange(day.schedule)}` : "Closed";

            if (day.specialUpdate) {
                statusElement.innerText += ` — ${day.specialUpdate.reason}`;
            }

            item.append(dateElement, statusElement);
            outlookList.appendChild(item);
        });
    }
});
