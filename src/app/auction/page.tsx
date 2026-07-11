import { CurrentDate } from "@/shared/ui/CurrentDate";
import { Header } from "@/widgets/header/ui/Header";

// 💡 사진에서 추출한 10개의 경매 상황 데이터
const AUCTION_ITEMS = [
  {
    id: 1,
    title: "나와 내 가족들을 언제나 건강하게 할 수 있는 치유의 물약",
    price: 2750000,
    rankColor: "bg-[#FF8A65] text-white",
  },
  {
    id: 2,
    title: "생계 걱정 없을 정도로 매달 채워지는 돈 항아리",
    price: 2600000,
    rankColor: "bg-[#FFD54F] text-yellow-900",
  },
  {
    id: 3,
    title: "언제나 올바른 판단을 할 수 있도록 하는 지혜의 지팡이",
    price: 400000,
    rankColor: "bg-[#FFCCBC] text-orange-900",
  },
  {
    id: 4,
    title: "말 한 마디로 판세를 바꿀 수 있는 선언의 나팔",
    price: 0,
    rankColor: "bg-[#64B5F6] text-white",
  },
  {
    id: 5,
    title: "전 세계적으로 존경받는 명성과 명예의 반지",
    price: 0,
    rankColor: "bg-[#81C784] text-white",
  },
  {
    id: 6,
    title: "남는 시간을 저장하면 필요할 때 꺼내 쓸 수 있는 시계",
    price: 0,
    rankColor: "bg-[#BA68C8] text-white",
  },
  {
    id: 7,
    title: "열 때마다 새롭고 특별한 순간이 시작되는 경험의 문",
    price: 0,
    rankColor: "bg-[#4CAF50] text-white",
  },
  {
    id: 8,
    title: "원하는 사람의 마음을 단번에 사로잡는 매력의 향수",
    price: 0,
    rankColor: "bg-[#F06292] text-white",
  },
  {
    id: 9,
    title: "어떤 좌절도 극복하게 해주는 회복의 거울",
    price: 0,
    rankColor: "bg-[#42A5F5] text-white",
  },
  {
    id: 10,
    title: "울리는 순간, 싸움과 갈등이 멈추는 평화의 종",
    price: 0,
    rankColor: "bg-[#B0BEC5] text-white",
  },
];

export default function AuctionRankingPage() {
  return (
    <>
      <Header />
      {/* 전체 배경을 밝은 톤으로 깔고 컨텐츠를 가운데 정렬 */}
      <div className="mx-auto min-h-screen">
        {/* 상단 헤더 영역 (이미지의 텍스트와 동전 일러스트) */}
        <div className="relative px-6 pt-8 pb-4">
          <div className="inline-block px-3 py-1 mb-4 text-sm font-bold text-gray-500 bg-white border border-gray-200 rounded-full shadow-sm">
            <CurrentDate />
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            경매 누적 랭킹 순위
          </h1>
          <p className="mt-2 text-sm md:text-base font-medium text-gray-500">
            물건 이름을 클릭하면,{" "}
            <span className="text-[#F25C54]">낙찰 이유</span>를 살펴볼 수
            있어요!
          </p>

          {/* 우측 동전 스택 일러스트 (Tailwind CSS로 간략히 구현) */}
          <div className="absolute right-6 top-6 flex flex-col items-center">
            <div className="w-16 h-4 bg-orange-300 rounded-full border-b-2 border-orange-400 mb-[-8px] z-10"></div>
            <div className="w-16 h-4 bg-orange-400 rounded-full border-b-2 border-orange-500 mb-[-8px] z-20"></div>
            <div className="w-16 h-4 bg-orange-500 rounded-full border-b-2 border-orange-600 mb-1 z-30"></div>
            <div className="flex items-center justify-center w-12 h-12 bg-orange-500 rounded-full shadow-lg border-2 border-orange-300 z-31 text-white font-bold text-xl">
              ₩
            </div>
          </div>
        </div>

        {/* 탭 메뉴 영역 */}
        <div className="px-6 flex gap-4 border-b border-gray-200 pb-2 overflow-x-auto no-scrollbar">
          <button className="px-4 py-1 text-sm font-bold text-white bg-[#5D4037] rounded-md shrink-0">
            전체
          </button>
          {["10대", "20대", "30대", "40대", "50대~"].map((tab) => (
            <button
              key={tab}
              className="px-2 py-1 text-sm font-bold text-gray-300 hover:text-gray-500 shrink-0 transition-colors"
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 랭킹 리스트 영역 */}
        <div className="flex flex-col mt-2 pb-20">
          {AUCTION_ITEMS.map((item, index) => (
            <div
              key={item.id}
              // 짝수 줄마다 배경색을 살짝 다르게 주어 가독성을 높임
              className={`flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-white transition-colors border-b border-gray-100 ${index % 2 === 1 ? "bg-gray-50/50" : ""}`}
            >
              <div className="flex items-center flex-1 gap-4">
                {/* 순위 박스 (이미지의 색상 완벽 반영) */}
                <span
                  className={`flex items-center justify-center w-8 h-8 font-bold rounded-lg shrink-0 ${item.rankColor}`}
                >
                  {item.id}
                </span>

                {/* 물품 이름 */}
                <h2 className="text-sm md:text-base font-bold text-gray-800 break-keep line-clamp-2 pr-4">
                  {item.title}
                </h2>

                {/* 화살표 아이콘 */}
                <svg
                  className="w-4 h-4 text-gray-300 shrink-0 ml-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>

              {/* 우측 아이콘 및 가격 영역 */}
              <div className="flex items-center gap-3 shrink-0 ml-6 w-28 justify-end">
                {/* 입찰 상태 동그라미 아이콘 */}
                <div
                  className={`flex items-center justify-center w-5 h-5 rounded-full border-2 ${item.price > 0 ? "border-orange-400" : "border-gray-200"}`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${item.price > 0 ? "bg-orange-400" : "bg-transparent"}`}
                  ></div>
                </div>

                {/* 가격 표시 */}
                <span
                  className={`text-sm md:text-base font-extrabold ${item.price > 0 ? "text-gray-900" : "text-gray-400"}`}
                >
                  {item.price === 0 ? "0만 원" : `${item.price / 10000}만 원`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
