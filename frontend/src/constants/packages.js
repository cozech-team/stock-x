// Package types and durations
export const PACKAGES = {
    FREE_7DAYS: "7days-free",
    ONE_MONTH: "1month",
    THREE_MONTHS: "3months",
    SIX_MONTHS: "6months",
    ONE_YEAR: "1year",
};

// Package options for dropdown
export const PACKAGE_OPTIONS = [
    { value: PACKAGES.FREE_7DAYS, label: "7 Days (Free)", days: 7 },
    { value: PACKAGES.ONE_MONTH, label: "1 Month", days: 30 },
    { value: PACKAGES.THREE_MONTHS, label: "3 Months", days: 90 },
    { value: PACKAGES.SIX_MONTHS, label: "6 Months", days: 180 },
    { value: PACKAGES.ONE_YEAR, label: "1 Year", days: 365 },
];

// Get package option object
export const getPackageOption = (packageType) => {
    return PACKAGE_OPTIONS.find((p) => p.value === packageType);
};

// Get package label
export const getPackageLabel = (packageType) => {
    const pkg = getPackageOption(packageType);
    return pkg ? pkg.label : "Unknown";
};

// Calculate package end date
export const calculatePackageEndDate = (startDate, packageType) => {
    const pkg = getPackageOption(packageType);
    if (!pkg) return startDate;

    const endDate = new Date(startDate);
    if (pkg.minutes) {
        endDate.setMinutes(endDate.getMinutes() + pkg.minutes);
    } else if (pkg.days) {
        endDate.setDate(endDate.getDate() + pkg.days);
    }
    return endDate;
};

// Get remaining total milliseconds
export const getRemainingTimeMs = (endDate) => {
    if (!endDate) return 0;
    const end = endDate.toDate ? endDate.toDate() : new Date(endDate);
    const now = new Date();
    return end.getTime() - now.getTime();
};

// Get remaining days from an end date (clamped to 0)
export const getRemainingDays = (endDate) => {
    const ms = getRemainingTimeMs(endDate);
    return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
};

// Get remaining minutes (total)
export const getRemainingMinutes = (endDate) => {
    const ms = getRemainingTimeMs(endDate);
    return Math.max(0, Math.ceil(ms / (1000 * 60)));
};

// Check if a package is expired (strictly)
export const isPackageExpired = (endDate) => {
    if (!endDate) return false;
    return getRemainingTimeMs(endDate) <= 0;
};

/**
 * Format remaining time for display
 * Shows "X mins left" if less than 60 mins, otherwise "X days left"
 */
export const formatRemainingTime = (endDate) => {
    if (!endDate) return "N/A";

    if (isPackageExpired(endDate)) return "Expired";

    const ms = getRemainingTimeMs(endDate);
    const minutes = Math.ceil(ms / (1000 * 60));

    if (minutes < 60) {
        return `${minutes} mins left`;
    }

    const days = Math.ceil(minutes / (60 * 24));
    return `${days} ${days === 1 ? "day" : "days"} left`;
};
