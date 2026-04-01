import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authService } from "@/services/AuthService";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { User } from "@/types/user";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import OtpVerifyForm from "@/components/auth/OtpVerifyForm";
import { cartService } from "@/services/CartService";

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { user: currentUser, setAuth } = useAuth();
  const { loadCartFromBackend } = useCart();
  const [otpEmail, setOtpEmail] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // redirect to home if already authenticated
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === "Admin") navigate("/admin", { replace: true });
      else if (currentUser.role === "Staff") navigate("/staff", { replace: true });
      else navigate("/", { replace: true });
    }
  }, [currentUser, navigate]);

  const handleLogin = async (email: string, password: string) => {
    if (!email || !password) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setIsLoading(true);
    try {
      const resp: any = await authService.login({ email, password });

      // New API response: { id, token, email, role }
      const userData: User = {
        id: resp.id || `temp_${Date.now()}`,
        email: resp.email || email,
        name: (resp.email || email).split('@')[0],
        role: resp.role ?? undefined,
        points: 0,
        membershipLevel: 'bronze',
        totalSpent: 0,
        createdAt: new Date().toISOString(),
      };
      const token: string | null = resp.token ?? null;

      setAuth(userData, token);

      await createAndLoadCart();

      toast.success("Đăng nhập thành công!");
      if (resp.role === 'Admin') navigate('/admin');
      else if (resp.role === 'Staff') navigate('/staff');
      else navigate('/');
    } catch (err) {
      console.warn('API login failed', err);
      toast.error("Email hoặc mật khẩu không đúng");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: { name: string; email: string; phone: string; password: string }) => {
    if (!data.name || !data.email || !data.password) {
      toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }
    if (data.password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setIsLoading(true);
    try {
      const resp: any = await authService.register({
        email: data.email, password: data.password,
        name: data.name, phone: data.phone || undefined,
      });

      const raw = resp?.user || resp;
      const userData = normalizeUser(raw);

      if (userData) {
        if (resp.token) localStorage.setItem('authToken', resp.token);
        setAuth(userData, resp.token ?? null);

        await createAndLoadCart();

        toast.success("Đăng ký thành công! Bạn nhận được 100 điểm chào mừng 🎉");
        navigate("/");
      } else {
        setOtpEmail(data.email);
        toast.success('Mã OTP đã được gửi tới email. Vui lòng kiểm tra và nhập mã.');
      }
    } catch (err) {
      console.warn('API register failed', err);
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const existingUser = users.find((u: User) => u.email === data.email);

      if (existingUser) {
        toast.error("Email đã được sử dụng");
      } else {
        const newUser: User = {
          id: `user_${Date.now()}`, email: data.email, name: data.name,
          phone: data.phone, points: 100, membershipLevel: 'bronze',
          totalSpent: 0, createdAt: new Date().toISOString(),
        };
        const passwords = JSON.parse(localStorage.getItem('passwords') || '{}');
        passwords[data.email] = data.password;
        localStorage.setItem('passwords', JSON.stringify(passwords));
        setAuth(newUser, null);
        toast.success("Đăng ký thành công! Bạn nhận được 100 điểm chào mừng 🎉");
        navigate("/");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (otpCode: string) => {
    if (!otpEmail) return;
    setIsVerifyingOtp(true);
    try {
      const resp: any = await authService.verifyOtp({ email: otpEmail, otpCode });
      const userData = resp?.user || resp;
      if (userData && typeof userData === 'object') {
        if (resp.token) localStorage.setItem('authToken', resp.token);
        const normalized = normalizeUser(userData);
        if (normalized) {
          setAuth(normalized, resp.token ?? null);

          await createAndLoadCart();

          toast.success('Xác thực thành công, bạn đã đăng nhập.');
          navigate('/');
        } else {
          toast.success('Xác thực thành công. Vui lòng đăng nhập.');
          setOtpEmail(null);
        }
      } else {
        toast.success('Xác thực thành công. Vui lòng đăng nhập.');
        setOtpEmail(null);
      }
    } catch (err) {
      console.warn('verifyOtp error', err);
      toast.error('Xác thực thất bại. Vui lòng thử lại.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (!otpEmail) return;
    try {
      await authService.resendOtp({ email: otpEmail });
      toast.success('Mã OTP đã được gửi lại.');
    } catch (err) {
      console.warn('resendOtp error', err);
      toast.error('Không gửi được mã OTP.');
    }
  };

  /**
   * Helper to create and load cart after successful auth
   */
  const createAndLoadCart = async () => {
    try {
      const createdCart = await cartService.createCart();
      if (createdCart?.id) {
        localStorage.setItem("cartId", createdCart.id);
        try {
          await loadCartFromBackend();
        } catch (loadErr) {
          console.warn("load cart items after cart creation failed", loadErr);
        }
      }
    } catch (cartErr) {
      console.warn("create cart after auth failed", cartErr);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Quay lại trang chủ
          </Button>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground font-bold text-3xl">T</span>
            </div>
            <CardTitle className="text-2xl">Chào mừng đến TechStore</CardTitle>
            <CardDescription>Đăng nhập hoặc tạo tài khoản mới</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Đăng nhập</TabsTrigger>
                <TabsTrigger value="register">Đăng ký</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <LoginForm onLogin={handleLogin} isLoading={isLoading} />
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                {otpEmail ? (
                  <OtpVerifyForm
                    email={otpEmail}
                    onVerify={handleVerifyOtp}
                    onResend={handleResendOtp}
                    isVerifying={isVerifyingOtp}
                  />
                ) : (
                  <RegisterForm onRegister={handleRegister} isLoading={isLoading} />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

/**
 * Helper function to normalize user data from API response
 */
function normalizeUser(data: any): User | null {
  if (!data || typeof data !== 'object') return null;
  
  return {
    id: data.id || `temp_${Date.now()}`,
    email: data.email || '',
    name: data.name || data.email?.split('@')[0] || 'User',
    role: data.role,
    points: data.points ?? 0,
    membershipLevel: data.membershipLevel ?? 'bronze',
    totalSpent: data.totalSpent ?? 0,
    createdAt: data.createdAt ?? new Date().toISOString(),
    phone: data.phone,
  };
}

export default Auth;
