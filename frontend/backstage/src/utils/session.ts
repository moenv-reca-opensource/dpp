const ACCOUNT_KEY = 'battery_dpp_account'

export const signedInAccount = {
  get: () => localStorage.getItem(ACCOUNT_KEY),
  set: (account: string) => localStorage.setItem(ACCOUNT_KEY, account),
  clear: () => localStorage.removeItem(ACCOUNT_KEY)
}
