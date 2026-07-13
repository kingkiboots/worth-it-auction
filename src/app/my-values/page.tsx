// src/app/my-values/page.tsx
import { Header } from "@/widgets/header/ui/Header";
import { redirect } from "next/navigation";
import { ROUTES } from "@/shared/config/routes";
import { createServerSideClient } from "@/shared/db/server";
import { Suspense } from "react";
import { MyValuesListSkeleton } from "@/features/auction/ui/MyValuesListSkeleton";
import { MyValuesListContainer } from "@/features/auction/ui/MyValuesListContainer";

export default async function MyValuesPage() {
  const supabase = await createServerSideClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(ROUTES.LOGIN);
  }

  return (
    <>
      <Header />
      <div className="w-full max-w-4xl mx-auto bg-[#F8F9FA] min-h-screen pb-20">
        <div className="px-6 pt-10 pb-8 bg-white border-b border-gray-100 mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
            내가 담은 가치들
          </h1>
          <p className="text-gray-500 text-sm font-medium leading-relaxed break-keep">
            내가 입찰한 상황들입니다. <br />이 가치들이 삶 속에서 아름답게
            쓰이길 소망합니다.
          </p>
        </div>

        <Suspense fallback={<MyValuesListSkeleton />}>
          <MyValuesListContainer userId={user.id} />
        </Suspense>
      </div>
    </>
  );
}
