function isTransferStationOpen() {
    //  const now = new Date('2024-09-14T10:00:00'); // Testing - Simulate September 14, 2024, at 10:00 AM
    const now = new Date();
    const currentYear = now.getFullYear();
    const today = new Date(currentYear, now.getMonth(), now.getDate()); // Normalize to midnight

    // Compute holidays
    const holidays = [
        // New Year's Day (January 1st)
        new Date(currentYear, 0, 1),
        // Memorial Day (last Monday in May)
        getLastMondayOfMonth(currentYear, 4), // May is month 4 (zero-based)
        // Independence Day (July 4th)
        new Date(currentYear, 6, 4),
        // Labor Day (first Monday in September)
        getFirstMondayOfMonth(currentYear, 8), // September is month 8
        // Thanksgiving Day (fourth Thursday in November)
        getNthWeekdayOfMonth(currentYear, 10, 4, 4), // November, 4th Thursday
        // Christmas Day (December 25th)
        new Date(currentYear, 11, 25),
        // Durham Fair Saturday (Assumed date for this year)
        new Date(currentYear, 8, 21), // September 21st
    ];

    // Check if today is a holiday
    let isHolidayToday = holidays.some(holiday => isSameDate(holiday, today));

    // Check if any holiday falls on a Sunday
    let isMondayAfterSundayHoliday = holidays.some(holiday => {
        return holiday.getDay() === 0 && isSameDate(addDays(holiday, 1), today);
    });

    // Check for special half-day on Saturday before Christmas or New Year's Day if they fall on Sunday
    let isSpecialHalfDaySaturday = false;
    holidays.forEach(holiday => {
        if (
            (holiday.getMonth() === 0 && holiday.getDate() === 1) || // New Year's Day
            (holiday.getMonth() === 11 && holiday.getDate() === 25)   // Christmas Day
        ) {
            if (holiday.getDay() === 0) { // If holiday falls on Sunday
                const saturdayBefore = addDays(holiday, -1);
                if (isSameDate(saturdayBefore, today) && today.getDay() === 6) {
                    isSpecialHalfDaySaturday = true;
                }
            }
        }
    });

    // If today is a holiday and not the special half-day Saturday, return "NO"
    if ((isHolidayToday || isMondayAfterSundayHoliday) && !isSpecialHalfDaySaturday) {
        return "NO";
    }

    // Define opening hours
    const dayOfWeek = now.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
    let openingTime, closingTime;

    if (dayOfWeek === 1) { // Monday
        openingTime = setTime(today, 8, 0);
        closingTime = setTime(today, 19, 45);
    } else if (dayOfWeek === 4) { // Thursday
        openingTime = setTime(today, 8, 0);
        closingTime = setTime(today, 19, 45);
    } else if (dayOfWeek === 6) { // Saturday
        if (isSpecialHalfDaySaturday) {
            openingTime = setTime(today, 8, 0);
            closingTime = setTime(today, 12, 0);
        } else {
            openingTime = setTime(today, 8, 0);
            closingTime = setTime(today, 15, 0);
        }
    } else {
        // Transfer Station is closed on other days
        return "NO";
    }

    // Check if current time is within operating hours
    if (now >= openingTime && now <= closingTime) {
        return "YES";
    } else {
        return "NO";
    }
}

// Helper functions

function getLastMondayOfMonth(year, month) {
    const date = new Date(year, month + 1, 0); // Last day of the month
    while (date.getDay() !== 1) { // 1 = Monday
        date.setDate(date.getDate() - 1);
    }
    return date;
}

function getFirstMondayOfMonth(year, month) {
    const date = new Date(year, month, 1);
    while (date.getDay() !== 1) {
        date.setDate(date.getDate() + 1);
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

// DOM Manipulation
document.addEventListener("DOMContentLoaded", function() {
    const status = isTransferStationOpen();
    const statusElement = document.getElementById('status');
    statusElement.innerText = status;

    if (status === "YES") {
        document.body.classList.add('open');
        document.querySelector('.container').classList.add('open');
    } else {
        document.body.classList.add('closed');
        document.querySelector('.container').classList.add('closed');
    }
});
