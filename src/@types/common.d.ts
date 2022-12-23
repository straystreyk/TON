export interface FetchUrlOpts<Data> {
  url: string
  params?: RequestInit
  onSuccess?: (data: Data) => void
  onError?: (message: string) => void
  onFinally?: () => void
}
