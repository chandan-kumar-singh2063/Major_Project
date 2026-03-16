
import { motion } from 'framer-motion';
import { FaLaptopCode, FaMobileAlt, FaBrain, FaTools, FaFacebook, FaLinkedin, FaInstagram, FaGithub } from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OptimizedImage from '@/components/OptimizedImage';

const AboutUs = () => {
  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-center mb-12"
        >
          Meet Our Team
        </motion.h1>

        {/* Sonu */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md mb-10"
        >
          <div className="flex flex-col md:flex-row justify-between gap-10 items-center">
            <div className="md:w-3/4 text-left">
              <h2 className="text-3xl font-bold font-serif mb-1">Sonu Kumar Gupta</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">sonu@example.com</p>
              <p className="mb-1">Senior at IOE Purwanchal Campus</p>
              <p className="mb-2">Bachelor of Computer Engineering</p>
              <p className="mb-2">Full-Stack Developer | AI/ML Enthusiast</p>
              <ul className="space-y-2 mt-4">
                <li className="flex items-center gap-2">
                  <FaLaptopCode className="text-blue-500" />
                  Front-End: React, Tailwind CSS, HTML, CSS, JavaScript
                </li>
                <li className="flex items-center gap-2">
                  <FaTools className="text-green-500" />
                  Back-End: Node.js, Express.js, MongoDB
                </li>
                <li className="flex items-center gap-2">
                  <FaBrain className="text-purple-500" />
                  AI/ML: Python, TensorFlow, Scikit-learn, NumPy, Pandas
                </li>
                <li className="flex items-center gap-2">
                  <FaTools className="text-yellow-500" />
                  Others: Git, REST APIs, Responsive Design, Performance Optimization
                </li>
              </ul>
              <div className="flex flex-wrap items-center gap-4 mt-6">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook className="text-blue-600 hover:scale-110 transition-transform" size={24} /></a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedin className="text-blue-500 hover:scale-110 transition-transform" size={24} /></a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram className="text-pink-500 hover:scale-110 transition-transform" size={24} /></a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer"><FaGithub className="hover:scale-110 transition-transform" size={24} /></a>
                <a href="https://portfolio-sonu.com" className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300 text-sm" target="_blank" rel="noopener noreferrer">Portfolio</a>
              </div>
            </div>
            <OptimizedImage
              src="/image_sonu.jpeg"
              alt="Sonu Kumar Gupta"
              className="w-66 h-66 rounded-2xl object-cover"
              maxWidth={400}
              maxHeight={400}
              quality={0.7}
            />
          </div>
        </motion.div>

        {/* Chandan */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md"
        >
          <div className="flex flex-col md:flex-row justify-between gap-10 items-center">
            <div className="md:w-3/4 text-left">
              <h2 className="text-3xl font-bold font-serif mb-1">Chandan Kumar Singh</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">chandan@example.com</p>
              <p className="mb-1">Flutter Developer | Electrical Engineering Student</p>
              <p className="mb-1">Bachelor of Electrical Engineering, 2nd Year</p>
              <p className="mb-4">IOE Purwanchal Campus, Dharan</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <FaMobileAlt className="text-teal-500" />
                  Expert in Flutter Mobile App Development
                </li>
                <li className="flex items-center gap-2">
                  🏆 Winner of XHACK Hackathon by CS50x, IOE Purwanchal Campus
                </li>
              </ul>
              <div className="flex flex-wrap items-center gap-4 mt-6">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook className="text-blue-600 hover:scale-110 transition-transform" size={24} /></a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedin className="text-blue-500 hover:scale-110 transition-transform" size={24} /></a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram className="text-pink-500 hover:scale-110 transition-transform" size={24} /></a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer"><FaGithub className="hover:scale-110 transition-transform" size={24} /></a>
                <a href="https://portfolio-chandan.com" className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300 text-sm" target="_blank" rel="noopener noreferrer">Portfolio</a>
              </div>
            </div>
            <OptimizedImage
              src="/image_chandan.png"
              alt="Chandan Kumar Singh"
              className="w-66 h-66 rounded-2xl object-cover transform translate-y-4"
              maxWidth={400}
              maxHeight={400}
              quality={0.7}
            />
          </div>
        </motion.div>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default AboutUs;
