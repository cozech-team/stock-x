/**
 * Validate email format
 */
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
    return {
        minLength: password.length >= 8,
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        hasNumber: /\d/.test(password),
        hasCapital: /[A-Z]/.test(password),
    };
};

/**
 * Check if password is valid (all criteria met)
 */
export const isPasswordValid = (password) => {
    const criteria = validatePassword(password);
    return Object.values(criteria).every(Boolean);
};

/**
 * Extract reset code from URL
 */
export const extractResetCode = (url) => {
    const urlParams = new URLSearchParams(url.split("?")[1]);
    return urlParams.get("oobCode");
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phoneNumber) => {
    // Remove all non-numeric characters
    const cleaned = phoneNumber.replace(/\D/g, "");

    // Format based on length
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }

    return phoneNumber;
};

/**
 * Validate phone number
 */
export const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^[\d\s\-\(\)\+]+$/;
    return phoneRegex.test(phoneNumber) && phoneNumber.replace(/\D/g, "").length >= 10;
};
