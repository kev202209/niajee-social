export default function timeAgo(isoDateString: string): string {
  // Handle invalid input
  if (!isoDateString) return "unknown";
  
  const now = new Date();
  const past = new Date(isoDateString);
  
  // Check if the date is valid
  if (isNaN(past.getTime())) {
    return "unknown";
  }
  
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  // Handle future dates
  if (seconds < 0) {
    return "in the future";
  }
  
  // Less than a minute
  if (seconds < 60) {
    return seconds <= 5 ? "just now" : `${seconds} sec${seconds === 1 ? "" : "s"}`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min${minutes === 1 ? "" : "s"}`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hr${hours === 1 ? "" : "s"}`;
  }

  const days = Math.floor(hours / 24);
  
  // Days
  if (days === 1) {
    return "yesterday";
  }
  
  if (days < 7) {
    return `${days} days`;
  }

  // Weeks
  const weeks = Math.floor(days / 7);
  if (weeks === 1) {
    return "1 wk ";
  }
  
  if (weeks < 4) {
    return `${weeks} wks `;
  }

  // Months (more accurate calculation)
  const months = Math.floor(days / 30.44); // Average days per month
  if (months === 1) {
    return "a mo";
  }
  
  if (months < 12) {
    return `${months} mos `;
  }

  // Years
  const years = Math.floor(days / 365.25); // Account for leap years
  if (years === 1) {
    return "a yr ";
  }
  
  return `${years} yrs `;
}