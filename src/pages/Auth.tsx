import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authService } from "@/services/AuthService";
import { toast } from "sonner";
import { Eye, EyeOff, Gift, Loader2, ArrowLeft } from "lucide-react";
import { User } from "@/types/user";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user: currentUser, setAuth } = useAuth();

  // helper to deal with backend responses and normalize to User type
  const normalizeUser = (data: any): User | null => {
    if (!data) return null;
    
    let user: any = null;
    if (Array.isArray(data)) {
      // look for first object that smells like a user
      for (const item of data) {
        if (item && typeof item === 'object' && (item.email || item.userName || item.name || item.id)) {
          user = item;
          break;
        }
      }
      if (!user) {
        const firstObj = data.find((i) => i && typeof i === 'object');
        user = firstObj || null;
      }
    } else if (typeof data === 'object') {
      user = data;
    }
    
    if (!user) return null;
    
    // Map backend fields to User type
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
  
  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Register form
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  // OTP flow state
  const [otpEmail, setOtpEmail] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0); // seconds remaining before resend allowed

  // redirect to home if already authenticated
  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setIsLoading(true);

    try {
      const resp: any = await authService.login({
        email: loginEmail,
        password: loginPassword,
      });

      const raw = resp?.user || resp;
      const userData = normalizeUser(raw);
      if (userData) {
        setAuth(userData, resp.token ?? null);
        toast.success("Đăng nhập thành công!");
        navigate("/");
      } else {
        toast.error("Email hoặc mật khẩu không đúng");
      }
    } catch (err) {
      console.warn('API login failed', err);
      // Fallback: check localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const passwords = JSON.parse(localStorage.getItem('passwords') || '{}');
      const foundUser = users.find((u: User) => u.email === loginEmail);
      
      if (foundUser && passwords[loginEmail] === loginPassword) {
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerName || !registerEmail || !registerPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }

    if (registerPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setIsLoading(true);

    try {
      const resp: any = await authService.register({
        email: registerEmail,
        password: registerPassword,
        name: registerName,
        phone: registerPhone || undefined,
      });

      const raw = resp?.user || resp;
      const userData = normalizeUser(raw);

      // If backend returns a user object immediately, save & proceed
      if (userData) {
        if (resp.token) {
          localStorage.setItem('authToken', resp.token);
        }
        setAuth(userData, resp.token ?? null);
        toast.success("Đăng ký thành công! Bạn nhận được 100 điểm chào mừng 🎉");
        navigate("/");
      } else {
        // Assume backend sent OTP to email and returned a success message
        setOtpEmail(registerEmail);
        setResendCountdown(20);
        toast.success('Mã OTP đã được gửi tới email. Vui lòng kiểm tra và nhập mã.');
      }
    } catch (err) {
      console.warn('API register failed', err);
      // Fallback: check localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const existingUser = users.find((u: User) => u.email === registerEmail);
      
      if (existingUser) {
        toast.error("Email đã được sử dụng");
      } else {
        const newUser: User = {
          id: `user_${Date.now()}`,
          email: registerEmail,
          name: registerName,
          phone: registerPhone,
          points: 100,
          membershipLevel: 'bronze',
          totalSpent: 0,
          createdAt: new Date().toISOString(),
        };
        const passwords = JSON.parse(localStorage.getItem('passwords') || '{}');
        passwords[registerEmail] = registerPassword;
        localStorage.setItem('passwords', JSON.stringify(passwords));
        const history = JSON.parse(localStorage.getItem('pointsHistory') || '[]');
        history.push({
          id: `ph_${Date.now()}`,
          userId: newUser.id,
          type: 'earn',
          amount: 100,
          description: 'Điểm thưởng chào mừng thành viên mới',
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem('pointsHistory', JSON.stringify(history));
        setAuth(newUser, null);
        toast.success("Đăng ký thành công! Bạn nhận được 100 điểm chào mừng 🎉");
        navigate("/");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // start countdown effect when otpEmail set
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

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
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="email@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Mật khẩu</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Đăng nhập
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <div className="bg-primary/10 rounded-lg p-3 flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  <span className="text-sm">Đăng ký ngay để nhận <strong>100 điểm</strong> thưởng!</span>
                </div>
                {!otpEmail ? (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Họ và tên *</Label>
                      <Input
                        id="register-name"
                        placeholder="Nguyễn Văn A"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email *</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="email@example.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-phone">Số điện thoại</Label>
                      <Input
                        id="register-phone"
                        placeholder="0901234567"
                        value={registerPhone}
                        onChange={(e) => setRegisterPhone(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password">Mật khẩu *</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Tối thiểu 6 ký tự"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-confirm-password">Xác nhận mật khẩu *</Label>
                      <Input
                        id="register-confirm-password"
                        type="password"
                        placeholder="Nhập lại mật khẩu"
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Đăng ký
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="text-sm">Một mã OTP đã được gửi tới <strong>{otpEmail}</strong>. Nhập mã để xác thực.</div>
                    <div className="space-y-2">
                      <Label htmlFor="otp-code">Mã OTP</Label>
                      <Input id="otp-code" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={async () => {
                          if (!otpEmail) return;
                          setIsVerifyingOtp(true);
                          try {
                            const resp: any = await authService.verifyOtp({ email: otpEmail, otpCode: otpCode });
                            const userData = resp?.user || resp;
                            if (userData && typeof userData === 'object') {
                              if (resp.token) localStorage.setItem('authToken', resp.token);
                              const normalized = normalizeUser(userData);
                              if (normalized) {
                                setAuth(normalized, resp.token ?? null);
                                toast.success('Xác thực thành công, bạn đã đăng nhập.');
                                navigate('/');
                              } else {
                                // fallback
                                toast.success('Xác thực thành công. Vui lòng đăng nhập.');
                                setOtpEmail(null);
                                navigate('/auth');
                              }
                            } else {
                              toast.success('Xác thực thành công. Vui lòng đăng nhập.');
                              setOtpEmail(null);
                              navigate('/auth');
                            }
                          } catch (err) {
                            console.warn('verifyOtp error', err);
                            toast.error('Xác thực thất bại. Vui lòng thử lại.');
                          } finally {
                            setIsVerifyingOtp(false);
                          }
                        }}
                        className="flex-1"
                        disabled={isVerifyingOtp}
                      >
                        Xác thực
                      </Button>
                      <Button
                        variant="outline"
                        disabled={resendCountdown > 0}
                        onClick={async () => {
                          if (!otpEmail) return;
                          try {
                            await authService.resendOtp({ email: otpEmail });
                            toast.success('Mã OTP đã được gửi lại.');
                            setResendCountdown(20);
                          } catch (err) {
                            console.warn('resendOtp error', err);
                            toast.error('Không gửi được mã OTP.');
                          }
                        }}
                      >
                        {resendCountdown > 0 ? `Gửi lại (${resendCountdown}s)` : 'Gửi lại'}
                      </Button>
                    </div>
                  </div>
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
