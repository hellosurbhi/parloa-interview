export interface ShortenedUrl {
  short_code: string;
  original_url: string;
  short_url: string;
  created_at: string;
}

export interface ApiSuccessResponse<T> {
  data: T;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
