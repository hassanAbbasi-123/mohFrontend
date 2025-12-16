// app/(auth)/verify-otp/page.js (NEW FILE)
"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useVerifyOtpMutation, useResendVerificationOtpMutation } from "@/store/features/authApi";
import toast, { Toaster } from "react-hot-toast";

const VerifyOtpPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const userId = searchParams.get("userId");
  const email = searchParams.get("email");
  const role = searchParams.get("role");

  const [otp, setOtp] = useState("");
  const [isResending, setIsResending] = useState(false);

  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendOtp] = useResendVerificationOtpMutation();

  if (!userId || !email || !role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] text-white">
        <p>Invalid verification link.</p>
      </div>
    );
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit OTP");
      return;
    }

    try {
      const result = await verifyOtp({ userId, otp }).unwrap();

      // Save credentials
      if (typeof window !== "undefined") {
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result));
      }

      toast.success("Email verified successfully!");

      if (role === "seller") {
        toast.info("Your seller account is awaiting admin approval. You will be notified via email.");
        router.push("/login");
      } else {
        // Redirect based on role (same logic as login)
        if (role === "admin") {
          router.push("/admin/dashboard");
        } else if (role === "user") {
          router.push("/user/user-dash");
        } else {
          router.push("/login");
        }
      }
    } catch (err) {
      toast.error(err?.data?.message || "Invalid or expired OTP");
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendOtp({ email }).unwrap();
      toast.success("OTP resent to your email");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to resend OTP");
    }
    setIsResending(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#0f0f0f] text-white flex items-center justify-center">
      <Toaster position="top-center" />
      <div className="bg-[#1E1E1E] rounded-2xl p-8 md:p-12 shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">Verify Your Email</h2>
          <p className="text-gray-400 mt-2">
            We sent a 6-digit OTP to <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-sm mb-2 text-gray-300">Enter OTP</label>
            <input
              type="text"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="------"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isVerifying || otp.length !== 6}
            className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-[#A259FF] to-[#6A4CFF] hover:opacity-90 disabled:opacity-50"
          >
            {isVerifying ? "Verifying..." : "Verify"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Didn't receive the code?{" "}
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-purple-400 hover:underline"
            >
              {isResending ? "Resending..." : "Resend OTP"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;