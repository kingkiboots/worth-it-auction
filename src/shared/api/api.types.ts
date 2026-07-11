// src/shared/types/api.ts

export type ApiResponse<T = unknown> =
  | {
      status: "success";
      message: string;
      data: T;
    }
  | {
      status: "error";
      message: string;
      error?: string | null;
    };
