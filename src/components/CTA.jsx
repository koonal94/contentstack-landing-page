import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { getEditTag } from '../utils/getEditTag'

const CTA = ({ data, entry }) => {
  return (
    <section className="py-20 bg-gradient-to-r from-primary-600 to-blue-600 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
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
            className="text-xl text-primary-100 mb-8 leading-relaxed"
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
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition-all duration-200"
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
