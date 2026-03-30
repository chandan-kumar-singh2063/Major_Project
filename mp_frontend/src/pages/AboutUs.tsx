import { motion } from 'framer-motion';
import { FaLaptopCode, FaBrain, FaTools, FaFacebook, FaLinkedin, FaInstagram, FaGithub } from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OptimizedImage from '@/components/OptimizedImage';

const AboutUs = () => {
  const teamMembers = [
    {
      name: "Nigam Yadav",
      email: "yadavnigam72@gmail.com",
      role: "Flutter App Developer | Django Developer | DevOps Engineer",
      degree: "Bachelor in Computer Engineering",
      college: "IOE Purwanchal Campus",
      skills: [
        { icon: <FaLaptopCode className="text-blue-500" />, text: "Front-End: " },
        { icon: <FaTools className="text-green-500" />, text: "Back-End: " },
        { icon: <FaBrain className="text-purple-500" />, text: "AI/ML: " },
        { icon: <FaTools className="text-yellow-500" />, text: "Others: " },
      ],
      image: "",
      facebook: "https://www.facebook.com/nigam.yadav.9693",   // Nigam's Facebook link
      linkedin: "https://www.linkedin.com/in/nigamyadav72/",   // Nigam's LinkedIn link
      instagram: "https://www.instagram.com/nigamyadav72/",   // Nigam's Instagram link
      github: "https://github.com/nigamyadav72",   // Nigam's GitHub link
      portfolio: "https://nigamyadav.com.np",
      animationDir: -50,
    },
    {
      name: "Sagar Katuwal",
      email: "sagarkatuwal399@gmail.com",
      role: "Data Analyst | Frontend Developer",
      degree: "Bachelor in Computer Engineering",
      college: "IOE Purwanchal Campus",
      skills: [
        { icon: <FaLaptopCode className="text-blue-500" />, text: "Front-End: " },
        { icon: <FaTools className="text-green-500" />, text: "Back-End: " },
        { icon: <FaBrain className="text-purple-500" />, text: "AI/ML: " },
        { icon: <FaTools className="text-yellow-500" />, text: "Others: " },
      ],
      image: "",
      facebook: "https://www.facebook.com/sagar.katuwal.735",   // Sagar's Facebook link
      linkedin: "https://www.linkedin.com/in/sa-gar-53a8a8263/",   // Sagar's LinkedIn link
      instagram: "https://www.instagram.com/sagarkatuwal31/",   // Sagar's Instagram link
      github: "https://github.com/sagaro1",   // Sagar's GitHub link
      portfolio: "",
      animationDir: 50,
    },
    {
      name: "Sonu Kumar Gupta",
      email: "sonu@example.com",
      role: "Full-Stack Developer | AI/ML Enthusiast",
      degree: "Bachelor of Computer Engineering",
      college: "Senior at IOE Purwanchal Campus",
      skills: [
        { icon: <FaLaptopCode className="text-blue-500" />, text: "Front-End: React, Tailwind CSS, HTML, CSS, JavaScript" },
        { icon: <FaTools className="text-green-500" />, text: "Back-End: Node.js, Express.js, MongoDB" },
        { icon: <FaBrain className="text-purple-500" />, text: "AI/ML: Python, TensorFlow, Scikit-learn, NumPy, Pandas" },
        { icon: <FaTools className="text-yellow-500" />, text: "Others: Git, REST APIs, Responsive Design, Performance Optimization" },
      ],
      image: "",
      facebook: "https://www.facebook.com/sakxam.gupta.92",   // Sonu's Facebook link
      linkedin: "https://www.linkedin.com/in/sonu-gupta-681329340/",   // Sonu's LinkedIn link
      instagram: "https://www.instagram.com/___gupta___sonu",   // Sonu's Instagram link
      github: "https://github.com/creationsbysonu",   // Sonu's GitHub link
      portfolio: "https://www.guptasonu.com.np/",
      animationDir: -50,
    },
    {
      name: "Suvash Giri",
      email: "yubraj10841@gmail.com",
      role: "Django Developer",
      degree: "Bachelor in Computer Engineering",
      college: "IOE Purwanchal Campus",
      skills: [
        { icon: <FaLaptopCode className="text-blue-500" />, text: "Front-End: " },
        { icon: <FaTools className="text-green-500" />, text: "Back-End: " },
        { icon: <FaBrain className="text-purple-500" />, text: "AI/ML: " },
        { icon: <FaTools className="text-yellow-500" />, text: "Others: " },
      ],
      image: "",
      facebook: "https://www.facebook.com/subash.giri.37454961",   // Suvash's Facebook link
      linkedin: "https://www.linkedin.com/in/suvash-giri-3ab70233b/",   // Suvash's LinkedIn link
      instagram: "https://www.instagram.com/__suvashg/",   // Suvash's Instagram link
      github: "https://github.com/suvashg",   // Suvash's GitHub link
      portfolio: "",
      animationDir: 50,
    },
  ];

  return (
    <>
      <Navbar />
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

          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: member.animationDir }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md mb-10"
            >
              <div className="flex flex-col md:flex-row justify-between gap-10 items-center">
                <div className="md:w-3/4 text-left">
                  <h2 className="text-3xl font-bold font-serif mb-1">{member.name}</h2>
                  {member.email && <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{member.email}</p>}
                  {member.college && <p className="mb-1">{member.college}</p>}
                  {member.degree && <p className="mb-2">{member.degree}</p>}
                  {member.role && <p className="mb-2">{member.role}</p>}
                  <ul className="space-y-2 mt-4">
                    {member.skills.map((skill, i) => (
                      <li key={i} className="flex items-center gap-2">
                        {skill.icon}
                        {skill.text}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap items-center gap-4 mt-6">
                    <a href={member.facebook} target="_blank" rel="noopener noreferrer"><FaFacebook className="text-blue-600 hover:scale-110 transition-transform" size={24} /></a>
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer"><FaLinkedin className="text-blue-500 hover:scale-110 transition-transform" size={24} /></a>
                    <a href={member.instagram} target="_blank" rel="noopener noreferrer"><FaInstagram className="text-pink-500 hover:scale-110 transition-transform" size={24} /></a>
                    <a href={member.github} target="_blank" rel="noopener noreferrer"><FaGithub className="hover:scale-110 transition-transform" size={24} /></a>
                    {member.portfolio && (
                      <a href={member.portfolio} className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300 text-sm" target="_blank" rel="noopener noreferrer">Portfolio</a>
                    )}
                  </div>
                </div>
                {member.image && (
                  <OptimizedImage
                    src={member.image}
                    alt={member.name}
                    className="w-66 h-66 rounded-2xl object-cover"
                    maxWidth={400}
                    maxHeight={400}
                    quality={0.7}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AboutUs;