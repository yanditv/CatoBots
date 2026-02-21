/**
 * Validates an Ecuadorian Cédula (ID card) using the modulus 10 algorithm.
 * @param cedula The cédula string to validate.
 * @returns true if valid, false otherwise.
 */
export function validateEcuadorianCedula(cedula: string): boolean {
    // Basic checks: length must be 10 and only digits
    if (!cedula || cedula.length !== 10 || !/^\d+$/.test(cedula)) {
        return false;
    }

    // Check region code (first 2 digits) - strictly between 01 and 24, or 30 (foreigners)
    const region = parseInt(cedula.substring(0, 2), 10);
    if (!((region >= 1 && region <= 24) || region === 30)) {
        return false;
    }

    // Third digit must be < 6 for natural persons (0-5)
    // Note: Public/Private institutions use different logic, but this form is for students/teachers (natural persons)
    const thirdDigit = parseInt(cedula.substring(2, 3), 10);
    if (thirdDigit >= 6) {
        // Technically could be RUC, but for "Cedula" strict validation, this usually indicates RUC or special cases.
        // For this specific form context (students), we usually stick to natural person cédulas.
        // Let's assume standard cedar logic which requires 3rd digit < 6.
        return false;
    }

    // Algorithm Modulo 10
    const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    const verifier = parseInt(cedula.substring(9, 10), 10);
    let sum = 0;

    for (let i = 0; i < 9; i++) {
        let value = parseInt(cedula.substring(i, i + 1), 10) * coefficients[i];
        if (value >= 10) {
            value -= 9;
        }
        sum += value;
    }

    const nextTen = Math.ceil(sum / 10) * 10;
    let calculatedVerifier = nextTen - sum;
    if (calculatedVerifier === 10) {
        calculatedVerifier = 0;
    }

    return calculatedVerifier === verifier;
}

/**
 * Validates a typical Ecuadorian cell phone number.
 * Expected format: 09xxxxxxxx (10 digits starting with 09)
 * @param phone The phone string to validate.
 * @returns true if valid, false otherwise.
 */
export function validatePhone(phone: string): boolean {
    if (!phone) return false;
    // Remove spaces, dashes, parentheses
    const cleanPhone = phone.replace(/\D/g, '');

    // Check for standard 10 digit cell phone starting with 09
    return /^09\d{8}$/.test(cleanPhone);
}
