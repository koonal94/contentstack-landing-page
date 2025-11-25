import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { getEditTag } from '../utils/getEditTag'

const Testimonials = ({ data, entry }) => {
  const testimonials = (data && Array.isArray(data) && data.length)
    ? data.map((t) => ({
        name: t.name,
        role: t.role,
        image: t.avatar,
        content: t.content,
        rating: t.rating || 5,
      }))
    : [
    {
      name: 'Sarah Johnson',
      role: 'CTO at TechCorp',
      image: '👩‍💼',
      content:
        'ContentStack transformed how we manage content. What used to take days now takes minutes. Our team productivity increased by 300%.',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Head of Engineering at StartupX',
      image: '👨‍💻',
      content:
        'The API-first approach is a game-changer. We can integrate with any platform seamlessly. Best decision we made for our tech stack.',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Marketing Director at BrandCo',
      image: '👩‍💼',
      content:
        'Our content team loves the intuitive interface. No coding required for content updates, yet developers have full control via APIs.',
      rating: 5,
    },
  ]

  return (
    <section id="testimonials" className="py-12 md:py-16 bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">Loved by Teams<span className="gradient-text"> Worldwide</span></h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            See what developers, marketers, and business leaders are saying 
            about their experience with ContentStack.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={`testimonial-${index}-${testimonial.name || index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/80 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800/20 rounded-lg p-8 relative hover:bg-gray-50 dark:hover:bg-gray-900/60 transition-all duration-300 shadow-lg dark:shadow-none"
              {...getEditTag(entry, 'testimonials.items')}
            >
              <Quote className="w-12 h-12 text-primary-200 mb-4" />
              
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((els, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed italic">
                "{testimonial.content}"
              </p>

              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/50 border border-primary-300 dark:border-primary-700/50 rounded-full flex items-center justify-center text-2xl mr-4">
                  {testimonial.image}
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
