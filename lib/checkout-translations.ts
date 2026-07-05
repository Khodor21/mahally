export type Language = "ar" | "en";

export const checkoutTranslations: Record<Language, Record<string, string>> = {
  ar: {
    // Empty Cart
    emptyCartTitle: "سلتك فارغة",
    emptyCartDesc: "ابدأ التسوق وأضف بعض المنتجات إلى عربتك",
    continueShopping: "استكمل التسوق",

    // Cart Page
    cart: "منتجات السلة ",
    fillDetailsBelow: "املأ التفاصيل أدناه",
    products: "المنتجات",

    // Summary Labels
    subtotal: "المجموع الفرعي",
    shipping: "الشحن",
    discount: "الخصم",
    total: "الإجمالي",
    orderSummary: "ملخص الطلب",

    // Coupon
    discountCode: "هل تمتلك رمز خصم؟",
    apply: "تطبيق",
    couponApplied: "تم تطبيق الكوبون",
    couponSuccess: "تم تطبيق الكوبون بنجاح",
    couponInvalid: "رمز الخصم غير صحيح",
    couponValidationFailed: "فشل التحقق من الكوبون",
    cartChanged: "تم تغيير المحتويات - تم إزالة الكوبون",

    // Shipping Form
    shippingInfo: "معلومات التوصيل",
    customerInfoTitle: "بيانات العميل",
    fullName: "الاسم الكامل",
    phoneNumber: "رقم الهاتف",
    city: "المدينة",
    selectCity: "اختر المدينة",
    fullAddress: "العنوان الكامل",
    orderNotes: "ملاحظات الطلب",

    // Button Text
    processing: "جاري المعالجة...",
    completeCheckout: "إتمام الشراء",
    secureCheckout: "عملية شراء آمنة وموثوقة",

    // Error Messages
    storeNotFound: "المتجر غير موجود",
    checkoutFailed: "فشلت عملية الشراء",
    somethingWentWrong: "حدث خطأ ما",
  },
  en: {
    // Empty Cart
    emptyCartTitle: "Your cart is empty",
    emptyCartDesc: "Start shopping and add some products to your cart",
    continueShopping: "Continue Shopping",

    // Cart Page
    cart: "Shopping Cart",
    fillDetailsBelow: "Fill your details below",
    products: "Products",

    // Summary Labels
    subtotal: "Subtotal",
    shipping: "Shipping",
    discount: "Discount",
    total: "Total",
    orderSummary: "Order Summary",

    // Coupon
    discountCode: "Did you have a discount code?",
    apply: "Apply",
    couponApplied: "Coupon Applied",
    couponSuccess: "Coupon applied successfully",
    couponInvalid: "Invalid discount code",
    couponValidationFailed: "Failed to validate coupon",
    cartChanged: "Cart contents changed - coupon removed",

    // Shipping Form
    shippingInfo: "Shipping Information",
    customerInfoTitle: "Customer Information",
    fullName: "Full Name",
    phoneNumber: "Phone Number",
    city: "City",
    selectCity: "Select City",
    fullAddress: "Full Address",
    orderNotes: "Order Notes",

    // Button Text
    processing: "Processing...",
    completeCheckout: "Complete Checkout",
    secureCheckout: "Secure & trusted checkout",

    // Error Messages
    storeNotFound: "Store not found",
    checkoutFailed: "Checkout failed",
    somethingWentWrong: "Something went wrong",
  },
};
