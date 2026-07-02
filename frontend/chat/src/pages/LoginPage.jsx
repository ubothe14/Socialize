import { useState } from "react";
import { Link } from "react-router";
import useLogin from "../hooks/useLogin";
import { useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
import { MessageCircleIcon } from "lucide-react";

const LoginPage = () => {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const { isPending, error, loginMutation } = useLogin();
  const queryClient = useQueryClient();

  const handleLogin = (e) => {
    e.preventDefault();
    loginMutation(loginData);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axiosInstance.post("/auth/google", {
        credential: credentialResponse.credential,
      });
      if (res.data.success) {
        toast.success(`Welcome, ${res.data.user.fullName}!`);
        queryClient.invalidateQueries({ queryKey: ["authUser"] });
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Google sign-in failed");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8" data-theme="forest">
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">

        {/* LOGIN FORM */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          {/* Logo */}
          <div className="mb-6 flex items-center justify-start gap-2">
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
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Welcome Back</h2>
                  <p className="text-sm opacity-70">Sign in to continue chatting</p>
                </div>

                <div className="flex flex-col gap-3">
                  {/* Email */}
                  <div className="form-control w-full">
                    <label className="label"><span className="label-text">Email</span></label>
                    <input
                      type="email"
                      placeholder="hello@example.com"
                      className="input input-bordered w-full"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="form-control w-full">
                    <label className="label"><span className="label-text">Password</span></label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="input input-bordered w-full"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary w-full" disabled={isPending}>
                    {isPending ? (
                      <><span className="loading loading-spinner loading-xs" />Signing in...</>
                    ) : "Sign In"}
                  </button>
                </div>
              </div>
            </form>

            {/* Divider */}
            <div className="divider text-xs opacity-50 mt-4">OR</div>

            {/* Google Sign-In */}
            <div className="flex justify-center mb-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error("Google sign-in failed")}
                shape="rectangular"
                size="large"
                width="100%"
                text="signin_with"
              />
            </div>

            <div className="text-center mt-2">
              <p className="text-sm">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:underline">Create one</Link>
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE ILLUSTRATION */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-8 text-center space-y-6">
            <div className="relative aspect-square max-w-sm mx-auto">
              <img src="/i.png" alt="Chat illustration" className="w-full h-full" />
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

export default LoginPage;