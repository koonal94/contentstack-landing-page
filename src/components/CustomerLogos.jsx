import { getEditTag } from '../utils/getEditTag'

const CustomerLogos = ({ data, entry }) => {
  const customers = data?.companies?.length
    ? data.companies
    : [
        'Microsoft',
        'Amazon',
        'Google',
        'Apple',
        'Meta',
        'Netflix',
        'Spotify',
        'Adobe',
        'Salesforce',
        'IBM',
        'Oracle',
        'Cisco',
      ]

  // Duplicate the array for seamless infinite scroll - 2 copies for perfect loop
  const duplicatedCustomers = [...customers, ...customers]

  return (
    <section className="py-8 md:py-12 bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950 overflow-hidden">
      <div className="container-custom">
        <div className="relative">
          {/* Gradient overlays for fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 via-gray-50/80 to-transparent dark:from-gray-950 dark:via-gray-950/80 z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 via-gray-50/80 to-transparent dark:from-gray-950 dark:via-gray-950/80 z-10 pointer-events-none" />
          
          {/* Scrolling container */}
          <div className="overflow-hidden">
            <div
              className="flex items-center space-x-12 md:space-x-16 customer-logos-scroll"
              style={{
                '--scroll-duration': `${customers.length * 1.675}s`, // 25% slower than previous (1.34 * 1.25 = 1.675)
                width: 'max-content',
              }}
              {...getEditTag(entry, 'customer_logos.companies')}
            >
              {duplicatedCustomers.map((customer, index) => (
                <div
                  key={`${customer}-${index}`}
                  className="flex-shrink-0 text-2xl md:text-3xl font-semibold text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-300 whitespace-nowrap"
                >
                  {customer}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CustomerLogos

