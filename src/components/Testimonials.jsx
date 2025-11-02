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
    <section id="testimonials" className="py-20 bg-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Loved by Teams<span className="gradient-text"> Worldwide</span></h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See what developers, marketers, and business leaders are saying 
            about their experience with ContentStack.
          </p>
        </motion.div>

        <div 
          className="grid md:grid-cols-3 gap-8"
          {...getEditTag(entry, 'testimonials.items')}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={`testimonial-${index}-${testimonial.name || index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 relative hover:shadow-xl transition-all duration-300"
            >
              <Quote className="w-12 h-12 text-primary-200 mb-4" />
              
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((els, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed italic">
                "{testimonial.content}"
              </p>

              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-2xl mr-4">
                  {testimonial.image}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
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
