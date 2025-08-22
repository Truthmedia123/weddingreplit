

export default function Hero() {
  return (
    <section className="hero-section relative min-h-screen flex items-center overflow-hidden">
      {/* Background with stunning beach wedding image */}
      <div className="absolute inset-0 z-0">
        <picture>
          <source srcSet="/images/optimized/hero.webp" type="image/webp" />
          <img
            src="/images/optimized/hero.jpg"
            alt="Beautiful Goan beach wedding ceremony"
            className="w-full h-full object-cover scale-110"
            loading="eager"
            onError={(e) => {
              // Fallback to non-optimized version
              e.currentTarget.src = "/images/hero.jpg";
              e.currentTarget.onerror = () => {
                // Ultimate fallback to gradient
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-sky-400 via-blue-500 to-teal-600"></div>';
                }
              };
            }}
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/40"></div>
      </div>

      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-element absolute top-20 left-10 w-4 h-4 bg-yellow-400 rounded-full opacity-60 hidden md:block"></div>
        <div className="floating-element absolute top-40 right-20 w-6 h-6 bg-teal-400 rounded-full opacity-40 hidden md:block"></div>
        <div className="floating-element absolute bottom-40 left-20 w-3 h-3 bg-red-400 rounded-full opacity-50 hidden lg:block"></div>
        <div className="floating-element absolute bottom-60 right-40 w-5 h-5 bg-yellow-300 rounded-full opacity-30 hidden lg:block"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center">
          <div className="animate-fade-in-up">
            {/* Elegant subtitle */}
            <p className="wedding-script text-xl md:text-2xl lg:text-3xl text-yellow-300 mb-3 md:mb-4 opacity-90">
              Where Dreams Come True
            </p>
            
            {/* Main heading */}
            <h1 className="text-3xl sm:text-4xl md:text-7xl lg:text-8xl font-bold text-white mb-4 md:mb-6 leading-tight px-2 sm:px-0">
              <span className="block mb-1 md:mb-2">Celebrate Your</span>
              <span className="goan-text-gradient wedding-script text-4xl sm:text-5xl md:text-8xl lg:text-9xl">
                Perfect Day
              </span>
              <span className="block text-2xl sm:text-3xl md:text-5xl lg:text-6xl mt-2 md:mt-4 text-teal-300">
                Goan Style
              </span>
            </h1>
            
            {/* Enhanced description */}
            <p className="text-lg md:text-xl lg:text-2xl text-gray-200 mb-8 md:mb-12 leading-relaxed max-w-4xl mx-auto px-4 sm:px-0">
              Discover Goa's most exquisite wedding vendors and create unforgettable memories. 
              From stunning beach ceremonies to authentic Portuguese-Goan celebrations.
            </p>

            {/* Trust indicators */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">500+</div>
                <div className="text-sm text-gray-300">Verified Vendors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">1000+</div>
                <div className="text-sm text-gray-300">Happy Couples</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">15+</div>
                <div className="text-sm text-gray-300">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">5★</div>
                <div className="text-sm text-gray-300">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}