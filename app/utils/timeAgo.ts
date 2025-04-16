export default function timeAgo(isoDateString: string): string {
  const now = new Date();
  const past = new Date(isoDateString);
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (seconds < 60) {
    return seconds <= 0 ? "just now" : `${seconds} second${seconds === 1 ? "" : "s"} ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  const weeks = Math.floor(days / 7);
  if (weeks < 4) {
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  }

  const months = Math.floor(days / 30); // Approximate month
  if (months >= 1 && months < 12) {
    return `${months} month${months === 1 ? "" : "s"} ago`;
  }

  const years = Math.floor(days / 365); // Approximate year
  if (years >= 1) {
    return `${years} year${years === 1 ? "" : "s"} ago`;
  }

  // More specific handling for cases between weeks and months, and multiple months
  if (days >= 7 && days < 14) {
    return "a week ago";
  }
  if (days >= 14 && days < 21) {
    return "2 weeks ago";
  }
  if (days >= 21 && days < 28) {
    return "3 weeks ago";
  }
  if (days >= 28 && days < 35) {
    return "4 weeks ago"; // Could also be "4 weeks ago"
  }
  if (days >= 35 && days < 60) {
    return "a month ago"; // More consistently "a month ago" after the initial "about"
  }
  if (days >= 60 && days < 90) {
    return "2 months ago";
  }
  if (days >= 90 && days < 120) {
    return "3 months ago";
  }
  if (days >= 120 && days < 150) {
    return "4 months ago";
  }
  if (days >= 150 && days < 180) {
    return "5 months ago";
  }
  if (days >= 180 && days < 210) {
    return "6 months ago";
  }
  if (days >= 210 && days < 240) {
    return "7 months ago";
  }
  if (days >= 240 && days < 270) {
    return "8 months ago";
  }
  if (days >= 270 && days < 300) {
    return "9 months ago";
  }
  if (days >= 300 && days < 330) {
    return "10 months ago";
  }
  if (days >= 330 && days < 365) {
    return "11 months ago";
  }

  if (years >= 1 && years < 2) {
    return "a year ago";
  }
  if (years >= 2) {
    return `${years} years ago`;
  }

  return "some time ago"; // Fallback
}