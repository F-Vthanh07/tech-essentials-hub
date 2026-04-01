import { useState, useEffect, useCallback } from "react";
import { accountService, ApiAccount } from "@/services/AccountService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Search, Loader2, Users, ShieldCheck, UserCog, User, Filter,
  Plus, KeyRound, CheckCircle2, Eye, EyeOff,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ROLE_OPTIONS = [
  { value: "all", label: "Tất cả vai trò", icon: Users },
  { value: "Admin", label: "Admin", icon: ShieldCheck },
  { value: "Staff", label: "Staff", icon: UserCog },
  { value: "User", label: "User", icon: User },
];

const getRoleBadge = (role: string) => {
  switch (role) {
    case "Admin":
      return (
        <Badge className="bg-gradient-to-r from-red-500 to-rose-600 text-white border-0 shadow-sm">
          <ShieldCheck className="h-3 w-3 mr-1" />
          Admin
        </Badge>
      );
    case "Staff":
      return (
        <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-sm">
          <UserCog className="h-3 w-3 mr-1" />
          Staff
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="border-emerald-500/50 text-emerald-600 dark:text-emerald-400">
          <User className="h-3 w-3 mr-1" />
          User
        </Badge>
      );
  }
};

const getStatusBadge = (isActive: boolean) => {
  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        Hoạt động
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
      <span className="h-2 w-2 rounded-full bg-red-400" />
      Bị khóa
    </span>
  );
};

// ============================
// Create Account Dialog
// ============================
type CreateStep = "form" | "otp" | "success";

interface CreateAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function CreateAccountDialog({ open, onOpenChange, onSuccess }: CreateAccountDialogProps) {
  const [step, setStep] = useState<CreateStep>("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState<"Staff" | "User">("Staff");

  // OTP
  const [otpCode, setOtpCode] = useState("");
  const [otpFromResponse, setOtpFromResponse] = useState("");

  const resetForm = () => {
    setStep("form");
    setUsername("");
    setEmail("");
    setPassword("");
    setPhoneNumber("");
    setRole("Staff");
    setOtpCode("");
    setOtpFromResponse("");
    setShowPassword(false);
    setIsSubmitting(false);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) resetForm();
    onOpenChange(isOpen);
  };

  // Step 1: Register account
  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim() || !phoneNumber.trim()) {
      toast({ title: "Lỗi", description: "Vui lòng điền đầy đủ thông tin", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await accountService.registerWithRole({
        username: username.trim(),
        passwordHash: password,
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        role,
      });

      // API returns something like "Account's OTP code :862189"
      const otpMatch = String(response).match(/(\d{4,8})\s*$/);
      if (otpMatch) {
        setOtpFromResponse(otpMatch[1]);
        setOtpCode(otpMatch[1]); // Auto-fill OTP for convenience
      }

      toast({ title: "Thành công", description: "Đã tạo tài khoản. Vui lòng xác nhận OTP." });
      setStep("otp");
    } catch (err: any) {
      console.error("Register failed:", err);
      toast({
        title: "Lỗi tạo tài khoản",
        description: err?.message || "Không thể tạo tài khoản",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) {
      toast({ title: "Lỗi", description: "Vui lòng nhập mã OTP", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await accountService.verifyOtp({
        email: email.trim(),
        otpCode: otpCode.trim(),
      });
      toast({ title: "Thành công", description: "Tài khoản đã được kích hoạt!" });
      setStep("success");
      onSuccess();
    } catch (err: any) {
      console.error("OTP verification failed:", err);
      toast({
        title: "Xác thực OTP thất bại",
        description: err?.message || "Mã OTP không hợp lệ",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 pt-2 pb-1">
          {[
            { key: "form", label: "Thông tin", icon: Plus },
            { key: "otp", label: "Xác thực OTP", icon: KeyRound },
            { key: "success", label: "Hoàn tất", icon: CheckCircle2 },
          ].map((s, i) => {
            const isActive = step === s.key;
            const isDone =
              (s.key === "form" && (step === "otp" || step === "success")) ||
              (s.key === "otp" && step === "success");
            return (
              <div key={s.key} className="flex items-center gap-2">
                {i > 0 && (
                  <div className={`h-px w-8 ${isDone || isActive ? "bg-primary" : "bg-muted-foreground/20"}`} />
                )}
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isDone
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <s.icon className="h-3.5 w-3.5" />
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* ===== STEP 1: Registration Form ===== */}
        {step === "form" && (
          <>
            <DialogHeader>
              <DialogTitle>Tạo tài khoản mới</DialogTitle>
              <DialogDescription>
                Điền thông tin để tạo tài khoản cho nhân viên
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="create-username">Tên người dùng *</Label>
                <Input
                  id="create-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="VD: staff_name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-email">Email *</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="VD: staff@gmail.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-password">Mật khẩu *</Label>
                <div className="relative">
                  <Input
                    id="create-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-phone">Số điện thoại *</Label>
                <Input
                  id="create-phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="VD: 0901234567"
                />
              </div>
              <div className="grid gap-2">
                <Label>Vai trò *</Label>
                <Select value={role} onValueChange={(v) => setRole(v as "Staff" | "User")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Staff">
                      <div className="flex items-center gap-2">
                        <UserCog className="h-3.5 w-3.5" />
                        Staff
                      </div>
                    </SelectItem>
                    <SelectItem value="User">
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5" />
                        User
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleClose(false)}>
                Hủy
              </Button>
              <Button onClick={handleRegister} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Tạo tài khoản
              </Button>
            </DialogFooter>
          </>
        )}

        {/* ===== STEP 2: OTP Verification ===== */}
        {step === "otp" && (
          <>
            <DialogHeader>
              <DialogTitle>Xác thực OTP</DialogTitle>
              <DialogDescription>
                Mã OTP đã được gửi. Nhập mã để kích hoạt tài khoản.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                <p className="text-sm text-muted-foreground">Tài khoản vừa tạo:</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <span className="text-muted-foreground">Tên:</span>
                  <span className="font-medium">{username}</span>
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{email}</span>
                  <span className="text-muted-foreground">Vai trò:</span>
                  <span className="font-medium">{role}</span>
                </div>
              </div>

              {otpFromResponse && (
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 flex items-center gap-3">
                  <KeyRound className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-primary">Mã OTP được trả về:</p>
                    <p className="text-lg font-bold tracking-widest text-primary">{otpFromResponse}</p>
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="otp-code">Nhập mã OTP *</Label>
                <Input
                  id="otp-code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Nhập mã OTP 6 số"
                  className="text-center text-lg tracking-[0.5em] font-mono"
                  maxLength={8}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleClose(false)}>
                Hủy
              </Button>
              <Button onClick={handleVerifyOtp} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Xác nhận & Kích hoạt
              </Button>
            </DialogFooter>
          </>
        )}

        {/* ===== STEP 3: Success ===== */}
        {step === "success" && (
          <>
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-lg font-semibold">Tạo tài khoản thành công!</h3>
                <p className="text-sm text-muted-foreground">
                  Tài khoản <span className="font-medium text-foreground">{username}</span> đã được
                  tạo và kích hoạt với vai trò <span className="font-medium text-foreground">{role}</span>.
                </p>
              </div>
              <div className="rounded-lg border bg-muted/50 p-4 w-full space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SĐT:</span>
                  <span className="font-medium">{phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vai trò:</span>
                  {getRoleBadge(role)}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => handleClose(false)} className="w-full">
                Đóng
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ============================
// Main Page
// ============================
const AdminUsers = () => {
  const [accounts, setAccounts] = useState<ApiAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await accountService.getAll();
      setAccounts(data);
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách tài khoản",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const filteredAccounts = accounts.filter((account) => {
    const matchSearch =
      account.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.phoneNumber.includes(searchQuery);
    const matchRole = roleFilter === "all" || account.role === roleFilter;
    return matchSearch && matchRole;
  });

  // Stats
  const totalActive = accounts.filter((a) => a.isActive).length;
  const totalAdmin = accounts.filter((a) => a.role === "Admin").length;
  const totalStaff = accounts.filter((a) => a.role === "Staff").length;
  const totalUser = accounts.filter((a) => a.role === "User").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Tài Khoản</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý tất cả người dùng trong hệ thống
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Tạo tài khoản
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{accounts.length}</p>
                <p className="text-xs text-muted-foreground">Tổng tài khoản</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <User className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalActive}</p>
                <p className="text-xs text-muted-foreground">Đang hoạt động</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <ShieldCheck className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalAdmin}</p>
                <p className="text-xs text-muted-foreground">Admin</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <UserCog className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStaff} / {totalUser}</p>
                <p className="text-xs text-muted-foreground">Staff / User</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader className="py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên, email, SĐT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Lọc theo vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <opt.icon className="h-3.5 w-3.5" />
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {filteredAccounts.length} kết quả
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Tên người dùng</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-12 text-muted-foreground"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Users className="h-10 w-10 text-muted-foreground/40" />
                          <p>Không tìm thấy tài khoản nào</p>
                          {(searchQuery || roleFilter !== "all") && (
                            <p className="text-xs">
                              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                            </p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAccounts.map((account, index) => (
                      <TableRow key={account.id} className="group">
                        <TableCell className="text-muted-foreground text-sm">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-sm font-semibold text-primary border border-primary/10">
                              {account.username.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium">{account.username}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {account.email}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {account.phoneNumber}
                        </TableCell>
                        <TableCell>{getRoleBadge(account.role)}</TableCell>
                        <TableCell>{getStatusBadge(account.isActive)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Account Dialog */}
      <CreateAccountDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={fetchAccounts}
      />
    </div>
  );
};

export default AdminUsers;
