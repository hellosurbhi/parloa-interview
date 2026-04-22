export interface ShortenedUrl {
  short_code: string;
  original_url: string;
  short_url: string;
  created_at: string;
  expires_at: string | null;
}

export interface CreateUrlRequest {
  url: string;
  custom_alias?: string;
  expires_in?: number;
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
