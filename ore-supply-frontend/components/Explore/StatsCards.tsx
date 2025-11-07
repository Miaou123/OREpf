'use client'

interface StatCard {
  label: string
  value: string
  prefix?: string
}

const stats: StatCard[] = [
  {
    label: 'Max Supply',
    value: '5,000,000',
    prefix: '◎'
  },
  {
    label: 'Circulating Supply',
    value: '413,399',
    prefix: '◎'
  },
  {
    label: 'Burned (7d)',
    value: '9,060',
    prefix: '◎'
  },
  {
    label: 'Protocol Rev (7d)',
    value: '10,067',
    prefix: '≡'
  }
]

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="stat-card">
          <div className="text-2xl font-bold mb-1">
            {stat.prefix && <span className={stat.prefix === '≡' ? 'text-accent-blue' : ''}>{stat.prefix} </span>}
            {stat.value}
          </div>
          <p className="text-sm text-text-secondary">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}