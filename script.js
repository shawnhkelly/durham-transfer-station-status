// Main Function to Determine if Transfer Station is Open
function isTransferStationOpen() {
    // Uncomment the line below to test with a specific date and time
    const now = new Date('2024-10-13T10:00:00'); // Testing - Simulate October 15, 2024, at 10:00 AM
    //  const now = new Date();
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
        // Indigenous People's Day (second Monday in October)
        getNthWeekdayOfMonth(currentYear, 9, 1, 2), // October is month 9, Monday is weekday 1
        // Thanksgiving Day (fourth Thursday in November)
        getNthWeekdayOfMonth(currentYear, 10, 4, 4), // November is month 10, Thursday is weekday 4
        // Christmas Day (December 25th)
        new Date(currentYear, 11, 25),
        // Durham Fair Saturday (Update this date annually)
        new Date(currentYear, 8, 28), // September 28th
    ];

    // Define normal operating days: Monday (1), Thursday (4), Saturday (6)
    const normalOperatingDays = [1, 4, 6];

    // Check if today is a holiday
    let isHolidayToday = holidays.some(holiday => isSameDate(holiday, today));

    // Check if any holiday falls on a Sunday and today is the following Monday
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

    // Check if today is the Tuesday after Indigenous People's Day
    const indigenousPeoplesDay = getNthWeekdayOfMonth(currentYear, 9, 1, 2); // Second Monday in October
    let isTuesdayAfterIndigenousPeoplesDay = isSameDate(addDays(indigenousPeoplesDay, 1), today) && today.getDay() === 2;

    // If today is a holiday and a normal operating day, it's closed today
    if ((isHolidayToday || isMondayAfterSundayHoliday) && normalOperatingDays.includes(today.getDay())) {
        return { status: "NO", nextOpen: getNextOpenTime(now, holidays) };
    }

    // Define opening hours
    const dayOfWeek = now.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
    let openingTime, closingTime;

    if (normalOperatingDays.includes(dayOfWeek) || isTuesdayAfterIndigenousPeoplesDay) {
        // Determine opening and closing times based on the day
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
        } else if (isTuesdayAfterIndigenousPeoplesDay) { // Special case for Tuesday after Indigenous People's Day
            openingTime = setTime(today, 8, 0);
            closingTime = setTime(today, 19, 45); // Using Monday's hours
        } else {
            // Transfer Station is closed on other days
            return { status: "NO", nextOpen: getNextOpenTime(now, holidays) };
        }
    } else {
        // Transfer Station is closed on other days
        return { status: "NO", nextOpen: getNextOpenTime(now, holidays) };
    }

    // Check if current time is within operating hours
    if (now >= openingTime && now <= closingTime) {
        return { status: "YES" };
    } else {
        return { status: "NO", nextOpen: getNextOpenTime(now, holidays) };
    }
}

// Function to get the next opening time
function getNextOpenTime(now, holidays) {
    const currentYear = now.getFullYear();
    let nextOpenDate = new Date(now);
    const normalOperatingDays = [1, 4, 6]; // Monday, Thursday, Saturday

    for (let i = 0; i < 14; i++) { // Check the next two weeks
        nextOpenDate = addDays(nextOpenDate, 1);
        const dayOfWeek = nextOpenDate.getDay();
        const date = new Date(currentYear, nextOpenDate.getMonth(), nextOpenDate.getDate()); // Normalize to midnight

        let isHoliday = holidays.some(holiday => isSameDate(holiday, date));
        let isMondayAfterSundayHoliday = holidays.some(holiday => {
            return holiday.getDay() === 0 && isSameDate(addDays(holiday, 1), date);
        });

        // Check if date is the Tuesday after Indigenous People's Day
        const indigenousPeoplesDay = getNthWeekdayOfMonth(currentYear, 9, 1, 2);
        let isTuesdayAfterIndigenousPeoplesDay = isSameDate(addDays(indigenousPeoplesDay, 1), date) && date.getDay() === 2;

        // Skip if date is a holiday on a normal operating day
        if ((isHoliday || isMondayAfterSundayHoliday) && normalOperatingDays.includes(date.getDay())) {
            continue; // Closed due to holiday
        }

        // Determine if the Transfer Station is open on this date
        if (normalOperatingDays.includes(dayOfWeek) || isTuesdayAfterIndigenousPeoplesDay) {
            // Set opening time based on the day
            let openingTime;
            if (dayOfWeek === 1) { // Monday
                openingTime = setTime(date, 8, 0);
            } else if (dayOfWeek === 4) { // Thursday
                openingTime = setTime(date, 8, 0);
            } else if (dayOfWeek === 6) { // Saturday
                openingTime = setTime(date, 8, 0);
            } else if (isTuesdayAfterIndigenousPeoplesDay) { // Special case for Tuesday after Indigenous People's Day
                openingTime = setTime(date, 8, 0);
            } else {
                continue; // Not an open day
            }
            return openingTime;
        }
    }
    return null; // Could not find the next opening time in the next two weeks
}

// Helper Functions

// Get the last Monday of a given month
function getLastMondayOfMonth(year, month) {
    const date = new Date(year, month + 1, 0); // Last day of the month
    while (date.getDay() !== 1) { // 1 = Monday
        date.setDate(date.getDate() - 1);
    }
    return date;
}

// Get the first Monday of a given month
function getFirstMondayOfMonth(year, month) {
    const date = new Date(year, month, 1);
    while (date.getDay() !== 1) {
        date.setDate(date.getDate() + 1);
    }
    return date;
}

// Get the Nth weekday of a given month
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

// Check if two dates are the same (year, month, day)
function isSameDate(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

// Add a number of days to a date
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

// Set time for a date
function setTime(date, hours, minutes) {
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
}

// DOM Manipulation
document.addEventListener("DOMContentLoaded", function() {
    const result = isTransferStationOpen();
    const statusElement = document.getElementById('status');
    statusElement.innerText = result.status;

    if (result.status === "YES") {
        document.body.classList.add('open');
        document.querySelector('.container').classList.add('open');
    } else {
        document.body.classList.add('closed');
        document.querySelector('.container').classList.add('closed');

        // Display next opening time
        if (result.nextOpen) {
            const nextOpenElement = document.createElement('div');
            nextOpenElement.id = 'next-open';
            const options = { weekday: 'long', hour: 'numeric', minute: 'numeric' };
            const nextOpenTimeString = result.nextOpen.toLocaleString('en-US', options);
            nextOpenElement.innerText = `The transfer station will next open on ${nextOpenTimeString}.`;
            // Append the nextOpenElement after the statusElement
            statusElement.insertAdjacentElement('afterend', nextOpenElement);
        }
    }
});
