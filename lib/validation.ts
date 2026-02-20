export function validateMinLength(value: string, min: number): boolean {
  return value.trim().length >= min;
}

export function validateRequired(value: string): boolean {
  return value.trim().length > 0;
}

export function validateImageFile(file: File): { valid: boolean; errorCode?: "invalid_type" | "too_large" } {
  const maxSize = 5 * 1024 * 1024;
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, errorCode: "invalid_type" };
  }
  if (file.size > maxSize) {
    return { valid: false, errorCode: "too_large" };
  }
  return { valid: true };
}
