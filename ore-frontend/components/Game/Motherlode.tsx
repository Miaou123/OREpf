interface MotherlodeProps {
  amount: number
}

export default function Motherlode({ amount }: MotherlodeProps) {
  return (
    <div className="bg-gradient-to-br from-[rgba(157,74,226,0.1)] to-[rgba(74,144,226,0.1)] border-2 border-[#FFD700] rounded-xl p-6 text-center">
      <div className="text-[36px] font-bold mb-2 flex items-center justify-center gap-2">
        <div className="token-icon"></div>
        <span>{amount}</span>
      </div>
      <div className="text-sm text-[#a0a0a0]">Motherlode</div>
    </div>
  )
}