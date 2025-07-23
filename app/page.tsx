'use client';
import { useState } from 'react';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: '📝',
      title: 'Digital Intake',
      description: 'Replace paper forms with a streamlined digital intake process. Capture customer info, item details, and service requirements instantly.'
    },
    {
      icon: '📋',
      title: 'Visual Workflow',
      description: 'Track every service request through an intuitive drag-and-drop kanban board. See the status of all jobs at a glance.'
    },
    {
      icon: '🖨️',
      title: 'Label Printing',
      description: 'Automatically generate and print professional labels for every item. No more handwritten tags or lost paperwork.'
    },
    {
      icon: '📊',
      title: 'Analytics & Reports',
      description: 'Monitor business performance with detailed analytics. Track turnaround times, service types, and completion rates.'
    },
    {
      icon: '⚡',
      title: 'Real-time Updates',
      description: 'Update service status instantly. Keep your team coordinated and customers informed throughout the process.'
    },
    {
      icon: '📱',
      title: 'Mobile Friendly',
      description: 'Access your service dashboard from any device. Perfect for busy service businesses that need flexibility.'
    }
  ];

  const stats = [
    { number: '2.3 days', label: 'Average turnaround time' },
    { number: '91%', label: 'Customer satisfaction' },
    { number: '45%', label: 'Faster processing' },
    { number: '100%', label: 'Digital workflow' }
  ];

  const testimonials = [
    {
      quote: "ServiceTracker Pro transformed our repair shop. We've cut our admin time in half and customers love the professional service.",
      author: "Mike Chen",
      role: "Owner, Tech Repair Solutions",
      avatar: "MC"
    },
    {
      quote: "The drag-and-drop interface is so intuitive. Our technicians picked it up immediately and now we're way more organized.",
      author: "Sarah Rodriguez",
      role: "Manager, AutoCare Plus",
      avatar: "SR"
    },
    {
      quote: "Finally, no more lost paperwork or confused customers. Everything is tracked digitally and looks super professional.",
      author: "David Kim",
      role: "Owner, Home Appliance Repair Co.",
      avatar: "DK"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">🔧 ServiceTracker Pro</div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition duration-200">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition duration-200">How it Works</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition duration-200">Testimonials</a>
              <a href="/auth" className="text-gray-600 hover:text-gray-900 transition duration-200">Sign In</a>
              <a href="/auth" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200">
                Get Started
              </a>
            </div>

            <div className="md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900"
              >
                ☰
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden pb-4">
              <div className="flex flex-col space-y-2">
                <a href="#features" className="text-gray-600 hover:text-gray-900 py-2">Features</a>
                <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 py-2">How it Works</a>
                <a href="#testimonials" className="text-gray-600 hover:text-gray-900 py-2">Testimonials</a>
                <a href="/auth" className="text-gray-600 hover:text-gray-900 py-2">Sign In</a>
                <a href="/auth" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200 mt-2 text-center">
                  Get Started
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Streamline Your 
              <span className="text-blue-600"> Service</span> 
              <br />Business Workflow
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Replace paperwork chaos with a professional digital workflow. Track every service request from intake to completion with our intuitive management system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/auth" className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 transform hover:scale-105 transition duration-200 shadow-lg text-center">
                Start Free Trial
              </a>
              <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-50 transition duration-200">
                Watch Demo
              </button>
            </div>
          </div>
          
          {/* Hero Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stat.number}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Designed for service businesses of all types, with all the tools you need to run efficiently.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition duration-300 group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition duration-300">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple 3-Step Process</h2>
            <p className="text-xl text-gray-600">Get up and running in minutes, not hours</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">1</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Create Service Request</h3>
              <p className="text-gray-600">Customer brings in their item for service. Fill out the digital intake form with service details and automatically print a professional label.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">2</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Track Progress</h3>
              <p className="text-gray-600">Move tasks through your workflow with simple drag-and-drop. Everyone can see what's in progress and what's ready for pickup.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">3</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Complete & Analyze</h3>
              <p className="text-gray-600">Mark services complete and view detailed analytics. Track your business performance and identify areas for improvement.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Loved by Business Owners</h2>
            <p className="text-xl text-gray-600">See what service professionals are saying</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl">
                <div className="mb-6">
                  <div className="text-yellow-400 text-xl mb-4">★★★★★</div>
                  <p className="text-gray-700 italic">"{testimonial.quote}"</p>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Business?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of service businesses already using ServiceTracker Pro to streamline their operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/auth" className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-100 transform hover:scale-105 transition duration-200 shadow-lg text-center">
              Start Free 14-Day Trial
            </a>
            <button className="border border-white text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-white hover:text-blue-600 transition duration-200">
              Schedule Demo
            </button>
          </div>
          <div className="text-blue-100 text-sm mt-4">
            No credit card required • Cancel anytime • Full support included
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-white mb-4">🔧 ServiceTracker Pro</div>
              <p className="text-gray-400 text-sm">
                The modern way to manage your service business. Professional, efficient, and easy to use.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition duration-200">Features</a></li>
                <li><a href="#" className="hover:text-white transition duration-200">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition duration-200">Demo</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition duration-200">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition duration-200">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition duration-200">Training</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition duration-200">About</a></li>
                <li><a href="#" className="hover:text-white transition duration-200">Blog</a></li>
                <li><a href="#" className="hover:text-white transition duration-200">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2025 ServiceTracker Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}