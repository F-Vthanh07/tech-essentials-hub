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
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import OtpVerifyForm from "@/components/auth/OtpVerifyForm";

// helper to deal with backend responses and normalize to User type
const normalizeUser = (data: any): User | null => {
  if (!data) return null;

  let user: any = null;
  if (Array.isArray(data)) {
    for (const item of data) {
      if (item && typeof item === 'object' && (item.email || item.userName || item.name || item.id)) {
        user = item;
        break;
      }
    }
    if (!user) {
      const firstObj = data.find((i: any) => i && typeof i === 'object');
      user = firstObj || null;
    }
  } else if (typeof data === 'object') {
    user = data;
  }

  if (!user) return null;

  return {
    id: user.id || `temp_${Date.now()}`,
    email: user.email || '',
    name: user.userName || user.name || user.email?.split('@')[0] || 'User',
    phone: user.phone || user.phoneNumber || undefined,
    avatar: user.avatar || undefined,
    points: user.points || 0,
    membershipLevel: user.membershipLevel || 'bronze',
    totalSpent: user.totalSpent || 0,
    createdAt: user.createdAt || new Date().toISOString(),
    savedAddresses: user.savedAddresses || undefined,
  };
};

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { user: currentUser, setAuth } = useAuth();
  const [otpEmail, setOtpEmail] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // redirect to home if already authenticated
  useEffect(() => {
    if (currentUser) {
      navigate("/");
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

      let userData: User | null = null;
      let token: string | null = null;

      if (typeof resp === 'string' && resp.toLowerCase().includes('login success')) {
        const idMatch = resp.match(/ID\s*:\s*([a-f0-9\-]+)/i);
        const userId = idMatch ? idMatch[1] : `temp_${Date.now()}`;
        const tokenMatch = resp.match(/jwt\s*Key\s*:\s*(\S+)/i);
        token = tokenMatch ? tokenMatch[1] : null;

        userData = {
          id: userId, email, name: email.split('@')[0],
          points: 0, membershipLevel: 'bronze', totalSpent: 0,
          createdAt: new Date().toISOString(),
        };
      } else {
        const raw = resp?.user || resp;
        userData = normalizeUser(raw);
        token = resp?.token ?? null;
      }

      if (userData) {
        setAuth(userData, token);
        toast.success("Đăng nhập thành công!");
        navigate("/");
      } else {
        toast.error("Email hoặc mật khẩu không đúng");
      }
    } catch (err) {
      console.warn('API login failed', err);
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const passwords = JSON.parse(localStorage.getItem('passwords') || '{}');
      const foundUser = users.find((u: User) => u.email === email);

      if (foundUser && passwords[email] === password) {
        setAuth(foundUser, null);
        toast.success("Đăng nhập thành công!");
        navigate("/");
      } else {
        toast.error("Email hoặc mật khẩu không đúng");
      }
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
                {!otpEmail ? (
                  <RegisterForm onRegister={handleRegister} isLoading={isLoading} />
                ) : (
                  <OtpVerifyForm
                    email={otpEmail}
                    onVerify={handleVerifyOtp}
                    onResend={handleResendOtp}
                    isVerifying={isVerifyingOtp}
                  />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
