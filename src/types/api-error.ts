import { AxiosError } from 'axios'

export type ApiError = AxiosError<{ detail?: string }>
