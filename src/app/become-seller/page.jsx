"use client"
import { useState } from 'react';
import Head from 'next/head';

const BecomeSellerPage = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [isVerified, setIsVerified] = useState(false);

  const steps = [
    { number: 1, title: 'Create Account', description: 'Sign up as a registered user' },
    { number: 2, title: 'Submit Information', description: 'Provide store details and documents' },
    { number: 3, title: 'Verification', description: 'Admin review and approval' },
    { number: 4, title: 'Start Selling', description: 'Add products and begin your journey' },
  ];

  const sellerResponsibilities = [
    'Ensuring that your products are accurately described and fairly priced.',
    'Managing your store inventory and updating stock availability.',
    'Shipping and delivering orders to customers in a timely and professional manner.',
    'Maintaining quality standards to build customer trust and loyalty.',
  ];

  const benefits = [
    {
      icon: '🚀',
      title: 'Wider Reach',
      description: 'Showcase your products to a rapidly growing customer base.'
    },
    {
      icon: '🎯',
      title: 'Low Barriers to Entry',
      description: 'Simple and hassle-free onboarding process.'
    },
    {
      icon: '🏆',
      title: 'Credibility',
      description: 'Being part of MOH Capital gives your business recognition and trust.'
    },
    {
      icon: '🤝',
      title: 'Supportive Ecosystem',
      description: 'Our admin team assists you throughout your journey.'
    },
    {
      icon: '🔮',
      title: 'Future Opportunities',
      description: 'More payment integrations and advanced features on the way.'
    },
  ];

  return (
    <>
      <Head>
        <title>Become a Seller - MOH Capital Marketplace</title>
        <meta name="description" content="Join MOH Capital as a seller and grow your business with our trusted multi-vendor marketplace" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                Become a Seller on <span className="text-yellow-300">MOH Capital</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
                Join our marketplace and showcase your business to thousands of customers actively looking for quality products
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Start Your Application
                </button>
                <button className="border-2 border-white hover:bg-white/10 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span>✨</span> Our Commitment to Entrepreneurs
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Empowering Your Business Growth
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              At MOH Capital, we believe that every entrepreneur deserves the opportunity to grow and showcase their business to a wider audience. Our multi-vendor marketplace is designed to empower sellers by providing them with a trusted platform where they can easily reach thousands of customers who are actively looking for quality products.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mt-4 font-semibold text-blue-600">
              Becoming a seller on MOH Capital is simple, transparent, and rewarding.
            </p>
          </div>
        </section>

        {/* Process Steps */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Simple 4-Step Process
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Follow these straightforward steps to start your selling journey with MOH Capital
              </p>
            </div>

            {/* Steps Visualization */}
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 hidden md:block">
                <div 
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${(activeStep - 1) * 33.33}%` }}
                ></div>
              </div>

              <div className="grid md:grid-cols-4 gap-8">
                {steps.map((step, index) => (
                  <div
                    key={step.number}
                    className={`relative text-center group cursor-pointer transition-all duration-300 ${
                      activeStep === step.number ? 'scale-105' : 'scale-100'
                    }`}
                    onClick={() => setActiveStep(step.number)}
                  >
                    {/* Step Circle */}
                    <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 ${
                      activeStep >= step.number
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      <span className="text-xl font-bold">{step.number}</span>
                    </div>

                    <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                      activeStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Step Details */}
            <div className="mt-20 max-w-4xl mx-auto">
              {activeStep === 1 && (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">👤</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Step 1: Create Your Account</h3>
                      <p className="text-gray-600">Begin your journey as a registered user</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                    <p className="text-gray-700 leading-relaxed">
                      To get started, you need to sign up for a user account on MOH Capital. Every seller begins as a registered user, ensuring a smooth onboarding process and a secure identity within our marketplace. Once registered, you can proceed to apply for a seller profile.
                    </p>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📝</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Step 2: Submit Seller Information</h3>
                      <p className="text-gray-600">Create your comprehensive seller profile</p>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      In order to create your seller profile, you will be required to provide the following details:
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span><strong>Store Name:</strong> The official name of your online shop as it will appear to customers.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span><strong>Store Description:</strong> A brief introduction to your store, products, and values.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span><strong>Logo:</strong> Your store's logo to give your shop a professional and recognizable identity.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span><strong>Business Address:</strong> Your operational or business location for record purposes.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span><strong>Identification Documents:</strong> Required legal documents such as CNIC and additional files for verification.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span><strong>Supporting Files:</strong> You may upload additional documents (e.g., certificates, licenses, or product catalog files) that strengthen your application.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🔍</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Step 3: Verification by Admin</h3>
                      <p className="text-gray-600">Ensuring authenticity and reliability</p>
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      Once your application is submitted, our admin team carefully reviews all provided information and documents. This ensures that every seller on MOH Capital is authentic, reliable, and committed to delivering a quality shopping experience.
                    </p>
                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-green-500 text-xl">✅</span>
                          <h4 className="font-semibold text-green-700">If Approved</h4>
                        </div>
                        <p className="text-sm text-gray-600">
                          Your account status will be updated to Verified Seller, and you will gain full access to seller features.
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-orange-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-orange-500 text-xl">⚠️</span>
                          <h4 className="font-semibold text-orange-700">If Disapproved</h4>
                        </div>
                        <p className="text-sm text-gray-600">
                          Our team will provide feedback so you may re-apply after making the necessary corrections or updates.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 4 && (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🛍️</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Step 4: Start Selling</h3>
                      <p className="text-gray-600">Launch your products and grow your business</p>
                    </div>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-100">
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      After approval, you can begin adding your products to the marketplace. Each product must include details such as title, description, price, stock information, and images.
                    </p>
                    <div className="bg-white rounded-lg p-4 border border-blue-200 mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-blue-500 text-xl">💳</span>
                        <h4 className="font-semibold text-blue-700">Payment Information</h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        At present, MOH Capital supports <strong>Cash on Delivery (COD)</strong> as the primary payment method. Additional digital payment gateways will be integrated in the future to provide even more convenience.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Seller Responsibilities */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Seller Responsibilities
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Your commitment to excellence ensures a great experience for everyone
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {sellerResponsibilities.map((responsibility, index) => (
                <div key={index} className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-300">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 text-sm font-bold">{index + 1}</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{responsibility}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-orange-50 border border-orange-200 rounded-2xl p-8 max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-2xl">🚚</span>
                <h3 className="text-xl font-bold text-orange-800">Shipping & Logistics Note</h3>
              </div>
              <p className="text-orange-700 leading-relaxed">
                MOH Capital is not directly affiliated with logistics or courier services at the moment, so sellers are expected to manage their own shipping arrangements.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Sell on MOH Capital?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Join a marketplace built on trust, transparency, and growth
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gray-900 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Grow Your Business?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Becoming a seller with MOH Capital means joining a marketplace built on trust, transparency, and growth. Apply today and take your business to the next level.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                Apply Now - Start Selling
              </button>
              <button className="border-2 border-gray-300 hover:bg-white/10 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300">
                Contact Support
              </button>
            </div>
            <p className="text-gray-400 mt-6 text-sm">
              Have questions? Our support team is here to help you through the process.
            </p>
          </div>
        </section>
      </div>
    </>
  );
};

export default BecomeSellerPage;