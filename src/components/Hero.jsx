import { motion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'
import { getEditTag } from '../utils/getEditTag'

const Hero = ({ data, loading, entry }) => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      {/* Contentstack-style Mesh Gradient Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Mesh Gradient Layers - Flowing organic shapes */}
        <div className="absolute inset-0">
          {/* Layer 1 - Top right mesh */}
          <motion.div
            className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-primary-500/30 via-primary-400/20 to-transparent rounded-full filter blur-[140px]"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Layer 2 - Bottom left mesh */}
          <motion.div
            className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-tr from-blue-500/25 via-primary-500/15 to-transparent rounded-full filter blur-[130px]"
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
          
          {/* Layer 3 - Center mesh */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary-400/20 via-primary-500/15 to-transparent rounded-full filter blur-[120px]"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          
          {/* Layer 4 - Top left accent */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-primary-600/20 via-blue-500/15 to-transparent rounded-full filter blur-[110px]"
            animate={{
              x: [0, 60, 0],
              y: [0, -40, 0],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
          
          {/* Layer 5 - Bottom right accent */}
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-[550px] h-[550px] bg-gradient-to-tl from-blue-400/18 via-primary-500/12 to-transparent rounded-full filter blur-[115px]"
            animate={{
              x: [0, -70, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 24,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3,
            }}
          />
        </div>
        
        {/* Grid Pattern Overlay - Subtle mesh effect */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(124, 77, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(124, 77, 255, 0.1) 1px, transparent 1px)
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
              <stop offset="0%" stopColor="rgba(124, 77, 255, 0.3)" stopOpacity="0" />
              <stop offset="50%" stopColor="rgba(124, 77, 255, 0.5)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgba(124, 77, 255, 0.3)" stopOpacity="0" />
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
        
        {/* Floating Light Orbs - Subtle accent lights */}
        {[
          { x: '15%', y: '20%', size: 120 },
          { x: '85%', y: '30%', size: 100 },
          { x: '25%', y: '75%', size: 140 },
          { x: '75%', y: '80%', size: 110 },
          { x: '50%', y: '10%', size: 90 },
          { x: '10%', y: '50%', size: 130 },
        ].map((orb, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute rounded-full filter blur-[80px]"
            style={{
              left: orb.x,
              top: orb.y,
              width: `${orb.size}px`,
              height: `${orb.size}px`,
              background: `radial-gradient(circle, rgba(124, 77, 255, ${0.15 + i * 0.05}) 0%, transparent 70%)`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
              x: [0, i % 2 === 0 ? 30 : -30, 0],
              y: [0, i % 2 === 0 ? -20 : 20, 0],
            }}
            transition={{
              duration: 8 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <div className="container-custom relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center md:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-2 bg-primary-900/50 text-primary-200 rounded-full text-sm font-semibold mb-6 border border-primary-700/50 animate-pulse-slow"
              {...getEditTag(entry, 'hero.eyebrow')}
            >
              {data?.eyebrow || '🚀 The Future of Content Management'}
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              {...getEditTag(entry, 'hero.heading')}
            >
              {data?.heading ? (
                data.heading
              ) : (
                <>
                  Build <motion.span 
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
                  >Modern</motion.span>
                  <br />
                  Digital Experiences
                  <br />
                  Faster Than Ever
                </>
              )}
            </motion.h1>
            
            <p 
              className="text-xl text-gray-300 mb-8 leading-relaxed"
              {...getEditTag(entry, 'hero.subheading')}
            >
              {data?.subheading || 'The leading headless CMS that empowers teams to deliver content-rich experiences across any platform, at scale.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 20px rgba(0, 125, 255, 0.5)",
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
                  borderColor: "rgba(0, 125, 255, 0.8)",
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
              className="mt-12 flex flex-wrap items-center justify-center md:justify-start gap-8 text-sm text-gray-400"
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
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                  <div>{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <motion.div
              className="relative bg-gray-800 border border-primary-500/30 rounded-2xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-300"
              whileHover={{ 
                boxShadow: "0 0 30px rgba(0, 125, 255, 0.3)",
                borderColor: "rgba(0, 125, 255, 0.5)"
              }}
            >
              {/* Mock Dashboard */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
                <div className="h-6 bg-primary-600 rounded w-3/4"></div>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="bg-gray-700 rounded-lg p-4 h-24 flex items-center justify-center"
                    >
                      <div className="text-primary-600 font-bold">{i}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
              
              {/* Floating badges with glow effect */}
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-gray-800 border border-primary-500/50 rounded-lg shadow-lg p-3 animate-glow"
              >
                <div className="text-xs font-semibold text-primary-400">⚡ Fast</div>
              </motion.div>
              
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-4 -left-4 bg-gray-800 border border-primary-500/50 rounded-lg shadow-lg p-3 animate-glow"
                style={{ animationDelay: '1s' }}
              >
                <div className="text-xs font-semibold text-primary-400">🔒 Secure</div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Hero
