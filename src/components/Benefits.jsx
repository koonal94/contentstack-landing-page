import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { getEditTag } from '../utils/getEditTag'

const Benefits = ({ data, entry }) => {
  const benefits = data?.cards?.length
    ? data.cards.map((c) => ({
        title: c.title,
        description: c.description,
        features: c.bullets || [],
      }))
    : [
    {
      title: 'Faster Time-to-Market',
      description: 'Launch digital experiences in weeks, not months. Our API-first approach eliminates bottlenecks.',
      features: [
        'Pre-built content models',
        'Instant API access',
        'One-click deployments',
        'Developer-friendly tools',
      ],
    },
    {
      title: 'Omnichannel Publishing',
      description: 'Write once, publish everywhere. Deliver content to any device or platform instantly.',
      features: [
        'Multi-channel delivery',
        'Real-time synchronization',
        'Platform-agnostic content',
        'Flexible presentation layer',
      ],
    },
    {
      title: 'Enterprise Ready',
      description: 'Built for scale with enterprise-grade security, compliance, and support.',
      features: [
        '99.9% uptime SLA',
        'Global CDN network',
        'Advanced security features',
        '24/7 expert support',
      ],
    },
  ]

  return (
    <section id="benefits" className="py-20 bg-gradient-to-br from-gray-800 to-gray-900">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
            {...getEditTag(entry, 'benefits.title')}
          >
            {data?.title || (
              <>
                Why Teams Choose<span className="gradient-text"> ContentStack</span>
              </>
            )}
          </h2>
          <p 
            className="text-xl text-gray-300 max-w-3xl mx-auto"
            {...getEditTag(entry, 'benefits.subtitle')}
          >
            {data?.subtitle || 'Join thousands of companies delivering exceptional digital experiences with the power of headless CMS.'}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <motion.div
              key={`benefit-${index}-${benefit.title || index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300"
              {...getEditTag(entry, 'benefits.cards')}
            >
              <h3 className="text-2xl font-bold text-white mb-4">
                {benefit.title}
              </h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                {benefit.description}
              </p>
              <ul className="space-y-3">
                {benefit.features.map((feature, featureIdx) => (
                  <li key={feature} className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gray-800 border border-gray-700 rounded-2xl p-8 md:p-12 shadow-xl"
          {...getEditTag(entry, 'benefits.stats')}
        >
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {(data?.stats?.length
              ? data.stats
              : [
                  { value: '5000+', label: 'Global Customers' },
                  { value: '1M+', label: 'API Calls/Day' },
                  { value: '99.9%', label: 'Uptime Guarantee' },
                  { value: '150+', label: 'Countries Served' },
                ]
            ).map((s, idx) => (
              <div key={idx}>
                <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">{s.value}</div>
                <div className="text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Benefits
