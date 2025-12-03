export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-lightest via-white to-primary-light/30">
      
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center">
          
          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl font-bold text-primary-darkest mb-6">
            Discover Your Instagram Story
          </h1>
          
          <p className="text-xl sm:text-2xl text-primary-dark mb-8 max-w-3xl mx-auto">
            Analyze your Instagram data export and uncover fascinating insights about your digital life
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <a 
              href="/upload" 
              className="px-8 py-4 bg-primary text-white rounded-lg font-semibold text-lg hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Get Started →
            </a>
            <a 
              href="#features" 
              className="px-8 py-4 bg-white text-primary-dark border-2 border-primary rounded-lg font-semibold text-lg hover:bg-primary-lightest transition-all"
            >
              Learn More
            </a>
          </div>

          {/* Decorative Element */}
          <div className="text-8xl mb-8">📊</div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-primary-darkest text-center mb-12">
          What Can You Discover?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-primary-light">
            <div className="text-5xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-primary-darkest mb-3">
              Engagement Patterns
            </h3>
            <p className="text-primary-dark">
              See who you interact with most, your commenting habits, and engagement trends over time
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-primary-light">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-primary-darkest mb-3">
              Search Insights
            </h3>
            <p className="text-primary-dark">
              Discover your most searched profiles, places, and keywords to understand your interests
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-primary-light">
            <div className="text-5xl mb-4">📺</div>
            <h3 className="text-xl font-bold text-primary-darkest mb-3">
              Content Analysis
            </h3>
            <p className="text-primary-dark">
              Analyze your video watching habits, post views, and content consumption patterns
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-primary-light">
            <div className="text-5xl mb-4">📈</div>
            <h3 className="text-xl font-bold text-primary-darkest mb-3">
              Visual Statistics
            </h3>
            <p className="text-primary-dark">
              Beautiful charts and graphs that make your data easy to understand and explore
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-primary-light">
            <div className="text-5xl mb-4">🎮</div>
            <h3 className="text-xl font-bold text-primary-darkest mb-3">
              Interactive Game
            </h3>
            <p className="text-primary-dark">
              Play a fun game based on your personal Instagram data and see how well you know yourself
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-primary-light">
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="text-xl font-bold text-primary-darkest mb-3">
              Privacy First
            </h3>
            <p className="text-primary-dark">
              Your data never leaves your browser. Everything is processed locally and securely
            </p>
          </div>

        </div>
      </div>

      {/* How It Works Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-primary-darkest text-center mb-12">
          How It Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          
          <div className="text-center">
            <div className="w-16 h-16 bg-accent-green text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-xl font-bold text-primary-darkest mb-2">
              Download Your Data
            </h3>
            <p className="text-primary-dark">
              Request your Instagram data export from Instagram settings
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-accent-blue text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-xl font-bold text-primary-darkest mb-2">
              Upload JSON Files
            </h3>
            <p className="text-primary-dark">
              Upload one or multiple JSON files from your data export
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-accent-purple text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-xl font-bold text-primary-darkest mb-2">
              Explore Insights
            </h3>
            <p className="text-primary-dark">
              View visualizations, statistics, and play the interactive game
            </p>
          </div>

        </div>

        {/* CTA */}
        <div className="text-center">
          <a 
            href="/upload" 
            className="inline-block px-10 py-5 bg-accent-green text-white rounded-lg font-semibold text-xl hover:bg-primary transition-all shadow-lg hover:shadow-xl"
          >
            Start Analyzing Now
          </a>
        </div>
      </div>
    </div>
  );
}