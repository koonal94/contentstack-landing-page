import { motion } from 'framer-motion'
import { Zap, Shield, Globe, Code, Layers, Infinity } from 'lucide-react'
import { getIconByName } from '../utils/iconMap'
import { getEditTag } from '../utils/getEditTag'

const Features = ({ data, entry }) => {
  const features = data?.length ? data : [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Lightning Fast',
      description: 'API-first architecture delivers content in milliseconds. Built for performance at scale.',
      color: 'from-yellow-400 to-orange-500',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Enterprise Security',
      description: 'Bank-level encryption, SSO, and compliance with SOC 2, GDPR, and ISO 27001.',
      color: 'from-green-400 to-emerald-500',
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Multi-Channel',
      description: 'Deliver content to websites, mobile apps, IoT devices, and any digital platform.',
      color: 'from-blue-400 to-cyan-500',
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: 'Developer-First',
      description: 'RESTful APIs, GraphQL, Webhooks, and SDKs for all popular programming languages.',
      color: 'from-purple-400 to-pink-500',
    },
    {
      icon: <Layers className="w-8 h-8" />,
      title: 'Content Modeling',
      description: 'Flexible content types and relationships. Model any content structure you need.',
      color: 'from-indigo-400 to-purple-500',
    },
    {
      icon: <Infinity className="w-8 h-8" />,
      title: 'Unlimited Scale',
      description: 'Handle millions of content items without breaking a sweat. Auto-scaling infrastructure.',
      color: 'from-red-400 to-rose-500',
    },
  ]

  return (
    <section id="features" className="py-20 bg-gray-900">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Everything You Need to
            <span className="gradient-text"> Succeed</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Powerful features designed to make content management effortless 
            and development lightning-fast.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={`feature-${index}-${feature.title || index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="feature-card group"
              {...getEditTag(entry, 'features.items')}
            >
              <div
                className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color || 'from-blue-400 to-cyan-500'} flex items-center justify-center text-white mb-6 transform group-hover:scale-110 transition-transform duration-300`}
              >
                {feature.icon ? (
                  // icon provided as React node in fallback
                  feature.icon
                ) : (
                  // icon provided as string from CMS
                  (() => {
                    const IconCmp = getIconByName(feature.icon)
                    return <IconCmp className="w-8 h-8" />
                  })()
                )}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
