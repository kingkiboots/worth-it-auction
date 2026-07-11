"use client";

export function CurrentDate() {
  // 오늘 날짜 포맷팅 (예: 26.06.26)
  const today = new Date();
  const dateString = `${today.getFullYear().toString().slice(2)}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;

  return dateString;
}
