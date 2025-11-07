interface SummaryStat {
  label: string
  value: string | number
  tooltip: string
  icon?: 'token' | 'sol'
}

interface SummaryProps {
  stats: SummaryStat[]
}

export default function Summary({ stats }: SummaryProps) {
  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-8">Summary</h2>
      <div className="flex flex-col gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className={`flex justify-between items-center ${
              index < stats.length - 1 ? 'pb-6 border-b border-[#333]' : ''
            }`}
          >
            <div className="flex items-center gap-2 text-base text-[#a0a0a0]">
              <span>{stat.label}</span>
              <span 
                className="info-icon" 
                title={stat.tooltip}
              ></span>
            </div>
            <div className="text-lg font-bold flex items-center gap-2">
              {stat.icon && (
                <div className={stat.icon === 'token' ? 'token-icon' : 'sol-icon'}></div>
              )}
              <span>{stat.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}