import { useEffect, useState } from "react";

export type Customer = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  governorate: string;
  store_id: string;
};

export type AuthState = {
  customer: Customer | null;
  loading: boolean;
  error: string | null;
};

/**
 * Hook to fetch and manage customer authentication session
 * Automatically fills customer data if they're logged in
 */
export function useAuth(storeId?: string) {
  const [state, setState] = useState<AuthState>({
    customer: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!storeId) {
      setState({ customer: null, loading: false, error: null });
      return;
    }

    const fetchCustomer = async () => {
      try {
        const res = await fetch("/api/store-customers/me");
        const data = await res.json();

        if (data.success && data.customer) {
          const customer = data.customer;

          // Only use customer data if it belongs to this store
          if (customer.store_id === storeId) {
            setState({
              customer,
              loading: false,
              error: null,
            });
          } else {
            setState({
              customer: null,
              loading: false,
              error: null,
            });
          }
        } else {
          setState({
            customer: null,
            loading: false,
            error: null,
          });
        }
      } catch (err) {
        console.error("Failed to fetch customer session:", err);
        setState({
          customer: null,
          loading: false,
          error: "Failed to load customer data",
        });
      }
    };

    fetchCustomer();
  }, [storeId]);

  return state;
}

/**
 * Hook for customer signup (register new customer)
 */
export function useSignup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signup = async (payload: {
    storeId: string;
    firstName: string;
    lastName: string;
    phone: string;
    governorate: string;
    password: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/store-customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Signup failed");
        return { success: false, error: data.message };
      }

      return { success: true, customer: data.customer };
    } catch (err: any) {
      const message = err.message || "Signup failed";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading, error };
}

/**
 * Hook for customer login
 */
export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (payload: {
    storeId: string;
    phone: string;
    password: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/store-customers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Login failed");
        return { success: false, error: data.message };
      }

      return { success: true, customer: data.customer };
    } catch (err: any) {
      const message = err.message || "Login failed";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}

/**
 * Hook for customer logout
 */
export function useLogout() {
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);

    try {
      await fetch("/api/store-customers/logout", {
        method: "POST",
      });

      // Optionally refresh the page or redirect
      return { success: true };
    } catch (err) {
      console.error("Logout failed:", err);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return { logout, loading };
}
