'use client'

export default function Stats() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="card text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-accent-blue">≡</span>
          <span className="text-lg font-bold">32.2714</span>
        </div>
        <p className="text-sm text-text-secondary">Total deployed</p>
      </div>
      
      <div className="card text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-accent-blue">≡</span>
          <span className="text-lg font-bold">0.0000</span>
        </div>
        <p className="text-sm text-text-secondary">You deployed</p>
      </div>
    </div>
  )
}