import { motion } from "framer-motion";

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const fallbackImage = "/img1.png";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
      className="group card flex flex-col h-full bg-white relative transition-shadow duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.productId || product.id}`} className="relative h-64 sm:h-80 w-full overflow-hidden block">
        <motion.div 
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative w-full h-full"
        >
          <Image
            src={product.images && product.images.length > 0 ? product.images[0] : fallbackImage}
            alt={product.name}
            fill
            className={`object-contain transition-all duration-700 ${imageLoaded ? 'blur-0 scale-100' : 'blur-xl scale-110'}`}
            onLoadingComplete={() => setImageLoaded(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </motion.div>
        {/* Quick view / Add to cart overlay on hover */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 transform transition-transform duration-300 z-20 ${isHovered ? 'translate-y-0' : 'translate-y-full'}`}>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.preventDefault();
              addItem(product);
            }}
            className="w-full bg-white/95 backdrop-blur text-[var(--color-text-main)] py-3 rounded-full font-medium hover:bg-[var(--color-primary)] hover:text-white transition-colors duration-300 shadow-md text-sm"
          >
            Add to Cart
          </motion.button>
        </div>
      </Link>
      
      <Link href={`/product/${product.productId || product.id}`} className="p-5 flex flex-col flex-grow">
        <div className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] mb-2 font-medium">
          {product.category}
        </div>
        <div className="flex items-center gap-1 mb-2 text-yellow-400">
          <Star size={12} fill="currentColor" />
          {(() => {
            const totalOrders = (product.baseOrderCount || 0) + (product.orderCount || 0);
            const displayCount = totalOrders > 999 ? (totalOrders / 1000).toFixed(1) + 'k+' : totalOrders;
            return <span className="text-[10px] text-gray-400 font-medium ml-1">5.0 <span className="text-gray-300 ml-1">({displayCount})</span></span>;
          })()}
        </div>
        <h3 className="font-sans text-lg text-[var(--color-text-main)] mb-2 line-clamp-1 group-hover:text-[var(--color-primary)] transition-colors">
          {product.name}
        </h3>
        <p className="mt-auto text-[var(--color-text-main)] font-medium">
          ₹{product.price.toLocaleString("en-IN")}
        </p>
      </Link>
    </motion.div>
  );
}
