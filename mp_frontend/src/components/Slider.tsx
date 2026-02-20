import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';

const highlightProducts = [
  {
    type: 'image',
    name: 'Ultra HD Smart TV',
    image: '/banner_photos/tv.png',
    price: '$799',
    tagline: 'Immersive viewing like never before',
    theme: 'from-[#0f172a] via-[#1e293b] to-[#334155]',
    accentColor: 'rgba(59, 130, 246, 0.5)'
  },
  {
    type: 'image',
    name: 'Wireless Earbuds Pro',
    image: '/banner_photos/earbuds.jpg',
    price: '$129',
    tagline: 'Freedom in every beat',
    theme: 'from-[#4c1d95] via-[#5b21b6] to-[#6d28d9]',
    accentColor: 'rgba(167, 139, 250, 0.5)'
  },
  {
    type: 'image',
    name: 'Gaming Laptop Demo',
    image: '/banner_photos/gaming_laptop.png',
    price: '$1199',
    tagline: 'Power meets performance',
    theme: 'from-[#450a0a] via-[#7f1d1d] to-[#991b1b]',
    accentColor: 'rgba(239, 68, 68, 0.5)'
  },
  {
    type: 'image',
    name: 'Smart Phones',
    image: '/banner_photos/phone.jpg',
    price: '$299',
    tagline: 'Experience the future in your hand',
    theme: 'from-[#064e3b] via-[#065f46] to-[#0f766e]',
    accentColor: 'rgba(16, 185, 129, 0.5)'
  },
  {
    type: 'image',
    name: 'Camera',
    image: '/banner_photos/camera.jpg',
    price: '$199',
    tagline: 'Camera that moves with you',
    theme: 'from-[#92400e] via-[#b45309] to-[#d97706]',
    accentColor: 'rgba(245, 158, 11, 0.5)'
  }
];

const DecorativeShapes = ({ color }: { color: string }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 90, 0],
        x: [0, 50, 0],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      className="absolute -top-20 -left-20 w-80 h-80 rounded-full blur-[100px]"
      style={{ backgroundColor: color }}
    />
    <motion.div
      animate={{
        scale: [1, 1.3, 1],
        rotate: [0, -45, 0],
        y: [0, 30, 0],
      }}
      transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
      className="absolute -bottom-40 -right-20 w-[30rem] h-[30rem] rounded-full blur-[120px]"
      style={{ backgroundColor: color }}
    />
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
  </div>
);

export default function Slider() {
  const [current, setCurrent] = useState(0);
  const [autoPlay] = useState(true);
  const sliderRef = useRef<any>(null);

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % highlightProducts.length);
    }, 6000);
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
      className="relative w-full h-[32rem] overflow-hidden bg-gray-950"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Arrows */}
      <div className="absolute top-1/2 left-6 z-30 -translate-y-1/2 hidden md:block">
        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,1)' }}
          whileTap={{ scale: 0.9 }}
          onClick={prevSlide}
          className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:text-black transition-all border border-white/10"
          aria-label="Previous"
        >
          <ChevronLeft size={28} />
        </motion.button>
      </div>
      <div className="absolute top-1/2 right-6 z-30 -translate-y-1/2 hidden md:block">
        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,1)' }}
          whileTap={{ scale: 0.9 }}
          onClick={nextSlide}
          className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:text-black transition-all border border-white/10"
          aria-label="Next"
        >
          <ChevronRight size={28} />
        </motion.button>
      </div>

      {/* Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className={`relative w-full h-full bg-gradient-to-br ${highlightProducts[current].theme} flex items-center justify-center overflow-hidden`}
        >
          <DecorativeShapes color={highlightProducts[current].accentColor} />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-8 md:px-20 w-full h-full max-w-7xl">
            {/* Image Section */}
            <div className="flex items-center justify-center h-full relative group">
              {/* Product Glow */}
              <motion.div
                layoutId="productGlow"
                className="absolute w-64 h-64 blur-[100px] rounded-full opacity-60"
                style={{ backgroundColor: highlightProducts[current].accentColor }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 4, repeat: Infinity }}
              />

              {highlightProducts[current].type === 'image' ? (
                <motion.img
                  src={highlightProducts[current].image}
                  alt={highlightProducts[current].name}
                  className="relative z-10 object-contain max-h-[22rem] md:max-h-[28rem] w-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                  initial={{ y: 20, opacity: 0, scale: 0.9 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, delay: 0.2, type: 'spring' }}
                />
              ) : (
                <motion.video
                  src={highlightProducts[current].image}
                  className="relative z-10 object-contain max-h-[22rem] md:max-h-[28rem] w-auto drop-shadow-2xl"
                  autoPlay
                  muted
                  loop
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                />
              )}
            </div>

            {/* Text Section */}
            <div className="flex flex-col justify-center text-white text-center md:text-left space-y-6">
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h2 className="text-4xl md:text-7xl font-black italic tracking-tighter leading-none mb-2 drop-shadow-lg">
                  {highlightProducts[current].name}
                </h2>
                {highlightProducts[current].tagline && (
                  <p className="text-xl md:text-2xl font-medium text-white/80 tracking-wide uppercase text-sm md:text-base">
                    {highlightProducts[current].tagline}
                  </p>
                )}
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-wrap items-center justify-center md:justify-start gap-4"
              >
                <div className="px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
                  <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                    {highlightProducts[current].price}
                  </span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 bg-white text-black font-black px-8 py-4 rounded-2xl shadow-2xl transition-all hover:bg-gray-100 uppercase tracking-tighter"
                >
                  <ShoppingCart size={20} />
                  Shop Now
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
        {highlightProducts.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className="group relative flex items-center justify-center w-12 h-2"
            aria-label={`Go to slide ${index + 1}`}
          >
            <div className={`h-full transition-all duration-500 rounded-full ${index === current
              ? 'w-10 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]'
              : 'w-4 bg-white/30 backdrop-blur-sm group-hover:bg-white/50'
              }`} />
          </button>
        ))}
      </div>


    </div>
  );
}