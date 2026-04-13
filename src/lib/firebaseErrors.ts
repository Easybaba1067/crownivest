const errorMap: Record<string, string> = {
  "auth/invalid-credential": "Invalid email or password.",
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Incorrect password.",
  "auth/email-already-in-use": "This email is already registered.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/network-request-failed": "Network error. Check your connection.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/requires-recent-login": "Please log in again to perform this action.",
  "auth/popup-closed-by-user": "Sign-in was cancelled.",
  "permission-denied": "You don't have permission to do that.",
  "unavailable": "Service temporarily unavailable. Try again.",
  "not-found": "The requested data was not found.",
};

export const getFirebaseErrorMessage = (error: any): string => {
  const code = error?.code || "";
  return errorMap[code] || "Something went wrong. Please try again.";
};
