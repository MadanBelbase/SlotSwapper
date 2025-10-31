import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gradient-to-b from-slate-900 to-slate-800 border-t border-white/10 mt-auto">
      <div className="container mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-lg font-bold">🔄</span>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                SlotSwapper
              </h3>
            </div>
            <p className="text-gray-400 max-w-md text-lg leading-relaxed">
              Revolutionize your schedule management with AI-powered slot swapping. 
              Efficient, intuitive, and designed for modern professionals.
            </p>
            <div className="flex space-x-4 mt-6">
              {[
                { icon: '🐦', label: 'Twitter', url: '#' },
                { icon: '📘', label: 'Facebook', url: '#' },
                { icon: '📷', label: 'Instagram', url: '#' },
                { icon: '💼', label: 'LinkedIn', url: '#' }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="w-12 h-12 bg-white/5 hover:bg-cyan-500/20 border border-white/10 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:border-cyan-500/50 group"
                  aria-label={social.label}
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">
                    {social.icon}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-cyan-300 font-bold text-lg mb-6 flex items-center">
              <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
              Navigation
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'Dashboard', path: '/dashboard' },
                { name: 'Create Slot', path: '/create-slot' },
                { name: 'My Slots', path: '/my-slots' },
                { name: 'View Swaps', path: '/slot-swaps' }
              ].map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-cyan-300 transition-all duration-300 flex items-center group"
                  >
                    <span className="w-1 h-1 bg-gray-600 rounded-full mr-3 group-hover:bg-cyan-400 transition-colors"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="text-cyan-300 font-bold text-lg mb-6 flex items-center">
              <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
              Support
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'Help Center', path: '/help' },
                { name: 'Privacy Policy', path: '/privacy' },
                { name: 'Terms of Service', path: '/terms' },
                { name: 'Contact Us', path: '/contact' }
              ].map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-cyan-300 transition-all duration-300 flex items-center group"
                  >
                    <span className="w-1 h-1 bg-gray-600 rounded-full mr-3 group-hover:bg-cyan-400 transition-colors"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-white/10 mb-8">
          {[
            { icon: '⚡', title: 'Lightning Fast', desc: 'Instant slot swaps' },
            { icon: '🔒', title: 'Secure', desc: 'End-to-end encryption' },
            { icon: '🤖', title: 'AI Powered', desc: 'Smart scheduling' },
            { icon: '📱', title: 'Responsive', desc: 'Works everywhere' }
          ].map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">{feature.icon}</span>
              </div>
              <h5 className="text-cyan-300 font-semibold mb-1">{feature.title}</h5>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-gray-400 text-sm">
            <p>
              &copy; {currentYear} <span className="text-cyan-300 font-semibold">SlotSwapper</span>. 
              All rights reserved. Crafted with ❤️ for better scheduling.
            </p>
          </div>
          
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2 text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>All systems operational</span>
            </div>
            <div className="text-gray-400">
              v1.0.0
            </div>
          </div>
        </div>

        {/* Back to Top */}
        <div className="text-center mt-8">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-white/5 hover:bg-cyan-500/20 border border-white/10 rounded-xl text-cyan-300 transition-all duration-300 transform hover:scale-105 hover:border-cyan-500/50 group"
          >
            <span>↑</span>
            <span>Back to Top</span>
          </button>
        </div>
      </div>
    </footer>
  );
};