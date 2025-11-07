'use client'

interface SummaryItem {
  label: string
  value: string
  hasInfo: boolean
}

const summaryData: SummaryItem[] = [
  {
    label: 'Total deposits',
    value: '◎ 245,612',
    hasInfo: true
  },
  {
    label: 'APR',
    value: '21.31%',
    hasInfo: true
  },
  {
    label: 'TVL',
    value: '$75,867,792',
    hasInfo: true
  }
]

export default function Summary() {
  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Summary</h3>
      <div className="space-y-3">
        {summaryData.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-text-secondary">{item.label}</span>
              {item.hasInfo && (
                <div className="group relative">
                  <span className="text-text-muted cursor-help">ⓘ</span>
                  <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-surface border border-border rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {item.label === 'Total deposits' && 'Total ORE staked in the protocol'}
                    {item.label === 'APR' && 'Annual Percentage Rate - estimated yearly return'}
                    {item.label === 'TVL' && 'Total Value Locked - USD value of all staked ORE'}
                  </div>
                </div>
              )}
            </div>
            <span className="font-bold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}