import Header from '@/components/Header'

export default function DownloadPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <div className="container mx-auto px-6 pt-24 pb-12">
        <h1 className="text-5xl font-bold mb-12">Download ORE CLI</h1>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
          <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800">
            <h2 className="text-2xl font-bold mb-4">Web Mining</h2>
            <p className="text-zinc-400 mb-6">
              Mine directly from your browser with no installation required.
            </p>
            <a 
              href="/mine"
              className="block w-full bg-ore-green hover:bg-ore-dark-green text-black font-bold py-3 text-center rounded transition-colors"
            >
              Start Web Mining
            </a>
          </div>

          <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800">
            <h2 className="text-2xl font-bold mb-4">CLI Mining</h2>
            <p className="text-zinc-400 mb-6">
              For higher performance, use the ORE CLI tool.
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Requirements:</h3>
                <ul className="text-sm text-zinc-400 space-y-1">
                  <li>• Rust installed</li>
                  <li>• Solana CLI installed</li>
                  <li>• Solana wallet with SOL</li>
                </ul>
              </div>
              <div className="bg-zinc-800 rounded p-4">
                <code className="text-sm text-ore-green">
                  cargo install ore-cli
                </code>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-zinc-900 rounded-lg p-8 border border-zinc-800 max-w-4xl">
          <h2 className="text-2xl font-bold mb-4">Installation Guide</h2>
          <div className="space-y-4 text-zinc-400">
            <div>
              <h3 className="font-semibold text-white mb-2">1. Install Rust</h3>
              <div className="bg-zinc-800 rounded p-3">
                <code className="text-sm">curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh</code>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">2. Install Solana CLI</h3>
              <div className="bg-zinc-800 rounded p-3">
                <code className="text-sm">sh -c "$(curl -sSfL https://release.solana.com/stable/install)"</code>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">3. Install ORE CLI</h3>
              <div className="bg-zinc-800 rounded p-3">
                <code className="text-sm">cargo install ore-cli</code>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">4. Start Mining</h3>
              <div className="bg-zinc-800 rounded p-3">
                <code className="text-sm">ore mine</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}