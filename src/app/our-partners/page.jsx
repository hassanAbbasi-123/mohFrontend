"use client"
import { useState } from 'react';
import Head from 'next/head';
import {
  useCreatePartnershipInquiryMutation,
  useCreateMeetingRequestMutation,
} from '@/store/features/partnershipApi';

const OurPartnersPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isLearnMoreOpen, setIsLearnMoreOpen] = useState(false);
  const [isBrochureOpen, setIsBrochureOpen] = useState(false);
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [inquiryFormData, setInquiryFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });

  const [meetingFormData, setMeetingFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    preferredDate: '',
    preferredTime: '',
    message: ''
  });

  const [inquiryStatus, setInquiryStatus] = useState(''); // '', 'loading', 'success', 'error'
  const [meetingStatus, setMeetingStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [createPartnershipInquiry, { isLoading: inquiryLoading }] = useCreatePartnershipInquiryMutation();
  const [createMeetingRequest, { isLoading: meetingLoading }] = useCreateMeetingRequestMutation();

  const partnershipAreas = [
    { icon: '🚚', title: 'Logistics & Shipping', description: 'Reliable product delivery and customer satisfaction.', category: 'operations' },
    { icon: '💳', title: 'Payment Gateways', description: 'Secure and diverse payment options.', category: 'technology' },
    { icon: '🏭', title: 'Suppliers & Manufacturers', description: 'Bulk supply, product exclusivity, and wholesale opportunities.', category: 'supply' },
    { icon: '🤖', title: 'Technology Providers', description: 'AI solutions, analytics, fraud prevention, and customer engagement tools.', category: 'technology' },
    { icon: '📢', title: 'Marketing Agencies', description: 'Brand visibility and customer acquisition strategies.', category: 'marketing' },
    { icon: '🎯', title: 'Category Specialists', description: 'Expertise in niche product categories.', category: 'expertise' }
  ];

  const terms = [
    { icon: '⚖️', title: 'Integrity', description: 'All partners must maintain professional ethics and operate in compliance with applicable laws.' },
    { icon: '🔒', title: 'Confidentiality', description: 'Any business discussions or agreements remain private between MOh Capital and the partner.' },
    { icon: '🤝', title: 'Exclusivity', description: 'Some collaborations may require exclusivity in specific sectors or product lines, based on mutual agreement.' },
    { icon: '📊', title: 'Transparency', description: 'Financial and operational dealings must be transparent, with clear documentation.' },
    { icon: '🚫', title: 'Termination', description: 'Either party may end the partnership in case of breach of trust, failure to deliver commitments, or unethical practices.' }
  ];

  const benefits = [
    { icon: '📈', title: 'Shared Growth Opportunities', description: 'Collaborate in a growing ecommerce ecosystem with mutual benefits.' },
    { icon: '🔍', title: 'Transparent Practices', description: 'Experience reliable and honest business dealings.' },
    { icon: '🌍', title: 'Market Access', description: 'Reach diverse markets and industries through our platform.' },
    { icon: '💎', title: 'Exclusive Collaborations', description: 'Potential for unique partnerships in logistics, payments, marketing, and technology.' }
  ];

  const handleInquirySubmit = async () => {
    setErrorMessage('');
    setInquiryStatus('loading');

    try {
      const response = await createPartnershipInquiry(inquiryFormData).unwrap();
      console.log('Inquiry success:', response);
      setInquiryStatus('success');
      setInquiryFormData({ name: '', email: '', phone: '', company: '', message: '' });
    } catch (err) {
      console.error('Inquiry error:', err);
      const msg = err?.data?.error || err?.data?.details || 'Failed to submit inquiry. Please try again.';
      setErrorMessage(msg);
      setInquiryStatus('error');
    }
  };

  const handleMeetingSubmit = async () => {
    if (!meetingFormData.name || !meetingFormData.email || !meetingFormData.preferredDate || !meetingFormData.preferredTime) {
      alert('Name, email, preferred date, and preferred time are required');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setMeetingStatus('loading');

    try {
      const response = await createMeetingRequest(meetingFormData).unwrap();
      console.log('Meeting success:', response);
      setMeetingStatus('success');
      setMeetingFormData({
        name: '', email: '', phone: '', company: '',
        preferredDate: '', preferredTime: '', message: ''
      });
    } catch (err) {
      console.error('Meeting error:', err);
      const msg = err?.data?.error || err?.data?.details || 'Failed to submit meeting request. Please try again.';
      setErrorMessage(msg);
      setMeetingStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const closeInquiryModal = () => {
    setIsInquiryModalOpen(false);
    setInquiryFormData({ name: '', email: '', phone: '', company: '', message: '' });
    setInquiryStatus('');
    setErrorMessage('');
  };

  const closeMeetingModal = () => {
    setIsMeetingModalOpen(false);
    setMeetingFormData({ name: '', email: '', phone: '', company: '', preferredDate: '', preferredTime: '', message: '' });
    setMeetingStatus('');
    setErrorMessage('');
  };

  const closeLearnMoreModal = () => setIsLearnMoreOpen(false);
  const closeBrochureModal = () => setIsBrochureOpen(false);
  const closeDonationModal = () => setIsDonationOpen(false);

  return (
    <>
      <Head>
        <title>Our Partners - MOH Capital Marketplace</title>
        <meta name="description" content="Partner with MOH Capital - Join our ecosystem for mutual growth and success in ecommerce" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
        {/* Hero Section */}
        <section className="relative py-12 sm:py-24 bg-gradient-to-r from-indigo-600 to-purple-700 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-36 translate-x-36 hidden sm:block"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-48 -translate-x-48 hidden sm:block"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8 border border-white/20">
                <span>✨</span> Strategic Collaborations
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 tracking-tight">
                Our <span className="text-yellow-300">Partners</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed font-light">
                Building lasting relationships that drive innovation and growth in the ecommerce ecosystem
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => setIsInquiryModalOpen(true)} className="bg-yellow-400 hover:bg-yellow-300 text-indigo-900 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Become a Partner
                </button>
                <button onClick={() => setIsLearnMoreOpen(true)} className="border-2 border-white hover:bg-white/10 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-300">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-12 sm:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                  <span>🏢</span> Our Partnership Philosophy
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                  Partnerships Are The Backbone of Sustainable Growth
                </h2>
                <div className="space-y-4 text-base sm:text-lg text-gray-600">
                  <p>
                    At MOH Capital, we understand that partnerships are the backbone of sustainable growth. While our marketplace is focused on empowering sellers and buyers, we also recognize the importance of building long-term relationships with businesses, organizations, and service providers across multiple sectors.
                  </p>
                  <p className="italic font-serif text-indigo-800">
                    Under the visionary stewardship of Md. Tajim Shaikh, MOH Capital Overseas endeavors to ascend to the zenith of India's export industry, establishing an indelible mark on the international commerce landscape by becoming the nation's premier exporter of premium agricultural products such as fresh garlic and onions, whilst forging unparalleled global partnerships that epitomize excellence, trust, and innovation.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 sm:p-8 text-white shadow-2xl">
                  <div className="text-3xl sm:text-4xl mb-4">🤝</div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-4">Partnership Commitment</h3>
                  <p className="text-indigo-100 leading-relaxed text-sm sm:text-base">
                    At MOH Capital, partnership is more than a contract—it's a long-term relationship built on trust, professionalism, and mutual respect. All partnerships are evaluated to ensure alignment with our mission and values.
                  </p>
                </div>
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full hidden sm:block"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-400 rounded-full hidden sm:block"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-12 sm:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Why Partner with MOH Capital?
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                Join forces with us to create exceptional value and drive innovation
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="group">
                  <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 h-full transform hover:-translate-y-2">
                    <div className="text-3xl sm:text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                      {benefit.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Partnership Areas */}
        <section className="py-12 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Areas of Partnership
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                We welcome collaboration across various sectors to enhance our ecosystem
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {partnershipAreas.map((area, index) => (
                <div key={index} className="group">
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 sm:p-8 border border-gray-200 hover:border-indigo-300 transition-all duration-500 h-full transform hover:-translate-y-1">
                    <div className="text-2xl sm:text-3xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                      {area.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{area.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{area.description}</p>
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
        <section className="py-12 sm:py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Terms & Conditions for Partners
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                Our framework for successful and ethical partnerships
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {terms.map((term, index) => (
                <div key={index} className="group">
                  <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-500 h-full">
                    <div className="text-2xl sm:text-3xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                      {term.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{term.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{term.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How to Partner */}
        <section className="py-12 sm:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                  <span>📞</span> Get Started
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                  How to Partner with Us
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-600 font-bold text-sm sm:text-base">1</span>
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Contact Our Team</h3>
                      <p className="text-gray-600 text-sm sm:text-base">
                        Interested businesses or organizations can contact MOH Capital's admin team directly to discuss opportunities.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 font-bold text-sm sm:text-base">2</span>
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Proposal Review</h3>
                      <p className="text-gray-600 text-sm sm:text-base">
                        Each proposal is carefully reviewed to ensure alignment with our goals and values.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-purple-600 font-bold text-sm sm:text-base">3</span>
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Formal Agreement</h3>
                      <p className="text-gray-600 text-sm sm:text-base">
                        If aligned with our goals, formal agreements will be made to establish the partnership.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-gradient-to-br from-gray-900 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-2xl">
                  <div className="text-3xl sm:text-4xl mb-4">🎯</div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-4">Ready to Collaborate?</h3>
                  <p className="text-gray-300 mb-6 leading-relaxed text-sm sm:text-base">
                    Take the first step towards a successful partnership with MOH Capital. Our team is ready to explore innovative collaborations that drive mutual growth.
                  </p>
                  <div className="space-y-4">
                    <button onClick={() => setIsInquiryModalOpen(true)} className="w-full bg-green-500 hover:bg-green-400 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 text-sm sm:text-base">
                      Contact Partnership Team
                    </button>
                    <button 
                      onClick={() => setIsBrochureOpen(true)} 
                      className="w-full block border-2 border-gray-300 hover:bg-white/10 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 text-center text-sm sm:text-base"
                    >
                      View Partnership Brochure
                    </button>
                  </div>
                </div>
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-yellow-400 rounded-full opacity-20 hidden sm:block"></div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-blue-400 rounded-full opacity-20 hidden sm:block"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 sm:py-20 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Let's Build Something Amazing Together
            </h2>
            <p className="text-lg sm:text-xl text-indigo-100 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
              Join the MOH Capital partnership ecosystem and be part of an innovative ecommerce platform that values collaboration, transparency, and mutual success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => setIsInquiryModalOpen(true)} className="bg-yellow-400 hover:bg-yellow-300 text-indigo-900 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                Start Partnership Discussion
              </button>
              <button onClick={() => setIsMeetingModalOpen(true)} className="border-2 border-white hover:bg-white/10 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-300">
                Schedule a Meeting
              </button>
            </div>
            <p className="text-indigo-200 mt-4 sm:mt-6 text-xs sm:text-sm">
              Partnership inquiries are typically responded to within 24-48 hours.
            </p>
            <button onClick={() => setIsDonationOpen(true)} className="mt-4 bg-green-500 hover:bg-green-400 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base">
              Support Us with a Donation
            </button>
          </div>
        </section>

        {/* Partnership Inquiry Modal */}
        {isInquiryModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-auto my-8 p-4 sm:p-8 relative">
              <button
                onClick={closeInquiryModal}
                className="absolute top-4 right-4 sm:right-6 text-2xl text-gray-500 hover:text-gray-800"
              >
                ×
              </button>

              {inquiryStatus === 'success' ? (
                <div className="text-center py-8 sm:py-16">
                  <div className="text-6xl sm:text-8xl mb-6">✅</div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Inquiry Submitted!</h2>
                  <p className="text-lg sm:text-xl text-gray-600 max-w-lg mx-auto">
                    Thank you for your interest in partnering with MOH Capital. We have received your inquiry. Our team will review it and contact you soon.
                  </p>
                </div>
              ) : inquiryStatus === 'error' ? (
                <div className="text-center py-8 sm:py-16">
                  <div className="text-6xl sm:text-8xl mb-6">❌</div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Submission Failed</h2>
                  <p className="text-lg text-gray-600 mb-4">{errorMessage}</p>
                  <button
                    onClick={() => setInquiryStatus('')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">Partnership Inquiry</h2>
                  <p className="text-center text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
                    Submit your details to start the partnership discussion.
                  </p>

                  <div className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                        <input
                          type="text"
                          value={inquiryFormData.name}
                          onChange={(e) => setInquiryFormData({ ...inquiryFormData, name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                        <input
                          type="email"
                          value={inquiryFormData.email}
                          onChange={(e) => setInquiryFormData({ ...inquiryFormData, email: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                          type="tel"
                          value={inquiryFormData.phone}
                          onChange={(e) => setInquiryFormData({ ...inquiryFormData, phone: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company / Organization</label>
                        <input
                          type="text"
                          value={inquiryFormData.company}
                          onChange={(e) => setInquiryFormData({ ...inquiryFormData, company: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                      <textarea
                        rows={4}
                        value={inquiryFormData.message}
                        onChange={(e) => setInquiryFormData({ ...inquiryFormData, message: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <button
                      onClick={handleInquirySubmit}
                      disabled={inquiryLoading || inquiryStatus === 'loading' || !inquiryFormData.name || !inquiryFormData.email}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all"
                    >
                      {inquiryLoading || inquiryStatus === 'loading' ? 'Processing...' : 'Submit Inquiry'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Meeting Schedule Modal */}
        {isMeetingModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-auto my-8 p-4 sm:p-8 relative">
              <button
                onClick={closeMeetingModal}
                className="absolute top-4 right-4 sm:right-6 text-2xl text-gray-500 hover:text-gray-800"
              >
                ×
              </button>

              {meetingStatus === 'success' ? (
                <div className="text-center py-8 sm:py-16">
                  <div className="text-6xl sm:text-8xl mb-6">✅</div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Meeting Request Submitted!</h2>
                  <p className="text-lg sm:text-xl text-gray-600 max-w-lg mx-auto">
                    Thank you for requesting a meeting. We have received your details and will confirm soon.
                  </p>
                </div>
              ) : meetingStatus === 'error' ? (
                <div className="text-center py-8 sm:py-16">
                  <div className="text-6xl sm:text-8xl mb-6">❌</div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Submission Failed</h2>
                  <p className="text-lg text-gray-600 mb-4">{errorMessage}</p>
                  <button
                    onClick={() => setMeetingStatus('')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">Schedule a Meeting</h2>
                  <p className="text-center text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
                    Provide your details and preferred time to schedule a meeting with our team.
                  </p>

                  <div className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                        <input
                          type="text"
                          value={meetingFormData.name}
                          onChange={(e) => setMeetingFormData({ ...meetingFormData, name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                        <input
                          type="email"
                          value={meetingFormData.email}
                          onChange={(e) => setMeetingFormData({ ...meetingFormData, email: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                          type="tel"
                          value={meetingFormData.phone}
                          onChange={(e) => setMeetingFormData({ ...meetingFormData, phone: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company / Organization</label>
                        <input
                          type="text"
                          value={meetingFormData.company}
                          onChange={(e) => setMeetingFormData({ ...meetingFormData, company: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date *</label>
                        <input
                          type="date"
                          value={meetingFormData.preferredDate}
                          onChange={(e) => setMeetingFormData({ ...meetingFormData, preferredDate: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time *</label>
                        <input
                          type="time"
                          value={meetingFormData.preferredTime}
                          onChange={(e) => setMeetingFormData({ ...meetingFormData, preferredTime: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                      <textarea
                        rows={4}
                        value={meetingFormData.message}
                        onChange={(e) => setMeetingFormData({ ...meetingFormData, message: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <button
                      onClick={handleMeetingSubmit}
                      disabled={meetingLoading || isLoading || !meetingFormData.name || !meetingFormData.email || !meetingFormData.preferredDate || !meetingFormData.preferredTime}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all"
                    >
                      {meetingLoading || isLoading ? 'Processing...' : 'Submit Meeting Request'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Learn More Modal */}
        {isLearnMoreOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-auto my-8 p-4 sm:p-12 relative">
              <button
                onClick={closeLearnMoreModal}
                className="absolute top-4 right-4 sm:right-6 text-2xl text-gray-500 hover:text-gray-800"
              >
                ×
              </button>
              <h2 className="text-3xl sm:text-4xl font-bold text-center mb-6 sm:mb-8 text-indigo-900">Discover MOH Capital Overseas</h2>
              <div className="space-y-6 sm:space-y-8 text-gray-700 leading-relaxed text-sm sm:text-base">
                <p>
                  MOH Capital Overseas stands as a beacon of excellence in the realm of international trade, specializing in the export of premium fresh garlic and onions from the fertile lands of India. Founded with a commitment to quality, reliability, and global reach, our platform serves as a vital bridge connecting Indian agricultural prowess with discerning markets worldwide.
                </p>
                <p className="font-serif italic text-base sm:text-lg text-indigo-800 bg-indigo-50 p-4 sm:p-6 rounded-lg">
                  Under the visionary stewardship of Md. Tajim Shaikh, MOH Capital Overseas endeavors to ascend to the zenith of India's export industry, establishing an indelible mark on the international commerce landscape. With unwavering ambition and strategic acumen, Mr. Shaikh propels the company towards becoming India's paramount exporter, fostering enduring partnerships that transcend borders and elevate Indian produce to global acclaim.
                </p>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">Our Partnership Ecosystem</h3>
                <p>
                  At MOH Capital, partnerships transcend mere transactions; they embody symbiotic alliances forged in pursuit of shared prosperity. We curate collaborations across diverse domains – from logistics maestros ensuring seamless delivery to technology virtuosos enhancing our digital infrastructure. Each partnership is meticulously cultivated to amplify our collective impact in the ecommerce arena.
                </p>
                <p>
                  Our marketplace empowers sellers with unparalleled tools for global expansion while providing buyers access to authenticated, high-quality products. Through innovative features like real-time analytics and AI-driven recommendations, we redefine the export landscape, making international trade accessible, efficient, and profitable.
                </p>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">Our Vision for the Future</h3>
                <p>
                  As we navigate the dynamic currents of global trade, MOH Capital Overseas remains steadfast in its pursuit of innovation and excellence. We envision a future where Indian exports lead the world stage, driven by sustainable practices, cutting-edge technology, and unbreakable trust. Join us in this transformative journey – together, we shall redefine the boundaries of possibility in international commerce.
                </p>
              </div>
              <div className="mt-6 sm:mt-8 text-center">
                <button onClick={closeLearnMoreModal} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Brochure Modal */}
        {isBrochureOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-2xl max-w-4xl w-full mx-auto my-8 p-4 sm:p-12 relative overflow-hidden">
              <button
                onClick={closeBrochureModal}
                className="absolute top-4 right-4 sm:right-6 text-2xl text-gray-500 hover:text-gray-800 z-10"
              >
                ×
              </button>
              <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-300 rounded-full opacity-20 -translate-x-16 -translate-y-16 hidden sm:block"></div>
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-green-300 rounded-full opacity-20 translate-x-24 translate-y-24 hidden sm:block"></div>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-center mb-8 sm:mb-12 text-indigo-900 tracking-wide">MOH Capital Overseas Partnership Brochure</h2>
              <div className="space-y-8 sm:space-y-12">
                <section>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-purple-800">Welcome to Excellence in Global Trade</h3>
                  <p className="text-base sm:text-lg leading-relaxed text-gray-700">
                    Embark on a journey of unparalleled opportunity with MOH Capital Overseas – where innovation meets tradition in the art of international export. Specializing in premium fresh garlic and onions from India's richest farmlands, we deliver not just products, but promises of quality, freshness, and reliability to discerning markets across the globe.
                  </p>
                </section>
                <section>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-purple-800">Our Illustrious Leadership</h3>
                  <p className="text-base sm:text-lg leading-relaxed text-gray-700 font-serif italic bg-white p-4 sm:p-6 rounded-lg shadow-md">
                    Guided by the visionary acumen of Md. Tajim Shaikh, MOH Capital Overseas charts a course towards becoming India's preeminent exporter. With a resolute ambition to etch an enduring legacy in the international arena, Mr. Shaikh orchestrates a symphony of strategic initiatives that propel Indian agriculture to global prominence, fostering partnerships that resonate with excellence and mutual prosperity.
                  </p>
                </section>
                <section>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-purple-800">Partnership Opportunities: A Symphony of Synergy</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {partnershipAreas.map((area, index) => (
                      <li key={index} className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
                        <div className="text-3xl sm:text-4xl mb-4">{area.icon}</div>
                        <h4 className="text-lg sm:text-xl font-semibold mb-2">{area.title}</h4>
                        <p className="text-gray-600 text-sm sm:text-base">{area.description}</p>
                      </li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-purple-800">Benefits: Elevating Your Enterprise</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {benefits.map((benefit, index) => (
                      <li key={index} className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
                        <div className="text-3xl sm:text-4xl mb-4">{benefit.icon}</div>
                        <h4 className="text-lg sm:text-xl font-semibold mb-2">{benefit.title}</h4>
                        <p className="text-gray-600 text-sm sm:text-base">{benefit.description}</p>
                      </li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-purple-800">Terms: Foundations of Trust</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {terms.map((term, index) => (
                      <li key={index} className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
                        <div className="text-3xl sm:text-4xl mb-4">{term.icon}</div>
                        <h4 className="text-lg sm:text-xl font-semibold mb-2">{term.title}</h4>
                        <p className="text-gray-600 text-sm sm:text-base">{term.description}</p>
                      </li>
                    ))}
                  </ul>
                </section>
                <section className="text-center">
                  <h3 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-purple-800">Join the Vanguard of Global Excellence</h3>
                  <p className="text-lg sm:text-xl text-gray-700 mb-6 sm:mb-8">
                    At MOH Capital Overseas, we invite you to partake in a legacy of distinction. Contact us today to explore how our partnership can propel your ambitions to new horizons.
                  </p>
                  <a href="/brochure/partnership-brochure.pdf" download className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all inline-block">
                    Download PDF Version
                  </a>
                </section>
              </div>
            </div>
          </div>
        )}

        {/* Donation Modal */}
        {isDonationOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-auto my-8 p-4 sm:p-8 relative">
              <button
                onClick={closeDonationModal}
                className="absolute top-4 right-4 sm:right-6 text-2xl text-gray-500 hover:text-gray-800"
              >
                ×
              </button>
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">Support MOH Capital</h2>
              <p className="text-center text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
                Your generous donation helps us expand our global reach and support more exporters. Thank you for contributing to our mission!
              </p>
              <div className="space-y-4 sm:space-y-6">
                <p className="text-center text-gray-700 text-sm sm:text-base">
                  Donations can be made via bank transfer or online payment. Please contact mohcapitaloverseas@gmail.com for details.
                </p>
                <div className="text-center">
                  <button onClick={closeDonationModal} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default OurPartnersPage;