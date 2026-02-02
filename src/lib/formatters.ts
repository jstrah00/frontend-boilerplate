/**
 * Shared formatting utilities
 */

export const formatDate = (dateString: string, locale = "en-US") => {
  try {
    return new Date(dateString).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  } catch {
    return dateString
  }
}

export const formatDateLong = (dateString: string, locale = "en-US") => {
  try {
    return new Date(dateString).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  } catch {
    return dateString
  }
}

export const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export const truncateText = (text: string, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text || "-"
  return `${text.substring(0, maxLength)}...`
}
