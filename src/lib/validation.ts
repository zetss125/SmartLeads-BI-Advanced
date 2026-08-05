export type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; errors: string[] };

// Lightweight validation functions for production hardening

export function validateString(value: any, min = 0, max = Infinity): boolean {
  if (typeof value !== "string") return false;
  const len = value.trim().length;
  return len >= min && len <= max;
}

export function validateEmail(value: any): boolean {
  if (!validateString(value, 5, 255)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateArray<T>(value: any, itemValidator: (item: any) => boolean): boolean {
  if (!Array.isArray(value)) return false;
  return value.every(itemValidator);
}

// Specific API payload validators

export function validateAPIKeyPayload(data: any): ValidationResult<{ name: string; scopes: string[] }> {
  const errors: string[] = [];
  
  if (!data) {
    return { success: false, errors: ["Request body is missing"] };
  }

  if (!validateString(data.name, 1, 100)) {
    errors.push("Name must be a string between 1 and 100 characters");
  }

  if (!validateArray(data.scopes, (s) => validateString(s, 1, 50))) {
    errors.push("Scopes must be an array of valid strings");
  }

  if (errors.length > 0) return { success: false, errors };

  return { 
    success: true, 
    data: { name: data.name.trim(), scopes: data.scopes } 
  };
}

export function validateLeadUpdatePayload(data: any): ValidationResult<any> {
  const errors: string[] = [];
  
  if (!data) return { success: false, errors: ["Request body is missing"] };

  const validFields = ["name", "email", "phone", "platform", "contacted"];
  const updates: any = {};

  for (const field of validFields) {
    if (data[field] !== undefined) {
      if (field === "email" && !validateEmail(data[field])) {
        errors.push("Invalid email format");
      } else if (field === "contacted" && typeof data[field] !== "boolean") {
        errors.push("Contacted must be a boolean");
      } else {
        updates[field] = data[field];
      }
    }
  }

  if (errors.length > 0) return { success: false, errors };
  if (Object.keys(updates).length === 0) return { success: false, errors: ["No valid fields to update"] };

  return { success: true, data: updates };
}
