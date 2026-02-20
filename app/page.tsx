import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-premium text-cream">
      {/* Sticky Header with CTA */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-navy-900/95 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="font-display text-2xl font-bold bg-gradient-warm bg-clip-text text-transparent">
            ContentOS
          </div>
          <Link
            href="/create"
            className="group relative inline-flex items-center gap-2"
          >
            <div className="absolute inset-0 bg-gradient-warm rounded-lg blur-lg opacity-60 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-gradient-warm text-navy-900 font-bold px-6 py-3 rounded-lg transition-all transform group-hover:scale-105 shadow-lg">
              Create Content
              <span className="ml-2">→</span>
            </div>
          </Link>
        </div>
      </header>

      {/* Hero Section - Cinematic & Tall */}
      <section className="relative overflow-hidden pt-40 pb-32 px-6 min-h-screen flex items-center">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.15) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          {/* Hero Headline - Serif, Editorial Style */}
          <h1 className="font-serif text-6xl md:text-8xl font-bold text-cream mb-8 leading-tight tracking-tight">
            Turn Photos into
            <br />
            <span className="bg-gradient-warm bg-clip-text text-transparent">
              Instagram Content
            </span>
            <br />
            <span className="text-5xl md:text-6xl text-white">in 2 Minutes</span>
          </h1>

          {/* Subheading with Letter Spacing */}
          <p className="text-xl md:text-2xl text-cream/80 mb-12 max-w-3xl mx-auto tracking-wide">
            30X faster than manual creation. Built for founders like Andrés Bilbao.
          </p>

          {/* CTA Button with Gold Glow */}
          <Link
            href="/create"
            className="group inline-block relative"
          >
            <div className="absolute inset-0 bg-gradient-warm rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-warm text-navy-900 font-bold text-lg py-5 px-14 rounded-xl transition-all transform group-hover:scale-105 shadow-2xl">
              Try Free Now
            </div>
          </Link>

          <p className="text-cream/60 mt-6 text-sm tracking-wider">
            No credit card • Unlimited generations • ARCS Framework + 10 Expert Methodologies
          </p>
        </div>
      </section>

      {/* Thin Gold Accent Line */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-30"></div>

      {/* Social Proof - Glassmorphism Cards */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { metric: '30X', label: 'Faster than manual' },
              { metric: '20+ hrs', label: 'Saved per week' },
              { metric: '$0.015', label: 'Per generation' },
            ].map((stat, i) => (
              <div
                key={i}
                className="relative group"
              >
                {/* Glassmorphism card */}
                <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-10 text-center hover:bg-white/10 transition-all duration-300 hover:scale-105">
                  <div className="text-5xl font-bold bg-gradient-warm bg-clip-text text-transparent mb-3">
                    {stat.metric}
                  </div>
                  <div className="text-cream/70 tracking-wide">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Asymmetric Layout */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-serif text-5xl md:text-6xl font-bold text-cream text-center mb-24">
            How It Works
          </h2>

          <div className="space-y-20">
            {[
              {
                number: '01',
                title: 'Upload Photos',
                desc: 'Upload 3-10 photos of your business, product, or service. Add your business description and key messages.',
              },
              {
                number: '02',
                title: 'AI Magic',
                desc: 'Google Gemini analyzes your photos using the ARCS Framework (Audiencia, Resultado, Consecuencias, Auto-Optimización) and creates scroll-stopping content.',
              },
              {
                number: '03',
                title: 'Download & Post',
                desc: 'Download your 10-slide carousel (ZIP) and reel script. Copy the AI-generated caption and hashtags. Post to Instagram.',
              },
            ].map((step, i) => (
              <div
                key={i}
                className={`flex flex-col ${
                  i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                } items-center gap-16`}
              >
                {/* Badge */}
                <div className="flex-shrink-0">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-warm rounded-full opacity-20 blur-xl"></div>
                    <div className="relative w-24 h-24 bg-gradient-warm rounded-full flex items-center justify-center shadow-2xl">
                      <span className="font-serif text-3xl font-bold text-navy-900">
                        {step.number}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-serif text-3xl md:text-4xl font-bold text-gold-500 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-lg text-cream/80 leading-relaxed max-w-2xl">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - 2-Column Offset */}
      <section className="py-32 px-6 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-serif text-5xl md:text-6xl font-bold text-cream text-center mb-8">
            What You Get
          </h2>
          <p className="text-center text-cream/70 text-lg mb-20 tracking-wide">
            Professional-grade content in minutes, not hours
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: '🎨',
                title: '10-Slide Carousel',
                desc: 'Professional 1080x1080 PNG slides with ARCS methodology and expert-backed storytelling. Download as ZIP.',
              },
              {
                icon: '🎬',
                title: 'Instagram Reel Script',
                desc: '5-7 second script optimized for <10s attention span. Perfect for teleprompter use.',
              },
              {
                icon: '✍️',
                title: 'AI Caption',
                desc: 'Engaging 150-word caption in your chosen tone with conversational "I/my/me" voice.',
              },
              {
                icon: '#️⃣',
                title: 'Smart Hashtags',
                desc: '15 relevant, trending-ready tags tailored to your content and industry.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="relative group"
              >
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:shadow-2xl hover:scale-105">
                  <div className="text-5xl mb-6">{feature.icon}</div>
                  <h3 className="font-serif text-2xl font-bold text-gold-500 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-cream/80 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-5xl md:text-6xl font-bold text-cream mb-8">
            Ready to 30X Your
            <br />
            <span className="bg-gradient-warm bg-clip-text text-transparent">
              Content Creation?
            </span>
          </h2>
          <p className="text-xl text-cream/70 mb-12 tracking-wide">
            Join founders saving 20+ hours per week on Instagram content
          </p>

          <Link
            href="/create"
            className="group inline-block relative"
          >
            <div className="absolute inset-0 bg-gradient-warm rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-warm text-navy-900 font-bold text-lg py-5 px-14 rounded-xl transition-all transform group-hover:scale-105 shadow-2xl">
              Create Your First Content
            </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-cream/60">
          <p className="tracking-wide">Built for founders who want to automate content creation</p>
          <p className="mt-3 text-sm text-cream/50">
            Powered by Google Gemini 2.5 Flash • ARCS Framework + 10 Expert Methodologies
          </p>
        </div>
      </footer>
    </div>
  );
}
