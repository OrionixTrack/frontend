export interface AuthLinkAction {
  label: string
  to: {
    name: string
    query?: Record<string, string>
  }
}
