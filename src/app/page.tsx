import Link from "next/link";
import { ROUTES } from "@/shared/config/routes";

const ONBOARDING_SLIDES = [
  {
    id: "slide-1",
    nextId: "slide-2",
    image: "/images/onboarding-1.png",
    title: "삶으로 쓰는 예배전",
    description:
      "우리가 남긴 가치들이 새로운 주인을 만납니다.\n현장에서 진행되는 특별한 경매에 참여해보세요.",
  },
  {
    id: "slide-2",
    nextId: "slide-3",
    image: "/images/onboarding-2.gif",
    title: "실시간으로 진행되는 입찰",
    description:
      "마음에 드는 물품에 입찰하세요.\n치열한 눈치싸움과 함께 현장의 열기를 느낄 수 있습니다.",
  },
  {
    id: "slide-3",
    nextId: null,
    image: "/images/onboarding-3.png",
    title: "황금빛 낙찰의 순간",
    description:
      "시간이 종료되는 순간, 가장 높은 가치를\n인정한 분에게 물품이 최종 낙찰됩니다.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative flex flex-col h-screen max-h-screen bg-white overflow-hidden">
      {/* 
        💡 건너뛰기 버튼: 슬라이드 컨테이너 바깥으로 빼서 절대 위치로 고정 (화면 우측 상단 둥둥 띄움)
        슬라이드가 스크롤돼도 얘는 절대 안 움직입니다!
      */}
      <div className="absolute top-6 right-6 z-20">
        <Link
          href={ROUTES.AUCTION || "/auction"}
          className="text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors bg-transparent px-2 py-1 rounded"
        >
          건너뛰기
        </Link>
      </div>

      <div className="flex w-full h-full overflow-x-hidden scroll-smooth mt-12">
        {ONBOARDING_SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            id={slide.id}
            className="flex flex-col w-full h-full shrink-0 relative"
          >
            {/* 💡 헤더 영역 (Bullets 전용) - 건너뛰기는 뺐으므로 점들만 정확히 가운데 정렬 */}
            <div className="flex items-center justify-center w-full h-12">
              <div className="flex items-center gap-2 min-h-8">
                {ONBOARDING_SLIDES.map((targetSlide, dotIndex) => (
                  <a
                    key={targetSlide.id}
                    href={`#${targetSlide.id}`}
                    aria-label={`${dotIndex + 1}번째 슬라이드로 이동`}
                    className={`block h-2 rounded-full transition-all duration-300 ${
                      index === dotIndex
                        ? "w-6 bg-gray-900 pointer-events-none"
                        : "w-2 bg-gray-200 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* 💡 중앙 컨텐츠 영역 */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 w-full max-w-sm mx-auto pb-2 min-h-0">
              {/* 
                ✨ 사이즈업 포인트 ✨
                1. max-h-[58vh] -> max-h-[65vh] 로 변경 (화면 세로 길이의 65%까지 꽉 채워서 커짐!)
                2. mb-6 -> mb-4 로 이미지 아래 여백을 살짝 줄여 공간 확보
              */}
              <div className="flex-1 w-full min-h-0 flex items-center justify-center mb-4">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-auto h-full max-h-[65vh] object-contain rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-gray-100"
                />
              </div>

              {/* 텍스트 영역 (이미지가 커진 만큼 텍스트 간격도 아주 살짝 타이트하게 조절) */}
              <div className="text-center w-full shrink-0">
                <h1 className="text-2xl font-black text-gray-900 mb-2 break-keep">
                  {slide.title}
                </h1>
                <p className="text-[15px] text-gray-500 font-medium leading-relaxed whitespace-pre-wrap break-keep">
                  {slide.description}
                </p>
              </div>
            </div>

            {/* 💡 하단 고정 액션 버튼 */}
            <div className="px-6 pb-12 pt-4 w-full max-w-sm mx-auto">
              {slide.nextId ? (
                <a
                  href={`#${slide.nextId}`}
                  className="flex items-center justify-center w-full py-4 text-lg font-black text-white bg-[#171717] rounded-2xl hover:bg-gray-800 active:scale-95 transition-all shadow-lg shadow-gray-200"
                >
                  다음
                </a>
              ) : (
                <Link
                  href={ROUTES.AUCTION || "/auction"}
                  className="flex items-center justify-center w-full py-4 text-lg font-black text-white bg-[#171717] rounded-2xl hover:bg-gray-800 active:scale-95 transition-all shadow-lg shadow-gray-200"
                >
                  경매장 입장하기
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
