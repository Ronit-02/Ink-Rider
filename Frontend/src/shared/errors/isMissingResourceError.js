export default function isMissingResourceError(error) {
  return [400, 404].includes(error?.response?.status)
}
