export interface ApiResponseModel<T> {
  code: number;
  responseType: string;
  message: string;
  content?: T;
}

export function getApiPayload<T>(body: ApiResponseModel<T>): T | undefined {
  return body.content;
}
