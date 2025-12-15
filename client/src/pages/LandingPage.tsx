'use client'

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Users, Star } from 'react-feather';
import Pamahres from '../assets/pamahres.png';
import Toast from '../components/Toast';
import { features } from '../components/Features';

const LandingPage = () => {
  const { isSignedIn } = useAuth();
  const [animatedSquares, setAnimatedSquares] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    speed: number;
    opacity: number;
  }>>([]);
  const [scrolled, setScrolled] = useState(false);
  const techStackText = 'deepseek • groq • supabase • ';

  // listen to scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    // Generate animated squares
    const squares = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 100 + 60,
      speed: Math.random() * 40 + 20,
      opacity: Math.random() * 0.15 + 0.08,
    }));
    setAnimatedSquares(squares);
  }, []);

  // const pricingPlans = [
  //   {
  //     name: 'Free',
  //     price: '$0.00',
  //     description: 'Perfect for getting started',
  //     features: [
  //       'Up to 3 courses',
  //       'Up to 3 quizzes per course',
  //       'Basic quiz generation',
  //       'Limited storage'
  //     ],
  //     buttonText: 'Get Started',
  //     popular: true
  //   },
  //   {
  //     name: 'Apprentice',
  //     price: '$X.XX/ mo',
  //     description: 'Best for growing learners',
  //     features: [
  //       'Up to 8 courses',
  //       'Up to 5 quizzes per course',
  //       'Extended storage',
  //       'Analytics dashboard'
  //     ],
  //     buttonText: 'Start Free Trial',
  //     popular: false
  //   },
  //   {
  //     name: 'Scholar',
  //     price: '$XX.XX / mo',
  //     description: 'For serious educators',
  //     features: [
  //       'Everything in Apprentice + more',
  //       'AI-powered insights',
  //       'API access'
  //     ],
  //     buttonText: 'Get Started',
  //     popular: false
  //   }
  // ];

  const testimonials = [
    {
      name: 'Cerefria Ciephr',
      rating: 5.0,
      text: 'One of the better AI-powered study tools I have used out there!'
    }
  ];
  const [showToast, setShowToast] = useState(false);
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Animated Background Squares */}
      {showToast && (
        <Toast 
          message="Quick Create feature coming soon!"
          onClose={() => setShowToast(false)}
        />
      )}
      <div className="fixed inset-0 pointer-events-none">
        {animatedSquares.map((square) => (
          <div
            key={square.id}
            className="absolute bg-gradient-to-br from-primary-200 via-primary-100 to-primary-300 shadow-sm"
            style={{
              left: `${square.x}%`,
              top: `${square.y}%`,
              width: `${square.size}px`,
              height: `${square.size}px`,
              opacity: square.opacity,
              borderRadius: `${Math.random() * 30 + 10}px`,
              animation: `float-${square.id} ${square.speed}s infinite ease-in-out`,
              transform: `rotate(${Math.random() * 45}deg)`,
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      {/* change bg if scrolled */}
      <nav className={`fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-4 mx-auto ${scrolled ? 'bg-white bg-opacity-20 backdrop-blur-md shadow-md' : 'bg-transparent'}`}>
        <div className="flex items-center gap-2">
          <img src={Pamahres} alt="Pamahres" className="w-8 h-8" />
          <span className="text-xl font-semibold text-primary-600">Pamahres</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#home" className="text-gray-700 hover:text-primary-600 transition-colors">Home</a>
          {/* <a href="#pricing" className="text-gray-700 hover:text-primary-600 transition-colors">Pricing</a> */}
          <a href="#features" className="text-gray-700 hover:text-primary-600 transition-colors">Features</a>
          <a href="#about" className="text-gray-700 hover:text-primary-600 transition-colors">About</a>
        </div>

        <Link
          to="/pamahres"
          className="bg-primary-600 text-xs text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          {isSignedIn ? 'Dashboard' : 'Login'}
        </Link>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative z-10 max-w-7xl mx-auto px-6 py-32 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-full px-4 py-2 text-sm text-gray-600 mb-8 overflow-hidden shadow-sm">
            <div className="relative w-48 overflow-hidden rounded-xl">
              <div className="animate-slide-text whitespace-nowrap rounded-xl text-primary-700 font-medium">
                {techStackText.repeat(2)}
              </div>
            </div>
          </div>

          <div className="relative">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-primary-600 to-gray-900 bg-clip-text text-transparent mb-6 relative">
              Pamahres
              <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
            </h1>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-medium bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent mb-4">
            Augment your study experience<br />
            Cram smarter, not harder
          </h2>

          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Studying has never been more easy with <span className="text-primary-600 font-semibold">Pamahres</span> — your go-to AI powered study helper featuring 
            <span className="text-primary-600 font-semibold"> course management</span>, <span className="text-primary-600 font-semibold">quiz generation</span>, and <span className="text-primary-600 font-semibold">context-augmented tutor</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
            to= "/quick-create"
            className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-3 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all font-medium inline-flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Quick Create
            </Link>
            <Link 
            to='/pamahres'
            className="border-2 border-primary-600 text-primary-600 px-8 py-3 rounded-lg hover:bg-primary-600 hover:text-white transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105">
              {isSignedIn ? 'Go to Dashboard' : 'Get Started'}
            </Link>
          </div>
        </div>

        {/* Additional decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-primary-200 to-primary-300 rounded-lg opacity-40 animate-spin shadow-lg" style={{animationDuration: '20s'}}></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-gradient-to-r from-secondary-200 to-accent-300 rounded-full opacity-35 animate-bounce shadow-md" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-5 w-8 h-8 bg-gradient-to-r from-primary-300 to-primary-400 rounded-full opacity-50 animate-ping" style={{animationDelay: '3s'}}></div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 relative">
            Why use <span className="text-primary-600 relative">
                Pamahres
                <div className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-primary-200 to-primary-300 opacity-30 rounded-full"></div>
              </span>?
          </h2>
          <p className="text-lg text-gray-600">Boost the effectivity of your study sessions by a mile!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Privacy-Focused */}
          {features.map((feature, index) => (
            <div key={index} className="p-6 bg-white rounded-lg border border-gray-100 hover:border-primary-200 transition-all">
              <div className={`w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4`}>
                {React.createElement(feature.icon, { className: "w-6 h-6 text-primary-600" })}
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section (to be added) */}
      {/* <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-primary-800 bg-clip-text text-transparent mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-gray-600">Start your learning journey with the perfect plan for you</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl border-2 p-8 transition-all hover:shadow-xl group ${
                plan.popular 
                  ? 'border-primary-500 shadow-lg transform scale-105 bg-gradient-to-br from-primary-50 to-white' 
                  : 'border-gray-200 hover:border-primary-300 hover:shadow-lg'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary-800 transition-colors">{plan.name}</h3>
                <div className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">{plan.price}</div>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled={!plan.popular}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'border-2 border-primary-300 text-primary-600 hover:border-primary-500 hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </section> */}

      {/* Testimonials Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-r from-purple-200 to-pink-200 rounded-lg opacity-25 animate-bounce" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 right-10 w-16 h-16 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full opacity-30 animate-ping" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative text-center mb-16">
          <div className="inline-block">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 relative">
              What Our <span className="text-primary-600 relative">
                Scholars
              </span> Say
            </h2>
          </div>
          <p className="text-lg text-gray-600 mb-8">Become one of the early Pamahres Learners!</p>
          
          {/* Stats row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">10+</div>
              <div className="text-gray-600">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">20+</div>
              <div className="text-gray-600">Quizzes Generated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">98%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-primary-50 rounded-2xl border border-primary-200 p-8 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
                {/* Decorative corner element */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-bl-full opacity-50"></div>
                
                <div className="relative h-full flex flex-col justify-between">
                  <div className="flex items-start mb-6">
                    <div className="text-6xl text-primary-300 mr-4 leading-none">"</div>
                    <div className="flex-1">
                      <p className="text-lg text-gray-700 leading-relaxed">
                        {testimonial.text}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-r from-primary-200 to-primary-300 rounded-full flex items-center justify-center shadow-md">
                      <Users className="w-7 h-7 text-primary-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-lg">{testimonial.name}</div>
                      <div className="flex items-center gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-primary-400 text-primary-400" />
                        ))}
                        <span className="font-medium text-gray-700 ml-2">{testimonial.rating}</span>
                      </div>
                      <div className="text-sm text-gray-500">Verified Student</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Additional testimonial */}
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl border border-purple-200 p-8 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-bl-full opacity-50"></div>
              
              <div className="relative h-full flex flex-col justify-between">
                <div className="flex items-start mb-6">
                  <div className="text-6xl text-purple-300 mr-4 leading-none">"</div>
                  <div className="flex-1">
                    <p className="text-lg text-gray-700 leading-relaxed">
                      I love how easy it is to use:D. The AI-generated questions are spot on with the materials I uploaded as well. So far, Pamahres has contributed significantly to my study habits^-^
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-purple-200 to-purple-300 rounded-full flex items-center justify-center shadow-md">
                    <Users className="w-7 h-7 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-lg">Maria Rodriguez</div>
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-purple-400 text-purple-400" />
                      ))}
                      <span className="font-medium text-gray-700 ml-2">5.0</span>
                    </div>
                    <div className="text-sm text-gray-500">BS Biology Student</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Call to action */}
          <div className="text-center mt-12">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-white opacity-10 transform -skew-y-6"></div>
              <div className="relative">
                <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Learning?</h3>
                <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
                  Join thousands of successful students who have already discovered the power of AI-assisted learning.
                </p>
                <Link 
                to="/pamahres"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg">
                  Become a Learner Now!
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-primary-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between flex-wrap gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img src={Pamahres} alt="Pamahres" className="w-8 h-8 brightness-0 invert" />
                <span className="text-xl font-semibold">Pamahres</span>
              </div>
              <p className="text-primary-200 leading-relaxed max-w-md">
                Your go-to AI powered study helper featuring course management, 
                quiz generation, and context-augmented tutor.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">About the dev</h4>
              <ul className="space-y-2 text-primary-200">
                <li><a href="https://github.com/kabsmeiou" target="_blank" className="hover:text-white transition-colors">Github</a></li>
                <li><a href="https://kabs-info.vercel.app" target="_blank" className="hover:text-white transition-colors">Contacts</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-primary-800 mt-12 pt-8 text-center text-primary-200">
            <p>&copy; 2025 Pamahres. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Custom animations for squares */}
      <style>
        {`
          @keyframes slide-text {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          
          .animate-slide-text {
            animation: slide-text 15s linear infinite;
          }
          
          ${animatedSquares.map(square => `
            @keyframes float-${square.id} {
              0% { 
                transform: translateX(0) translateY(0) scale(1) rotate(${Math.random() * 45}deg); 
                opacity: ${square.opacity}; 
              }
              25% { 
                transform: translateX(${Math.random() * 40 - 20}px) translateY(${Math.random() * 40 - 20}px) scale(${0.8 + Math.random() * 0.4}) rotate(${Math.random() * 90 + 45}deg); 
                opacity: ${square.opacity * (0.5 + Math.random() * 0.8)}; 
              }
              50% { 
                transform: translateX(${Math.random() * 60 - 30}px) translateY(${Math.random() * 60 - 30}px) scale(${1 + Math.random() * 0.3}) rotate(${Math.random() * 135 + 90}deg); 
                opacity: ${square.opacity * (0.7 + Math.random() * 0.6)}; 
              }
              75% { 
                transform: translateX(${Math.random() * 40 - 20}px) translateY(${Math.random() * 40 - 20}px) scale(${0.9 + Math.random() * 0.2}) rotate(${Math.random() * 180 + 135}deg); 
                opacity: ${square.opacity * (0.6 + Math.random() * 0.7)}; 
              }
              100% { 
                transform: translateX(0) translateY(0) scale(1) rotate(${Math.random() * 225 + 180}deg); 
                opacity: ${square.opacity}; 
              }
            }
          `).join('')}
        `}
      </style>
    </div>
  );
};

export default LandingPage;