import { useState } from "react";
import { Link } from "react-router";
import useSignUp from "../hooks/useSignUp";
import { useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
import { MessageCircleIcon } from "lucide-react";

const SignUpPage = () => {
  const [signupData, setSignupData] = useState({ fullName: "", email: "", password: "" });
  const { isPending, error, signupMutation } = useSignUp();
  const queryClient = useQueryClient();

  const handleSignup = (e) => {
    e.preventDefault();
    signupMutation(signupData);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axiosInstance.post("/auth/google", {
        credential: credentialResponse.credential,
      });
      if (res.data.success) {
        toast.success(`Welcome to Socialize, ${res.data.user.fullName}!`);
        queryClient.invalidateQueries({ queryKey: ["authUser"] });
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Google sign-in failed");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8" data-theme="forest">
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">

        {/* SIGNUP FORM */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          {/* Logo */}
          <div className="mb-4 flex items-center justify-start gap-2">
            <MessageCircleIcon className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              Socialize
            </span>
          </div>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error.response?.data?.message || "Something went wrong"}</span>
            </div>
          )}

          <div className="w-full">
            <form onSubmit={handleSignup}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Create an Account</h2>
                  <p className="text-sm opacity-70">Join Socialize and start connecting!</p>
                </div>

                <div className="space-y-3">
                  {/* Full Name */}
                  <div className="form-control w-full">
                    <label className="label"><span className="label-text">Full Name</span></label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="input input-bordered w-full"
                      value={signupData.fullName}
                      onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="form-control w-full">
                    <label className="label"><span className="label-text">Email</span></label>
                    <input
                      type="email"
                      placeholder="john@gmail.com"
                      className="input input-bordered w-full"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="form-control w-full">
                    <label className="label"><span className="label-text">Password</span></label>
                    <input
                      type="password"
                      placeholder="Min. 6 characters"
                      className="input input-bordered w-full"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                    />
                    <p className="text-xs opacity-70 mt-1">Password must be at least 6 characters</p>
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-2">
                      <input type="checkbox" className="checkbox checkbox-sm" required />
                      <span className="text-xs leading-tight">
                        I agree to the{" "}
                        <span className="text-primary hover:underline">terms of service</span> and{" "}
                        <span className="text-primary hover:underline">privacy policy</span>
                      </span>
                    </label>
                  </div>
                </div>

                <button className="btn btn-primary w-full" type="submit" disabled={isPending}>
                  {isPending ? (
                    <><span className="loading loading-spinner loading-xs" />Creating account...</>
                  ) : "Create Account"}
                </button>

                {/* Divider */}
                <div className="divider text-xs opacity-50">OR</div>

                {/* Google Sign-Up */}
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error("Google sign-in failed")}
                    shape="rectangular"
                    size="large"
                    width="100%"
                    text="signup_with"
                  />
                </div>

                <div className="text-center mt-2">
                  <p className="text-sm">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary hover:underline">Sign in</Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT SIDE ILLUSTRATION */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-8 text-center space-y-6">
            <div className="relative aspect-square max-w-sm mx-auto">
              <img src="/i.png" alt="Connect with friends" className="w-full h-full" />
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Connect with friends worldwide</h2>
              <p className="opacity-70">Send messages, share moments, and stay connected</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SignUpPage;