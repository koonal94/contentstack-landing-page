import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { getEditTag } from '../utils/getEditTag'

const CTA = ({ data, entry }) => {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 relative overflow-hidden">
      {/* Contentstack-style Mesh Gradient Background - Matching Hero */}
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
            <linearGradient id="ctaGridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
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
            stroke="url(#ctaGridGradient)"
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
            stroke="url(#ctaGridGradient)"
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-6"
          >
            <Sparkles className="w-12 h-12 text-white" />
          </motion.div>

          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
            {...getEditTag(entry, 'cta.title')}
          >
            {data?.title || (
              <>
                Ready to Transform Your
                <br />
                Content Experience?
              </>
            )}
          </h2>
          
          <p 
            className="text-xl text-primary-200 mb-8 leading-relaxed"
            {...getEditTag(entry, 'cta.subtitle')}
          >
            {data?.subtitle || 'Join thousands of companies delivering exceptional digital experiences. Start your free 14-day trial today. No credit card required.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-200 inline-flex items-center group"
              {...getEditTag(entry, 'cta.primary_text')}
            >
              {data?.primaryText || 'Start Free Trial'}
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-gray-900 hover:text-primary-400 transition-all duration-200"
              {...getEditTag(entry, 'cta.secondary_cta')}
            >
              {data?.secondaryText || 'Schedule a Demo'}
            </motion.button>
          </div>

          <p className="mt-6 text-sm text-primary-100">
            ✨ 14-day free trial • No credit card required • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default CTA
