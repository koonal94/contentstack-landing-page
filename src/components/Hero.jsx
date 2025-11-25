import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Play, Code, Globe, Shield, BarChart3, Users, Zap, ChevronLeft, ChevronRight, Pause } from 'lucide-react'
import { getEditTag } from '../utils/getEditTag'

const Hero = ({ data, loading, entry }) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const slides = [
    {
      title: 'Content Management',
      icon: <Code className="w-12 h-12" />,
      description: 'Intuitive interface for managing all your content',
      visual: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
          </div>
          <div className="h-6 bg-gradient-to-r from-primary-500 to-purple-500 rounded w-3/4"></div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-700 rounded-lg p-3 h-16 flex items-center justify-center">
                <div className="text-white font-bold text-sm">Content {i}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-2 bg-gray-200 rounded w-full"></div>
            <div className="h-2 bg-gray-200 rounded w-5/6"></div>
            <div className="h-2 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      ),
    },
    {
      title: 'API-First Architecture',
      icon: <Zap className="w-12 h-12" />,
      description: 'RESTful APIs and GraphQL for seamless integration',
      visual: (
        <div className="space-y-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-white text-xs font-mono mb-2">GET /v3/content_types</div>
            <div className="text-gray-300 text-xs font-mono">
              {`{
  "content_type": {...},
  "entries": [...]
}`}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex-1 h-2 bg-gradient-to-r from-primary-500 to-purple-500 rounded"></div>
            <div className="text-primary-600 dark:text-primary-400 text-xs">API</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {['REST', 'GraphQL', 'Webhooks'].map((api, i) => (
              <div key={i} className="bg-gray-700 rounded p-2 text-center">
                <div className="text-white text-xs font-semibold">{api}</div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Multi-Channel Publishing',
      icon: <Globe className="w-12 h-12" />,
      description: 'Publish to websites, apps, and any digital platform',
      visual: (
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="bg-gray-700 rounded-lg p-3 w-16 h-16 flex items-center justify-center">
              <div className="text-2xl">🌐</div>
            </div>
            <div className="text-primary-600 dark:text-primary-400 text-2xl">→</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-700 rounded p-2 text-center">
                <div className="text-xs text-white">Web</div>
              </div>
              <div className="bg-gray-700 rounded p-2 text-center">
                <div className="text-xs text-white">Mobile</div>
              </div>
              <div className="bg-gray-700 rounded p-2 text-center">
                <div className="text-xs text-white">IoT</div>
              </div>
              <div className="bg-gray-700 rounded p-2 text-center">
                <div className="text-xs text-white">Apps</div>
              </div>
            </div>
          </div>
          <div className="h-2 bg-gradient-to-r from-primary-500 via-purple-500 to-primary-500 rounded animate-pulse"></div>
        </div>
      ),
    },
    {
      title: 'Analytics & Insights',
      icon: <BarChart3 className="w-12 h-12" />,
      description: 'Track performance and optimize your content strategy',
      visual: (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[85, 92, 78].map((val, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{val}%</div>
                <div className="text-xs text-gray-700 dark:text-gray-400 mt-1">Metric {i + 1}</div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {[75, 90, 65, 85].map((height, i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="text-xs text-gray-700 dark:text-gray-400 w-12">Q{i + 1}</div>
                <div className="flex-1 bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full"
                    style={{ width: `${height}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Enterprise Security',
      icon: <Shield className="w-12 h-12" />,
      description: 'Bank-level encryption and compliance certifications',
      visual: (
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2">
            {['🔒', '🛡️', '✅'].map((icon, i) => (
              <div key={i} className="bg-gray-700 rounded-lg p-3">
                <div className="text-2xl">{icon}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {['SOC 2', 'GDPR', 'ISO 27001', 'SSO'].map((cert, i) => (
              <div key={i} className="bg-gray-700 rounded p-2 text-center">
                <div className="text-xs text-white font-semibold">{cert}</div>
              </div>
            ))}
          </div>
          <div className="h-2 bg-gradient-to-r from-primary-500 to-purple-500 rounded"></div>
        </div>
      ),
    },
    {
      title: 'Team Collaboration',
      icon: <Users className="w-12 h-12" />,
      description: 'Work together seamlessly with role-based permissions',
      visual: (
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
              <div className="text-xs text-gray-300">3 team members active</div>
            </div>
            <div className="space-y-1">
              <div className="h-1 bg-gray-600 rounded w-full"></div>
              <div className="h-1 bg-gray-600 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      ),
    },
  ]

  useEffect(() => {
    if (isPaused) return
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 4000) // Change slide every 4 seconds

    return () => clearInterval(interval)
  }, [slides.length, isPaused])

  return (
    <section className="relative pt-32 pb-12 md:pt-40 md:pb-16 overflow-hidden bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950">
      {/* Contentstack-style Mesh Gradient Background with Zoom Animations */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Mesh Gradient Layers - Flowing organic shapes with slide-synced zoom */}
        <div className="absolute inset-0">
          {/* Layer 1 - Top right mesh - Zoom in/out with slides */}
          <motion.div
            className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-primary-500/40 via-purple-400/30 to-transparent rounded-full filter blur-[140px]"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: currentSlide % 2 === 0 ? [1, 1.4, 1] : [1.2, 1, 1.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            key={`layer1-${currentSlide}`}
          />
          
          {/* Layer 2 - Bottom left mesh - Zoom in/out with slides */}
          <motion.div
            className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-tr from-purple-500/35 via-primary-500/25 to-transparent rounded-full filter blur-[130px]"
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
              scale: currentSlide % 2 === 1 ? [1, 1.5, 1] : [1.3, 1, 1.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
            key={`layer2-${currentSlide}`}
          />
          
          {/* Layer 3 - Center mesh - Pulsing zoom based on slide */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary-400/30 via-purple-500/25 to-transparent rounded-full filter blur-[120px]"
            animate={{
              scale: [1, 1.6, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            key={`layer3-${currentSlide}`}
          />
          
          {/* Layer 4 - Top left accent - Zoom animation */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-primary-600/30 via-purple-500/25 to-transparent rounded-full filter blur-[110px]"
            animate={{
              x: [0, 60, 0],
              y: [0, -40, 0],
              scale: currentSlide % 3 === 0 ? [1, 1.3, 1] : [1.1, 1, 1.1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3,
            }}
            key={`layer4-${currentSlide}`}
          />
          
          {/* Layer 5 - Bottom right accent - Zoom animation */}
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-[550px] h-[550px] bg-gradient-to-tl from-purple-400/28 via-primary-500/22 to-transparent rounded-full filter blur-[115px]"
            animate={{
              x: [0, -70, 0],
              y: [0, 50, 0],
              scale: currentSlide % 3 === 1 ? [1, 1.4, 1] : [1.2, 1, 1.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.7,
            }}
            key={`layer5-${currentSlide}`}
          />
        </div>
        
        {/* Grid Pattern Overlay - Subtle mesh effect */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
        
        {/* Animated Grid Lines */}
        <motion.svg
          className="absolute inset-0 w-full h-full opacity-10"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(147, 51, 234, 0.3)" stopOpacity="0" />
              <stop offset="50%" stopColor="rgba(147, 51, 234, 0.5)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgba(147, 51, 234, 0.3)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.line
            x1="0"
            y1="50%"
            x2="100%"
            y2="50%"
            stroke="url(#gridGradient)"
            strokeWidth="1"
            animate={{
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.line
            x1="50%"
            y1="0"
            x2="50%"
            y2="100%"
            stroke="url(#gridGradient)"
            strokeWidth="1"
            animate={{
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </motion.svg>
        
        {/* Floating Light Orbs - Zoom in/out with slide changes */}
        {[
          { x: '15%', y: '20%', size: 120 },
          { x: '85%', y: '30%', size: 100 },
          { x: '25%', y: '75%', size: 140 },
          { x: '75%', y: '80%', size: 110 },
          { x: '50%', y: '10%', size: 90 },
          { x: '10%', y: '50%', size: 130 },
        ].map((orb, i) => (
          <motion.div
            key={`orb-${i}-${currentSlide}`}
            className="absolute rounded-full filter blur-[80px]"
            style={{
              left: orb.x,
              top: orb.y,
              width: `${orb.size}px`,
              height: `${orb.size}px`,
              background: `radial-gradient(circle, rgba(147, 51, 234, ${0.2 + i * 0.05}) 0%, transparent 70%)`,
            }}
            animate={{
              scale: (currentSlide + i) % 2 === 0 ? [1, 1.5, 1] : [1.3, 1, 1.3],
              opacity: [0.3, 0.6, 0.3],
              x: [0, i % 2 === 0 ? 30 : -30, 0],
              y: [0, i % 2 === 0 ? -20 : 20, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      <div className="container-custom relative z-10">
        <div className="flex flex-col items-center gap-12">
          {/* Main Content - Centered */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-2 bg-primary-900/50 text-white rounded-full text-sm font-semibold mb-6 border border-primary-700/50 animate-pulse-slow"
              {...getEditTag(entry, 'hero.eyebrow')}
            >
              {data?.eyebrow || '🚀 The Future of Content Management'}
            </motion.div>
            
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              {...getEditTag(entry, 'hero.heading')}
            >
              {data?.heading ? (
                data.heading
              ) : (
                <>
                  <span className="whitespace-nowrap">Build <motion.span 
                    className="gradient-text inline-block"
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{
                      backgroundSize: '200% auto',
                    }}
                  >Modern</motion.span> Digital&nbsp;Experiences</span>
                  <br />
                  <span className="whitespace-nowrap">Faster Than Ever</span>
                </>
              )}
            </motion.h1>
            
            <p 
              className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed"
              {...getEditTag(entry, 'hero.subheading')}
            >
              {data?.subheading || 'The leading headless CMS that empowers teams to deliver content-rich experiences across any platform, at scale.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 20px rgba(147, 51, 234, 0.5)",
                }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary inline-flex items-center justify-center group relative overflow-hidden"
                {...getEditTag(entry, 'hero.primary_cta')}
              >
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                    ease: "linear",
                  }}
                />
                <span className="relative z-10">{data?.primaryCta || 'Start Free Trial'}</span>
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform relative z-10" size={20} />
              </motion.button>
              
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  borderColor: "rgba(147, 51, 234, 0.8)",
                }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary inline-flex items-center justify-center"
                {...getEditTag(entry, 'hero.secondary_cta')}
              >
                <Play className="mr-2" size={20} />
                {data?.secondaryCta || 'Watch Demo'}
              </motion.button>
            </div>

            <div 
              className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-700 dark:text-gray-400"
              {...getEditTag(entry, 'hero.stats')}
            >
              {(data?.stats?.length ? data.stats : [
                { value: '5000+', label: 'Companies Trust Us' },
                { value: '99.9%', label: 'Uptime SLA' },
                { value: '24/7', label: 'Global Support' },
              ]).map((s, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className="animate-float"
                  style={{ animationDelay: `${idx * 0.2}s` }}
                >
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</div>
                  <div className="text-gray-700 dark:text-gray-400">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Slideshow - Below Main Content, Centered */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative w-full max-w-4xl"
          >
            <div className="relative p-8">
              {/* Slideshow Container */}
              <div className="relative h-[400px]">
                <AnimatePresence mode="wait">
                  {slides.map((slide, index) => {
                    if (index !== currentSlide) return null
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 flex flex-col"
                      >
                        {/* Slide Header */}
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
                            {slide.icon}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{slide.title}</h3>
                            <p className="text-sm text-gray-700 dark:text-gray-400">{slide.description}</p>
                          </div>
                        </div>
                        
                        {/* Slide Visual */}
                        <div className="flex-1 flex items-center justify-center">
                          {slide.visual}
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>

              {/* Slide Indicators and Navigation Controls - Same Row */}
              <div className="flex items-center justify-between mt-6 relative">
                {/* Slide Indicators - Centered */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex items-center space-x-2">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          index === currentSlide
                            ? 'w-8 bg-gradient-to-r from-primary-500 to-purple-500'
                            : 'w-2 bg-gray-600/50 hover:bg-gray-500/50'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Navigation Controls - Right Corner */}
                <div className="absolute right-0 flex items-center space-x-2">
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className="w-10 h-10 rounded-full border-2 border-white/30 dark:border-gray-600 bg-gray-900/50 dark:bg-gray-800/50 hover:bg-gray-800 dark:hover:bg-gray-700 transition-all duration-200 flex items-center justify-center"
                    aria-label={isPaused ? 'Play slideshow' : 'Pause slideshow'}
                  >
                    {isPaused ? (
                      <Play className="w-4 h-4 text-white dark:text-gray-300 ml-0.5" />
                    ) : (
                      <Pause className="w-4 h-4 text-white dark:text-gray-300" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                    className="w-10 h-10 rounded bg-gray-800/80 dark:bg-gray-700/80 hover:bg-gray-700 dark:hover:bg-gray-600 transition-all duration-200 flex items-center justify-center"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="w-5 h-5 text-white dark:text-gray-300" />
                  </button>
                  
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                    className="w-10 h-10 rounded bg-gray-800/80 dark:bg-gray-700/80 hover:bg-gray-700 dark:hover:bg-gray-600 transition-all duration-200 flex items-center justify-center"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="w-5 h-5 text-white dark:text-gray-300" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Hero
