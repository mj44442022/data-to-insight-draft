import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Turn Photos into
            <br />
            <span className="text-primary">Instagram Content</span>
            <br />
            in 2 Minutes
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto">
            30X faster than manual creation. Built for founders like Andrés Bilbao.
          </p>

          <Link
            href="/create"
            className="inline-block bg-primary hover:bg-blue-600 text-white font-bold text-lg py-4 px-12 rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Try Free Now
          </Link>

          <p className="text-gray-500 mt-4 text-sm">
            No credit card required • Generate unlimited content
          </p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 px-4 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">30X</div>
              <div className="text-gray-400">Faster than manual creation</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">20+ hrs</div>
              <div className="text-gray-400">Saved per week</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">$0.20</div>
              <div className="text-gray-400">Cost per generation</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Upload Photos</h3>
              <p className="text-gray-400">
                Upload 3-10 photos of your business, product, or service. Add your
                business description and key messages.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI Magic</h3>
              <p className="text-gray-400">
                Google Gemini analyzes your photos and creates a 10-slide carousel and
                5-7 second reel with professional text overlays.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Download & Post</h3>
              <p className="text-gray-400">
                Download your carousel (ZIP) and reel (MP4). Copy the AI-generated caption
                and hashtags. Post to Instagram.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            What You Get
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-background rounded-xl p-8 border border-gray-800">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">10-Slide Carousel</h3>
              <p className="text-gray-400">
                Professional 1080x1080 PNG slides with text overlays, optimized for
                Instagram. Download as individual images or ZIP file.
              </p>
            </div>

            <div className="bg-background rounded-xl p-8 border border-gray-800">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Instagram Reel</h3>
              <p className="text-gray-400">
                5-7 second vertical video (1080x1920) at 30fps. Perfect for Instagram
                Reels with engaging transitions and text.
              </p>
            </div>

            <div className="bg-background rounded-xl p-8 border border-gray-800">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI Caption</h3>
              <p className="text-gray-400">
                Engaging Instagram caption (150 words) written in your chosen tone.
                Copy-paste ready.
              </p>
            </div>

            <div className="bg-background rounded-xl p-8 border border-gray-800">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Smart Hashtags</h3>
              <p className="text-gray-400">
                15 relevant hashtags tailored to your content and industry. Maximize your
                reach and discoverability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to 30X Your Content Creation?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join founders saving 20+ hours per week on content creation
          </p>
          <Link
            href="/create"
            className="inline-block bg-primary hover:bg-blue-600 text-white font-bold text-lg py-4 px-12 rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Create Your First Content
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto text-center text-gray-500">
          <p>Built for founders who want to automate content creation</p>
          <p className="mt-2 text-sm">Powered by Google Gemini 2.0 Flash</p>
        </div>
      </footer>
    </div>
  );
}
