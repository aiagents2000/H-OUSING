export function validateMinLength(value: string, min: number): boolean {
  return value.trim().length >= min;
}

export function validateRequired(value: string): boolean {
  return value.trim().length > 0;
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024;
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Only JPEG, PNG, and WebP images are allowed" };
  }
  if (file.size > maxSize) {
    return { valid: false, error: "Image must be less than 5MB" };
  }
  return { valid: true };
}
