'use client';

import {ModeToggle} from "@/components/darkToggle";

export default function LandingClient() {
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
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">


            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 py-20 pt-32 relative overflow-hidden transition-colors duration-300">
                {/* Hero overlay for depth */}
                <div className="absolute inset-0 hero-overlay"></div>

                {/* Floating decorative elements */}
                <div className="absolute top-20 left-10 w-32 h-32 glass-effect rounded-full floating-element opacity-30"></div>
                <div className="absolute top-40 right-20 w-24 h-24 glass-effect rounded-full floating-slow opacity-20"></div>
                <div className="absolute bottom-20 left-1/4 w-16 h-16 glass-effect rounded-full floating-fast opacity-25"></div>
                <div className="absolute top-1/2 right-10 w-20 h-20 glass-effect rounded-full floating-element opacity-15"></div>

                <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                            Streamline Your
                            <span className="gradient-text"> Service</span>
                            <br />Business Workflow
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                            Replace paperwork chaos with a professional digital workflow. Track every service request from intake to completion with our intuitive management system.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="/auth/login" className="bg-blue-600 dark:bg-blue-500 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transform hover:scale-105 transition duration-200 shadow-lg text-center">
                                Start Free Trial
                            </a>
                            <button className="glass-button text-gray-700 dark:text-gray-300 px-8 py-4 rounded-lg text-lg font-medium">
                                Watch Demo
                            </button>
                        </div>
                    </div>

                    {/* Hero Stats with Glass Effect */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
                        {stats.map((stat, index) => (
                            <div key={index} className="glass-card rounded-xl p-6 text-center">
                                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stat.number}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 relative transition-colors duration-300">
                {/* Background decorative elements */}
                <div className="absolute top-10 right-10 w-40 h-40 glass-effect rounded-full opacity-20"></div>
                <div className="absolute bottom-20 left-10 w-28 h-28 glass-effect rounded-full opacity-15"></div>
                <div className="absolute top-1/2 left-1/2 w-36 h-36 glass-effect rounded-full opacity-10 transform -translate-x-1/2 -translate-y-1/2"></div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Everything You Need</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            Designed for service businesses of all types, with all the tools you need to run efficiently.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="glass-feature rounded-xl p-8 group">
                                <div className="text-4xl mb-4 group-hover:scale-110 transition duration-300">{feature.icon}</div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-20 bg-gray-50 dark:bg-slate-800 relative transition-colors duration-300">
                {/* Floating background elements */}
                <div className="absolute top-20 left-20 w-24 h-24 glass-effect rounded-full floating-slow opacity-20"></div>
                <div className="absolute bottom-40 right-20 w-32 h-32 glass-effect rounded-full floating-element opacity-15"></div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Simple 3-Step Process</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">Get up and running in minutes, not hours</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="glass-step rounded-xl p-8 text-center">
                            <div className="bg-blue-600 dark:bg-blue-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">1</div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Create Service Request</h3>
                            <p className="text-gray-600 dark:text-gray-300">Customer brings in their item for service. Fill out the digital intake form with service details and automatically print a professional label.</p>
                        </div>

                        <div className="glass-step rounded-xl p-8 text-center">
                            <div className="bg-blue-600 dark:bg-blue-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">2</div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Track Progress</h3>
                            <p className="text-gray-600 dark:text-gray-300">Move tasks through your workflow with simple drag-and-drop. Everyone can see what&apos;s in progress and what&apos;s ready for pickup.</p>
                        </div>

                        <div className="glass-step rounded-xl p-8 text-center">
                            <div className="bg-blue-600 dark:bg-blue-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">3</div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Complete & Analyze</h3>
                            <p className="text-gray-600 dark:text-gray-300">Mark services complete and view detailed analytics. Track your business performance and identify areas for improvement.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-20 bg-white dark:bg-gray-900 relative overflow-hidden transition-colors duration-300">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-20 h-20 glass-effect rounded-full floating-element"></div>
                    <div className="absolute top-40 right-40 w-16 h-16 glass-effect rounded-full floating-slow"></div>
                    <div className="absolute bottom-20 left-1/3 w-24 h-24 glass-effect rounded-full floating-fast"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Loved by Business Owners</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">See what service professionals are saying</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="glass-testimonial rounded-xl p-8">
                                <div className="mb-6">
                                    <div className="text-yellow-400 text-xl mb-4">★★★★★</div>
                                    <p className="text-gray-700 dark:text-gray-300 italic">&#34;{testimonial.quote}&#34;</p>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center font-medium mr-4 shadow-lg">
                                        {testimonial.avatar}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900 dark:text-white">{testimonial.author}</div>
                                        <div className="text-gray-600 dark:text-gray-400 text-sm">{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 relative overflow-hidden">
                {/* Glass overlay */}
                <div className="absolute inset-0 glass-dark"></div>

                <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
                    <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Business?</h2>
                    <p className="text-xl text-blue-100 dark:text-blue-200 mb-8">
                        Join hundreds of service businesses already using ServiceTracker Pro to streamline their operations.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/auth/login" className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-100 transform hover:scale-105 transition duration-200 shadow-lg text-center">
                            Start Free 14-Day Trial
                        </a>
                        <button className="glass-button border-white text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-white hover:text-blue-600 transition duration-200">
                            Schedule Demo
                        </button>
                    </div>
                    <div className="text-blue-100 dark:text-blue-200 text-sm mt-4">
                        No credit card required • Cancel anytime • Full support included
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="glass-footer bg-gray-900 dark:bg-black text-gray-300 dark:text-gray-400 py-12 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="text-2xl font-bold text-white mb-4">🔧 ServiceTracker Pro</div>
                            <p className="text-gray-400 dark:text-gray-500 text-sm">
                                The modern way to manage your service business. Professional, efficient, and easy to use.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#features" className="hover:text-white dark:hover:text-gray-200 transition duration-200">Features</a></li>
                                <li><a href="#" className="hover:text-white dark:hover:text-gray-200 transition duration-200">Pricing</a></li>
                                <li><a href="#" className="hover:text-white dark:hover:text-gray-200 transition duration-200">Demo</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">Support</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white dark:hover:text-gray-200 transition duration-200">Help Center</a></li>
                                <li><a href="#" className="hover:text-white dark:hover:text-gray-200 transition duration-200">Contact Us</a></li>
                                <li><a href="#" className="hover:text-white dark:hover:text-gray-200 transition duration-200">Training</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white dark:hover:text-gray-200 transition duration-200">About</a></li>
                                <li><a href="#" className="hover:text-white dark:hover:text-gray-200 transition duration-200">Blog</a></li>
                                <li><a href="#" className="hover:text-white dark:hover:text-gray-200 transition duration-200">Privacy</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 dark:border-gray-700 mt-8 pt-8 text-center text-sm">
                        <p>&copy; 2025 ServiceTracker Pro. All rights reserved.</p>
                    </div>
                    <ModeToggle />
                </div>
            </footer>
        </div>
    );
}