import { useEffect, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import api from "@/api/config";
import {
  X,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Minus,
  Plus,
} from "lucide-react";
import OptimizedImage from "./OptimizedImage";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartModal = ({ isOpen, onClose }: CartModalProps) => {
  const {
    cartItems,
    cartTotal,
    loading,
    refreshCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  } = useCart();

  const [isVisible, setIsVisible] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      refreshCart();
    } else {
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, refreshCart]);

  if (!isOpen && !isVisible) return null;

  // 🔥 CART CHECKOUT → KHALTI
  const handleCheckout = async () => {
    try {
      setCheckoutLoading(true);

      const response = await api.post("/payment/khalti/initiate/", {
        amount: Math.round(cartTotal * 100), // paisa
        name: "Cart Checkout",
        email: "customer@example.com",
      });

      const data = response.data;

      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        throw new Error(data?.message || "Payment failed");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to initiate payment");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0"
        }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden transform transition-all duration-200 ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
          }`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">Your Cart</h2>
            {cartItems.length > 0 && (
              <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                {cartItems.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto min-h-[200px]">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-40" />
              <h3 className="text-lg font-medium mb-2">
                Your cart is empty
              </h3>
              <button
                onClick={onClose}
                className="bg-primary text-white px-6 py-2 rounded-lg"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-600">
                    <OptimizedImage
                      src={item.product_image || "/placeholder.png"}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                      maxWidth={100}
                      maxHeight={100}
                      quality={0.6}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">
                      {item.product_name}
                    </h4>
                    <p className="text-primary font-bold">
                      ₹{item.product_price}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateCartItem(
                          item.id,
                          Math.max(1, item.quantity - 1)
                        )
                      }
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateCartItem(item.id, item.quantity + 1)
                      }
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <button onClick={() => removeFromCart(item.id)}>
                    <Trash2 className="text-red-500" size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        {cartItems.length > 0 && (
          <div className="border-t p-6">
            <div className="flex justify-between mb-4">
              <span className="font-semibold">Total:</span>
              <span className="text-2xl font-bold text-primary">
                ₹{cartTotal.toFixed(2)}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={clearCart}
                className="flex-1 border border-red-500 text-red-500 rounded-lg py-3"
              >
                Clear Cart
              </button>

              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="flex-1 bg-primary text-white rounded-lg py-3 flex items-center justify-center gap-2"
              >
                {checkoutLoading ? "Processing..." : "Checkout"}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
