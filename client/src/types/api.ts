export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  branchId: string;
}

export interface ErrorResponse {
  message: string;
  stack?: string;
}
