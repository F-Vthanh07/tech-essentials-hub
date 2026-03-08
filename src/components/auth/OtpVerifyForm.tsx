import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OtpVerifyFormProps {
  email: string;
  onVerify: (otpCode: string) => Promise<void>;
  onResend: () => Promise<void>;
  isVerifying: boolean;
}

const OtpVerifyForm = ({ email, onVerify, onResend, isVerifying }: OtpVerifyFormProps) => {
  const [otpCode, setOtpCode] = useState("");
  const [resendCountdown, setResendCountdown] = useState(20);

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

  const handleResend = async () => {
    await onResend();
    setResendCountdown(20);
  };

  return (
    <div className="space-y-4">
      <div className="text-sm">
        Một mã OTP đã được gửi tới <strong>{email}</strong>. Nhập mã để xác thực.
      </div>
      <div className="space-y-2">
        <Label htmlFor="otp-code">Mã OTP</Label>
        <Input
          id="otp-code"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value)}
          placeholder="Nhập mã OTP"
        />
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => onVerify(otpCode)}
          className="flex-1"
          disabled={isVerifying || !otpCode}
        >
          Xác thực
        </Button>
        <Button
          variant="outline"
          disabled={resendCountdown > 0}
          onClick={handleResend}
        >
          {resendCountdown > 0 ? `Gửi lại (${resendCountdown}s)` : 'Gửi lại'}
        </Button>
      </div>
    </div>
  );
};

export default OtpVerifyForm;
