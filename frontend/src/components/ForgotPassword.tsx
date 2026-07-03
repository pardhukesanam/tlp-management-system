import { useState } from "react";
import { api } from "../api/client";

interface Props {
  onBack: () => void;
}

export default function ForgotPassword({
  onBack,
}: Props) {
  const [step, setStep] = useState(1);

  const [email, setEmail] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const sendOtp = async () => {
    try {
      setLoading(true);

      await api.post(
        "/auth/forgot-password",
        { email }
      );

      setStep(2);

      setMessage(
        "OTP sent successfully."
      );

    } catch (err: any) {

      alert(
        err.response?.data?.message ??
        "Unable to send OTP"
      );

    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {

      setLoading(true);

      await api.post(
        "/auth/verify-otp",
        {
          email,
          otp,
        }
      );

      setStep(3);

    } catch (err: any) {

      alert(
        err.response?.data?.message ??
        "Invalid OTP"
      );

    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    try {

      setLoading(true);

      await api.post(
        "/auth/reset-password",
        {
          email,
          otp,
          newPassword,
        }
      );

      alert(
        "Password reset successful."
      );

      onBack();

    } catch (err: any) {

      alert(
        err.response?.data?.message ??
        "Unable to reset password"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#121212]">
      <div className="bg-[#1e1e1e] border border-[#30363d] rounded-xl p-8 w-[420px]">

        <h2 className="text-xl font-bold text-white mb-6">
          Forgot Password
        </h2>

        {step === 1 && (
          <>
            <input
              className="w-full p-3 rounded bg-[#121212] border border-[#30363d] mb-4"
              placeholder="Company Email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
            />

            <button
              onClick={sendOtp}
              disabled={loading}
              className="w-full bg-blue-600 rounded p-3"
            >
              Send OTP
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-green-400 mb-4">
              {message}
            </p>

            <input
              className="w-full p-3 rounded bg-[#121212] border border-[#30363d] mb-4"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value
                )
              }
            />

            <button
              onClick={verifyOtp}
              disabled={loading}
              className="w-full bg-blue-600 rounded p-3"
            >
              Verify OTP
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <input
              className="w-full p-3 rounded bg-[#121212] border border-[#30363d] mb-4"
              placeholder="New Password"
              type="password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(
                  e.target.value
                )
              }
            />

            <button
              onClick={resetPassword}
              disabled={loading}
              className="w-full bg-green-600 rounded p-3"
            >
              Reset Password
            </button>
          </>
        )}

        <button
          onClick={onBack}
          className="mt-5 text-sm text-gray-400 hover:underline"
        >
          ← Back to Login
        </button>

      </div>
    </div>
  );
}