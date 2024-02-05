declare interface User extends UserPreferences {
  id?: number
  email: string
  password?: string
  created_at?: number
}

declare interface UserPreferences {
  display_name: string
  display_currency: string
  start_amount: number
}

declare interface Entry {
  id?: number
  name: string
  is_income: boolean
  amount: number
  category_id: number | null
  category?: Category
  occurs_on: number | null
  reccuring: boolean
  reccuring_frequency: string | null
  reccuring_frequency_start: number | null
  user_id?: number
  created_at?: number
}

declare interface ForecastDateObject {
  date: string | Date
  incomes: {
    entry: Entry
    occurances: number
  }[]
  outcomes: {
    entry: Entry
    occurances: number
  }[]
  value: number
}

declare interface Category {
  id?: number
  name: string
  color:
    | 'red'
    | 'orange'
    | 'yellow'
    | 'green'
    | 'blue'
    | 'indigo'
    | 'violet'
    | null
  icon: string | null
  user_id?: number
  created_at?: number
}

declare interface AuthCredentials {
  username: string
  password: string
}
