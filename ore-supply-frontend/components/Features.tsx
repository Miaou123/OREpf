export default function Features() {
  const features = [
    {
      title: 'No Special Hardware',
      description: 'Mine ORE from any device - laptop, phone, or desktop computer.',
      icon: '💻'
    },
    {
      title: 'Fair Distribution',
      description: 'Proof-of-work ensures fair token distribution to all miners.',
      icon: '⚖️'
    },
    {
      title: 'Solana Speed',
      description: 'Built on Solana for fast transactions and low fees.',
      icon: '⚡'
    },
    {
      title: 'Fixed Supply',
      description: '21 million ORE total supply, like Bitcoin.',
      icon: '🔒'
    }
  ]

  return (
    <section className="py-16 px-6 bg-ore-surface/30">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Why Mine ORE?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-ore-bg/50 rounded-lg p-6 hover:bg-ore-bg/70 transition border border-gray-700">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}