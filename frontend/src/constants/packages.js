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

// Get package duration in days
export const getPackageDays = (packageType) => {
    const pkg = PACKAGE_OPTIONS.find((p) => p.value === packageType);
    return pkg ? pkg.days : 0;
};

// Get package label
export const getPackageLabel = (packageType) => {
    const pkg = PACKAGE_OPTIONS.find((p) => p.value === packageType);
    return pkg ? pkg.label : "Unknown";
};

// Calculate package end date
export const calculatePackageEndDate = (startDate, packageType) => {
    const days = getPackageDays(packageType);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days);
    return endDate;
};

// Get remaining days from an end date
export const getRemainingDays = (endDate) => {
    if (!endDate) return 0;

    const end = endDate.toDate ? endDate.toDate() : new Date(endDate);
    const now = new Date();

    // Set both dates to beginning of day for accurate day calculation
    end.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
};

// Check if a package is expired
export const isPackageExpired = (endDate) => {
    if (!endDate) return false;
    const daysLeft = getRemainingDays(endDate);
    return daysLeft <= 0;
};
