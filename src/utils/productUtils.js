/**
 * Helper to compute stock, variant fallback, and cart status for a product.
 * Returns: { isAlreadyInCart, isOutOfStock, availableVariant, buttonText, buttonState }
 */
export function getProductStockStatus(product, cartItems = []) {
  if (!product) {
    return { isAlreadyInCart: false, isOutOfStock: true, availableVariant: null };
  }

  const id = product._id || product.id || product.productID;

  // 1. Check if product is already in cart
  const isAlreadyInCart = Array.isArray(cartItems) && cartItems.some(
    (item) => (item._id || item.id || item.productID) === id
  );

  // 2. Check main inventory
  let mainStock = Number(product.inventory ?? 0);

  // 3. Check variants for fallback stock
  let availableVariant = null;

  if (product.variants && Array.isArray(product.variants)) {
    availableVariant = product.variants.find((v) => Number(v.inventory ?? 0) > 0);
  }

  if (!availableVariant && product.sizes && Array.isArray(product.sizes)) {
    availableVariant = product.sizes.find((s) => Number(s.inventory ?? 0) > 0);
  }

  if (!availableVariant && product.colorImages && Array.isArray(product.colorImages)) {
    availableVariant = product.colorImages.find((c) => Number(c.inventory ?? 0) > 0);
  }

  const isOutOfStock = mainStock <= 0 && !availableVariant;

  return {
    isAlreadyInCart,
    isOutOfStock,
    availableVariant,
    mainStock,
  };
}
