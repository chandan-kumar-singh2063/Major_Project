import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const highlightProducts = [
  {
    type: 'image',
    name: 'Ultra HD Smart TV',
    image: '/banner_photos/tv.png',
    price: '$799',
    tagline: 'Immersive viewing like never before',
    theme: 'from-blue-900 to-gray-900'
  },
  {
    type: 'image',
    name: 'Wireless Earbuds Pro',
    image: '/banner_photos/earbuds.jpg',
    price: '$129',
    tagline: 'Freedom in every beat',
    theme: 'from-purple-800 to-indigo-900'
  },
  {
    type: 'image',
    name: 'Gaming Laptop Demo',
    image: '/banner_photos/gaming_laptop.png',
    price: '$1199',
    tagline: 'Power meets performance',
    theme: 'from-red-900 to-black'
  },
  {
    type: 'image',
    name: 'Smart Phones',
    image: '/banner_photos/phone.jpg',
    price: '$299',
    tagline: 'Experience the future in your hand',
    theme: 'from-green-800 to-teal-900'
  },
  {
    type: 'image',
    name: 'Camera',
    image: '/banner_photos/camera.jpg',
    price: '$199',
    tagline: 'Camera that moves with you',
    theme: 'from-yellow-600 to-orange-700'
  }
];

export default function Slider() {
  const [current, setCurrent] = useState(0);
  const [autoPlay] = useState(true);
  const sliderRef = useRef<any>(null);

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % highlightProducts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoPlay]);

  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + highlightProducts.length) % highlightProducts.length);
  const nextSlide = () =>
    setCurrent((prev) => (prev + 1) % highlightProducts.length);

  const handleTouchStart = (e: any) =>
    (sliderRef.current.startX = e.touches[0].clientX);
  const handleTouchEnd = (e: any) => {
    if (!sliderRef.current.startX) return;
    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - sliderRef.current.startX;
    if (deltaX > 50) prevSlide();
    if (deltaX < -50) nextSlide();
    sliderRef.current.startX = null;
  };

  return (
    <div
      ref={sliderRef}
      className="relative w-full h-[24rem] overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Arrows */}
      <div className="absolute top-1/2 left-4 z-10 -translate-y-1/2">
        <button
          onClick={prevSlide}
          className="p-2 rounded-full bg-white/80 hover:bg-white text-black transition"
          aria-label="Previous"
        >
          <ChevronLeft size={24} />
        </button>
      </div>
      <div className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
        <button
          onClick={nextSlide}
          className="p-2 rounded-full bg-white/80 hover:bg-white text-black transition"
          aria-label="Next"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className={`w-full h-full bg-gradient-to-r ${highlightProducts[current].theme} flex items-center justify-center`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-8 md:px-20 w-full h-full max-w-screen-xl">
            {/* Image */}
            <div className="flex items-center justify-center h-full">
              {highlightProducts[current].type === 'image' ? (
                <motion.img
                  src={highlightProducts[current].image}
                  alt={highlightProducts[current].name}
                  className="object-contain max-h-[26rem] w-auto drop-shadow-2xl"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6 }}
                />
              ) : (
                <motion.video
                  src={highlightProducts[current].image}
                  className="object-contain max-h-[26rem] w-auto drop-shadow-2xl"
                  autoPlay
                  muted
                  loop
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6 }}
                />
              )}
            </div>

            {/* Text */}
            <motion.div
              className="text-white text-center md:text-left space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                {highlightProducts[current].name}
              </h2>
              {highlightProducts[current].tagline && (
                <p className="text-lg md:text-xl italic text-white/90">
                  {highlightProducts[current].tagline}
                </p>
              )}
              <motion.span
                className="inline-block bg-white text-black font-bold px-6 py-2 rounded-full shadow text-xl mt-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {highlightProducts[current].price}
              </motion.span>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {highlightProducts.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === current ? 'bg-white scale-125 shadow' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}