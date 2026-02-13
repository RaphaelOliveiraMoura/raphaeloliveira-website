/** Standard API error response shape (matches frontend ApiError) */
export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  status: number;
}

/** Standard API success response wrapper */
export interface ApiSuccessResponse<T> {
  data: T;
}

/** JWT token payload */
export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}
