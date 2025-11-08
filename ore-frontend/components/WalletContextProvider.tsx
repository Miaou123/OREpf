'use client'

import { FC, ReactNode, useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'

import '@solana/wallet-adapter-react-ui/styles.css'

interface WalletContextProviderProps {
  children: ReactNode
}

export const WalletContextProvider: FC<WalletContextProviderProps> = ({ children }) => {
  // FIXED: Use RPC endpoint from environment variable instead of hardcoded public RPC
  const endpoint = useMemo(() => {
    // Read from NEXT_PUBLIC_RPC_ENDPOINT in .env.local
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_ENDPOINT
    
    if (!rpcUrl) {
      console.warn('⚠️  NEXT_PUBLIC_RPC_ENDPOINT not set in .env.local, using devnet fallback')
      return 'https://api.devnet.solana.com'
    }
    
    console.log('✅ Using RPC endpoint from .env.local')
    return rpcUrl
  }, [])
  
  const wallets = useMemo(
    () => [new PhantomWalletAdapter()],
    []
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}