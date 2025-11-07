export default function Hero() {
  return (
    <section className="pt-32 pb-16 px-6">
      <div className="container mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-ore-accent to-green-400 bg-clip-text text-transparent">
          Mine ORE on Solana
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
          The first proof-of-work token on Solana. Mine from any device, anywhere, anytime.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-ore-accent text-ore-bg px-8 py-4 rounded-lg font-bold text-lg hover:bg-ore-accent/90 transition">
            Start Mining
          </button>
          <button className="border border-ore-accent text-ore-accent px-8 py-4 rounded-lg font-bold text-lg hover:bg-ore-accent/10 transition">
            Learn More
          </button>
        </div>
      </div>
    </section>
  )
}