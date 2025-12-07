"use client"
import { useState } from 'react';
import Head from 'next/head';

const OurPartnersPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const partnershipAreas = [
    {
      icon: '🚚',
      title: 'Logistics & Shipping',
      description: 'Reliable product delivery and customer satisfaction.',
      category: 'operations'
    },
    {
      icon: '💳',
      title: 'Payment Gateways',
      description: 'Secure and diverse payment options.',
      category: 'technology'
    },
    {
      icon: '🏭',
      title: 'Suppliers & Manufacturers',
      description: 'Bulk supply, product exclusivity, and wholesale opportunities.',
      category: 'supply'
    },
    {
      icon: '🤖',
      title: 'Technology Providers',
      description: 'AI solutions, analytics, fraud prevention, and customer engagement tools.',
      category: 'technology'
    },
    {
      icon: '📢',
      title: 'Marketing Agencies',
      description: 'Brand visibility and customer acquisition strategies.',
      category: 'marketing'
    },
    {
      icon: '🎯',
      title: 'Category Specialists',
      description: 'Expertise in niche product categories.',
      category: 'expertise'
    }
  ];

  const terms = [
    {
      icon: '⚖️',
      title: 'Integrity',
      description: 'All partners must maintain professional ethics and operate in compliance with applicable laws.'
    },
    {
      icon: '🔒',
      title: 'Confidentiality',
      description: 'Any business discussions or agreements remain private between MOh Capital and the partner.'
    },
    {
      icon: '🤝',
      title: 'Exclusivity',
      description: 'Some collaborations may require exclusivity in specific sectors or product lines, based on mutual agreement.'
    },
    {
      icon: '📊',
      title: 'Transparency',
      description: 'Financial and operational dealings must be transparent, with clear documentation.'
    },
    {
      icon: '🚫',
      title: 'Termination',
      description: 'Either party may end the partnership in case of breach of trust, failure to deliver commitments, or unethical practices.'
    }
  ];

  const benefits = [
    {
      icon: '📈',
      title: 'Shared Growth Opportunities',
      description: 'Collaborate in a growing ecommerce ecosystem with mutual benefits.'
    },
    {
      icon: '🔍',
      title: 'Transparent Practices',
      description: 'Experience reliable and honest business dealings.'
    },
    {
      icon: '🌍',
      title: 'Market Access',
      description: 'Reach diverse markets and industries through our platform.'
    },
    {
      icon: '💎',
      title: 'Exclusive Collaborations',
      description: 'Potential for unique partnerships in logistics, payments, marketing, and technology.'
    }
  ];

  return (
    <>
      <Head>
        <title>Our Partners - MOH Capital Marketplace</title>
        <meta name="description" content="Partner with MOH Capital - Join our ecosystem for mutual growth and success in ecommerce" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
        {/* Hero Section */}
        <section className="relative py-24 bg-gradient-to-r from-indigo-600 to-purple-700 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-36 translate-x-36"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-48 -translate-x-48"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full text-sm font-medium mb-8 border border-white/20">
                <span>✨</span> Strategic Collaborations
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                Our <span className="text-yellow-300">Partners</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed font-light">
                Building lasting relationships that drive innovation and growth in the ecommerce ecosystem
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-yellow-400 hover:bg-yellow-300 text-indigo-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Become a Partner
                </button>
                <button className="border-2 border-white hover:bg-white/10 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <span>🏢</span> Our Partnership Philosophy
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                  Partnerships Are The Backbone of Sustainable Growth
                </h2>
                <div className="space-y-4 text-lg text-gray-600">
                  <p>
                    At MOH Capital, we understand that partnerships are the backbone of sustainable growth. While our marketplace is focused on empowering sellers and buyers, we also recognize the importance of building long-term relationships with businesses, organizations, and service providers across multiple sectors.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
                  <div className="text-4xl mb-4">🤝</div>
                  <h3 className="text-2xl font-bold mb-4">Partnership Commitment</h3>
                  <p className="text-indigo-100 leading-relaxed">
                    At MOH Capital, partnership is more than a contract—it's a long-term relationship built on trust, professionalism, and mutual respect. All partnerships are evaluated to ensure alignment with our mission and values.
                  </p>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Partner with MOH Capital?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Join forces with us to create exceptional value and drive innovation
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="group">
                  <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 h-full transform hover:-translate-y-2">
                    <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                      {benefit.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Partnership Areas */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Areas of Partnership
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                We welcome collaboration across various sectors to enhance our ecosystem
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {partnershipAreas.map((area, index) => (
                <div key={index} className="group">
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 border border-gray-200 hover:border-indigo-300 transition-all duration-500 h-full transform hover:-translate-y-1">
                    <div className="text-3xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                      {area.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{area.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{area.description}</p>
                    <div className="mt-4">
                      <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full">
                        Partnership Area
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Terms & Conditions */}
        <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Terms & Conditions for Partners
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Our framework for successful and ethical partnerships
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {terms.map((term, index) => (
                <div key={index} className="group">
                  <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-500 h-full">
                    <div className="text-3xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                      {term.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{term.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{term.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How to Partner */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <span>📞</span> Get Started
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  How to Partner with Us
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-600 font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Contact Our Team</h3>
                      <p className="text-gray-600">
                        Interested businesses or organizations can contact MOH Capital's admin team directly to discuss opportunities.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Proposal Review</h3>
                      <p className="text-gray-600">
                        Each proposal is carefully reviewed to ensure alignment with our goals and values.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-purple-600 font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Formal Agreement</h3>
                      <p className="text-gray-600">
                        If aligned with our goals, formal agreements will be made to establish the partnership.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-gradient-to-br from-gray-900 to-indigo-900 rounded-2xl p-8 text-white shadow-2xl">
                  <div className="text-4xl mb-4">🎯</div>
                  <h3 className="text-2xl font-bold mb-4">Ready to Collaborate?</h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    Take the first step towards a successful partnership with MOH Capital. Our team is ready to explore innovative collaborations that drive mutual growth.
                  </p>
                  <div className="space-y-4">
                    <button className="w-full bg-green-500 hover:bg-green-400 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105">
                      Contact Partnership Team
                    </button>
                    <button className="w-full border-2 border-gray-300 hover:bg-white/10 px-6 py-3 rounded-lg font-semibold transition-all duration-300">
                      Download Partnership Brochure
                    </button>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-yellow-400 rounded-full opacity-20"></div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-blue-400 rounded-full opacity-20"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold mb-6">
              Let's Build Something Amazing Together
            </h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Join the MOH Capital partnership ecosystem and be part of an innovative ecommerce platform that values collaboration, transparency, and mutual success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-yellow-400 hover:bg-yellow-300 text-indigo-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                Start Partnership Discussion
              </button>
              <button className="border-2 border-white hover:bg-white/10 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300">
                Schedule a Meeting
              </button>
            </div>
            <p className="text-indigo-200 mt-6 text-sm">
              Partnership inquiries are typically responded to within 24-48 hours.
            </p>
          </div>
        </section>
      </div>
    </>
  );
};

export default OurPartnersPage;