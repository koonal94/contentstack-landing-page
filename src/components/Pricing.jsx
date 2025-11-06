import { motion } from 'framer-motion'
import { Check, Sparkles, Zap } from 'lucide-react'
import { getEditTag } from '../utils/getEditTag'

const Pricing = ({ data, entry }) => {
  // Default plans to show when no CMS data is available
  const defaultPlans = [
    {
      name: 'Starter',
      price: '$99',
      period: '/month',
      description: 'Perfect for small teams getting started',
      features: [
        'Up to 5 users',
        '10,000 API calls/month',
        'Basic support',
        '1 environment',
      ],
      popular: false,
    },
    {
      name: 'Professional',
      price: '$299',
      period: '/month',
      description: 'For growing businesses',
      features: [
        'Up to 25 users',
        '100,000 API calls/month',
        'Priority support',
        '3 environments',
        'Advanced analytics',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large organizations',
      features: [
        'Unlimited users',
        'Unlimited API calls',
        '24/7 dedicated support',
        'Unlimited environments',
        'Custom integrations',
        'SLA guarantee',
      ],
      popular: false,
    },
  ]
  
  // Use CMS plans if available and not empty, otherwise use defaults
  const plans = (data?.plans && Array.isArray(data.plans) && data.plans.length > 0) 
    ? data.plans 
    : defaultPlans

  return (
    <section id="pricing" className="py-20 md:py-32 bg-gray-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div 
            className="inline-block px-4 py-2 bg-primary-900/50 text-primary-300 rounded-full text-sm font-semibold mb-6 border border-primary-700/50"
            {...getEditTag(entry, 'pricing.eyebrow')}
          >
            {data?.eyebrow !== null && data?.eyebrow !== undefined ? data.eyebrow : '💎 Simple, Transparent Pricing'}
          </div>
          
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
            {...getEditTag(entry, 'pricing.heading')}
          >
            {data?.heading !== null && data?.heading !== undefined ? data.heading : 'Choose the Perfect Plan'}
          </h2>
          
          <p 
            className="text-xl text-gray-300 max-w-2xl mx-auto"
            {...getEditTag(entry, 'pricing.subheading')}
          >
            {data?.subheading !== null && data?.subheading !== undefined ? data.subheading : 'Start free, upgrade as you grow. All plans include 14-day free trial.'}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className={`relative bg-gray-800 border border-gray-700 rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-2xl ${
                plan.popular
                  ? 'border-2 border-primary-500 scale-105 md:scale-110'
                  : ''
              }`}
              {...getEditTag(entry, 'pricing.plans')}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-primary-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400 ml-2">{plan.period}</span>
                </div>
                <p className="text-gray-300">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIdx) => (
                  <li key={featureIdx} className="flex items-start">
                    <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5 mr-3" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  plan.popular
                    ? 'btn-primary'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {(data?.note !== null && data?.note !== undefined && data.note !== '') && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-gray-400 mt-12"
            {...getEditTag(entry, 'pricing.note')}
          >
            {data.note}
          </motion.p>
        )}
        {(!data?.note || data.note === '') && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-gray-400 mt-12"
            {...getEditTag(entry, 'pricing.note')}
            style={{ minHeight: '1rem' }}
          >
            {' '}
          </motion.p>
        )}
      </div>
    </section>
  )
}

export default Pricing

