'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'

export default function Header() {
  const pathname = usePathname()
  const { connected } = useWallet()
  const { setVisible } = useWalletModal()

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-[72px] bg-[rgba(10,10,10,0.95)] backdrop-blur-[10px] border-b border-[#333] flex items-center justify-between px-8 z-[1000]">
      <div className="flex items-center gap-8">
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2">
          <span className="text-[18px] font-bold tracking-[2px]">PUMPORE</span>
        </div>
        <nav className="flex gap-6">
          <Link 
            href="/" 
            className={`${isActive('/') ? 'text-white border-b-2 border-white' : 'text-[#a0a0a0] hover:text-white'} text-base py-2 transition-colors border-b-2 border-transparent`}
          >
            Game
          </Link>
          <Link 
            href="/explore" 
            className={`${isActive('/explore') ? 'text-white border-b-2 border-white' : 'text-[#a0a0a0] hover:text-white'} text-base py-2 transition-colors border-b-2 border-transparent`}
          >
            Explore
          </Link>
          <Link 
            href="/stake" 
            className={`${isActive('/stake') ? 'text-white border-b-2 border-white' : 'text-[#a0a0a0] hover:text-white'} text-base py-2 transition-colors border-b-2 border-transparent`}
          >
            Stake
          </Link>
        </nav>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-base font-medium">
          <div className="token-icon"></div>
          <span>ORE $308.12</span>
        </div>
        <button 
          onClick={() => setVisible(true)}
          className="bg-white text-[#0a0a0a] border-none rounded-[24px] px-6 py-[10px] text-base font-semibold cursor-pointer transition-all hover:bg-[#f5f5f5] hover:-translate-y-[2px]"
        >
          Connect
        </button>
      </div>
    </header>
  )
}