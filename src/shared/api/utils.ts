import { NextResponse } from "next/server";
import { ApiResponse } from "./api.types";

// 1. 성공 응답 헬퍼
export function createSuccessResponse<T>(
  data: T,
  message: string = "요청이 성공적으로 처리되었습니다.",
  statusCode: number = 200,
) {
  const response: ApiResponse<T> = { status: "success", message, data };
  return NextResponse.json(response, { status: statusCode });
}

// 2. 에러 응답 헬퍼
export function createErrorResponse(
  message: string,
  error?: unknown,
  statusCode: number = 500,
) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const response: ApiResponse<null> = {
    status: "error",
    message,
    error: errorMessage,
  };
  return NextResponse.json(response, { status: statusCode });
}
