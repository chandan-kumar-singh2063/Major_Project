import { motion } from 'framer-motion';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ContactUs = () => {
  return (
    <>
      <Navbar />

      <section className="min-h-screen pt-28 pb-20 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              We'd love to hear from you! Fill out the form or reach out directly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Contact Form */}
            <motion.form
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-8 space-y-6 transition-colors"
            >
              <div>
                <label className="block mb-2 font-semibold">Full Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-gray-100"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold">Email Address</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-gray-100"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold">Message</label>
                <textarea
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-gray-100"
                  placeholder="Write your message..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-300"
              >
                Send Message
              </button>
            </motion.form>

            {/* Contact Info */}
            <div className="space-y-8 text-gray-800 dark:text-gray-200">
              <div className="flex items-center gap-4">
                <FaMapMarkerAlt className="text-blue-600 text-xl" />
                <span>Dharan, Nepal</span>
              </div>

              <div className="flex items-center gap-4">
                <FaPhoneAlt className="text-blue-600 text-xl" />
                <span>+977-9806285040</span>
              </div>

              <div className="flex items-center gap-4">
                <FaEnvelope className="text-blue-600 text-xl" />
                <span>yadavnigam72@gmail.com</span>
              </div>

              {/* WhatsApp */}
              <div className="flex items-center gap-4">
                <FaWhatsapp className="text-green-500 text-2xl" />
                <a>

                  href="https://wa.me/9779806285040"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-500 transition-colors duration-200"

                  Chat with us on WhatsApp
                </a>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Support & Replies</h4>
                <p>Sunday - Friday: 9:00 AM – 5:00 PM</p>
                <p>Saturday: Not Available</p>
              </div>
            </div>
          </div>
        </div>
      </section >

      <Footer />
    </>
  );
};

export default ContactUs;