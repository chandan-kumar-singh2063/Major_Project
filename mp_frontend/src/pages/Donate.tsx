import React, { useState } from "react";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import OptimizedImage from "@/components/OptimizedImage";

export default function Donate() {
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [method, setMethod] = useState("Esewa");
  const [suggestion, setSuggestion] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Thank you for donating NPR ${amount} via ${method}!\n\nSuggestion: ${suggestion}`);
    // Here you could send file & form data to backend if needed
  };

  const qrCodes: Record<string, string> = {
    Esewa: "/qrs/esewa.png",
    Khalti: "/qrs/khalti.png",
    Fonepay: "/qrs/fonepay.png",
    "Bank Transfer": "/qrs/bank.png",
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-sky-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 transition-all duration-300 px-4 py-24 text-gray-800 dark:text-gray-100">
        <div className="max-w-3xl mx-auto">

          {/* Heading */}
          <motion.h1
            className="text-4xl font-bold text-center mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Support Our Work 💖
          </motion.h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-10">
            Your contribution helps us improve the Nepali Stutter Detection System and reach more people.
          </p>

          {/* Receiver Info */}
          <motion.div
            className="bg-white dark:bg-zinc-800 shadow-lg rounded-2xl p-6 mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-semibold mb-3">Receiver Information</h2>
            <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li><strong>Name:</strong> ABCD EFGH</li>
              <li><strong>Organization:</strong> SMART BOLI - Nepali Stutter Detection System</li>
              <li><strong>Contact:</strong> +977-98XXXXXXXX</li>
              <li><strong>Email:</strong> smartboli@support.com</li>
              <li><strong>Address:</strong> Dharan, Nepal</li>
            </ul>
          </motion.div>

          {/* QR Display */}
          <motion.div
            className="bg-white dark:bg-zinc-800 shadow-lg rounded-2xl p-6 mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-semibold mb-4">Scan & Pay</h2>
            <div className="flex flex-wrap justify-center gap-6">
              {Object.entries(qrCodes).map(([label, src]) => (
                <div key={label} className="text-center">
                  <OptimizedImage
                    src={src}
                    alt={`${label} QR`}
                    className="w-36 h-36 rounded-lg object-contain shadow-md border border-gray-200 dark:border-zinc-700"
                    maxWidth={150}
                    maxHeight={150}
                    quality={0.8}
                  />
                  <p className="mt-2 text-sm">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Donation Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-zinc-800 shadow-xl rounded-2xl p-6 space-y-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium mb-1">Donation Amount (NPR)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-4 py-2 rounded border border-gray-300 dark:border-zinc-600 bg-gray-100 dark:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter amount"
              />
            <div>
              <label className="block text-sm font-medium mb-1 mt-5">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 rounded border border-gray-300 dark:border-zinc-600 bg-gray-100 dark:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your Name"
              />
            </div>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Mobile Number</label>
              <input
                type="number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
                className="w-full px-4 py-2 rounded border border-gray-300 dark:border-zinc-600 bg-gray-100 dark:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your mobile number"
              />
              
            </div>

            {/* Method */}
            <div>
              <label className="block text-sm font-medium mb-1">Payment Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-4 py-2 rounded border border-gray-300 dark:border-zinc-600 bg-gray-100 dark:bg-zinc-700"
              >
                {Object.keys(qrCodes).map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium mb-1">Upload Payment Proof (Screenshot, PDF, etc.)</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-zinc-600 bg-gray-100 dark:bg-zinc-700"
              />
              {file && <p className="text-xs mt-1 text-green-600 dark:text-green-400">✔ {file.name}</p>}
            </div>

            {/* Suggestion */}
            <div>
              <label className="block text-sm font-medium mb-1">Suggestions (optional)</label>
              <textarea
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                rows={4}
                placeholder="Your feedback or note..."
                className="w-full px-4 py-2 rounded border border-gray-300 dark:border-zinc-600 bg-gray-100 dark:bg-zinc-700"
              />
            </div>

            {/* Donate Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-2 rounded-full bg-gradient-to-r from-sky-500 to-fuchsia-500 text-white font-semibold text-lg shadow-md hover:from-sky-600 hover:to-fuchsia-600 transition-all"
            >
              Donate Now
            </motion.button>
          </motion.form>
        </div>
      </div>
      <Footer />
    </>
  );
}
