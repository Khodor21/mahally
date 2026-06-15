// Localization for checkout page - 100% EN or 100% AR based on store language
export const checkoutTranslations = {
  en: {
    // Empty Cart
    emptyCartTitle: "Your cart is empty",
    emptyCartDesc: "Add products to continue checkout",
    continueShopping: "Continue Shopping",

    // Cart Items
    itemQty: "Qty",
    remove: "Remove",
    price: "Price",

    // Customer Info
    customerInfoTitle: "Customer Information",
    fullName: "Full Name",
    phoneNumber: "Phone Number",
    emailAddress: "Email Address",
    city: "City",
    fullAddress: "Full Address",
    orderNotes: "Order Notes (optional)",

    // Order Summary
    orderSummary: "Order Summary",
    discountCode: "Discount code",
    apply: "Apply",
    couponApplied: "Coupon applied",
    subtotal: "Subtotal",
    discount: "Discount",
    shipping: "Shipping",
    total: "Total",
    secureCheckout: "Secure checkout experience",
    completeCheckout: "Complete Checkout",
    processing: "Processing...",

    // Messages
    cartChanged: "Cart changed. Please re-apply your coupon.",
    couponSuccess: "Coupon applied successfully!",
    couponInvalid: "Invalid coupon",
    couponValidationFailed: "Failed to validate coupon",
    storeNotFound: "Store not found",
    checkoutFailed: "Checkout failed",
    somethingWentWrong: "Something went wrong",
  },

  ar: {
    // Empty Cart
    emptyCartTitle: "سلتك فارغة",
    emptyCartDesc: "أضف منتجات لمتابعة الدفع",
    continueShopping: "متابعة التسوق",

    // Cart Items
    itemQty: "الكمية",
    remove: "حذف",
    price: "السعر",

    // Customer Info
    customerInfoTitle: "معلومات العميل",
    fullName: "الاسم الكامل",
    phoneNumber: "رقم الهاتف",
    emailAddress: "عنوان البريد الإلكتروني",
    city: "المدينة",
    fullAddress: "العنوان الكامل",
    orderNotes: "ملاحظات الطلب (اختياري)",

    // Order Summary
    orderSummary: "ملخص الطلب",
    discountCode: "كود الخصم",
    apply: "تطبيق",
    couponApplied: "تم تطبيق القسيمة",
    subtotal: "المجموع الفرعي",
    discount: "الخصم",
    shipping: "الشحن",
    total: "الإجمالي",
    secureCheckout: "تجربة دفع آمنة",
    completeCheckout: "إتمام الدفع",
    processing: "جاري المعالجة...",

    // Messages
    cartChanged: "تم تغيير السلة. يرجى إعادة تطبيق قسيمتك.",
    couponSuccess: "تم تطبيق القسيمة بنجاح!",
    couponInvalid: "قسيمة غير صالحة",
    couponValidationFailed: "فشل التحقق من القسيمة",
    storeNotFound: "المتجر غير موجود",
    checkoutFailed: "فشل الدفع",
    somethingWentWrong: "حدث خطأ ما",
  },
};

export type Language = "en" | "ar";
