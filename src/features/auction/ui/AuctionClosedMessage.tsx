interface Props {
  isWinner: boolean | undefined;
  onClose: () => void;
}

export function AuctionClosedMessage({ isWinner, onClose }: Props) {
  return (
    <div
      className={`p-4 rounded-2xl text-center border ${isWinner ? "bg-amber-50 border-amber-200" : "bg-gray-100 border-gray-200"}`}
    >
      <div className="text-2xl mb-2">{isWinner ? "🎉" : "🕊️"}</div>
      <p
        className={`font-black text-lg ${isWinner ? "text-amber-700" : "text-gray-600"}`}
      >
        {isWinner ? "축하합니다! 낙찰되셨습니다." : "경매가 마감되었습니다."}
      </p>
      <button
        onClick={onClose}
        className="mt-4 w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 cursor-pointer"
      >
        닫기
      </button>
    </div>
  );
}
