import { motion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'
import { getEditTag } from '../utils/getEditTag'

const Hero = ({ data, loading, entry }) => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-primary-50">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
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
              className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-6"
              {...getEditTag(entry, 'hero.eyebrow')}
            >
              {data?.eyebrow || '🚀 The Future of Content Management'}
            </motion.div>
            
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
              {...getEditTag(entry, 'hero.heading')}
            >
              {data?.heading ? (
                data.heading
              ) : (
                <>
                  Build <span className="gradient-text">Modern</span>
                  <br />
                  Digital Experiences
                  <br />
                  Faster Than Ever
                </>
              )}
            </h1>
            
            <p 
              className="text-xl text-gray-600 mb-8 leading-relaxed"
              {...getEditTag(entry, 'hero.subheading')}
            >
              {data?.subheading || 'The leading headless CMS that empowers teams to deliver content-rich experiences across any platform, at scale.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary inline-flex items-center justify-center group"
                {...getEditTag(entry, 'hero.primary_cta')}
              >
                {data?.primaryCta || 'Start Free Trial'}
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary inline-flex items-center justify-center"
                {...getEditTag(entry, 'hero.secondary_cta')}
              >
                <Play className="mr-2" size={20} />
                {data?.secondaryCta || 'Watch Demo'}
              </motion.button>
            </div>

            <div 
              className="mt-12 flex flex-wrap items-center justify-center md:justify-start gap-8 text-sm text-gray-600"
              {...getEditTag(entry, 'hero.stats')}
            >
              {(data?.stats?.length ? data.stats : [
                { value: '5000+', label: 'Companies Trust Us' },
                { value: '99.9%', label: 'Uptime SLA' },
                { value: '24/7', label: 'Global Support' },
              ]).map((s, idx) => (
                <div key={idx}>
                  <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                  <div>{s.label}</div>
                </div>
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
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-300">
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
                      className="bg-gradient-to-br from-primary-100 to-blue-100 rounded-lg p-4 h-24 flex items-center justify-center"
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
              
              {/* Floating badges */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-3 border-2 border-primary-200"
              >
                <div className="text-xs font-semibold text-primary-600">⚡ Fast</div>
              </motion.div>
              
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-3 border-2 border-blue-200"
              >
                <div className="text-xs font-semibold text-blue-600">🔒 Secure</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Hero
