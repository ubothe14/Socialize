import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeOnboarding } from "../lib/api";
import { CameraIcon, LoaderIcon, ShuffleIcon, MessageCircleIcon } from "lucide-react";

const OnboardingPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    profilePic: authUser?.profilePic || "",
  });

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Profile set up successfully!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Something went wrong");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onboardingMutation(formState);
  };

  const handleRandomAvatar = () => {
    const idx = Math.floor(Math.random() * 70) + 1;
    const styles = ["avataaars", "fun-emoji", "bottts", "lorelei", "micah"];
    const style = styles[Math.floor(Math.random() * styles.length)];
    const randomAvatar = `https://api.dicebear.com/7.x/${style}/svg?seed=${idx}`;
    setFormState({ ...formState, profilePic: randomAvatar });
    toast.success("New avatar generated!");
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="card bg-base-200 w-full max-w-2xl shadow-xl">
        <div className="card-body p-6 sm:p-8">

          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <MessageCircleIcon className="size-7 text-primary" />
            <span className="text-2xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Socialize
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mb-1">Set Up Your Profile</h1>
          <p className="text-sm opacity-60 mb-6">Tell people a bit about yourself</p>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* AVATAR */}
            <div className="flex flex-col items-center gap-4">
              <div className="size-28 rounded-full bg-base-300 overflow-hidden border-4 border-primary/30 flex items-center justify-center">
                {formState.profilePic ? (
                  <img
                    src={formState.profilePic}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <CameraIcon className="size-12 text-base-content opacity-40" />
                )}
              </div>

              <button type="button" onClick={handleRandomAvatar} className="btn btn-accent btn-sm gap-2">
                <ShuffleIcon className="size-4" />
                Generate Random Avatar
              </button>
            </div>

            {/* FULL NAME */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Full Name</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formState.fullName}
                onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                className="input input-bordered w-full"
                placeholder="Your full name"
                required
              />
            </div>

            {/* BIO */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Bio <span className="opacity-50">(optional)</span></span>
              </label>
              <textarea
                name="bio"
                value={formState.bio}
                onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
                className="textarea textarea-bordered h-24 resize-none"
                placeholder="Tell others a bit about yourself..."
              />
            </div>

            {/* SUBMIT */}
            <button className="btn btn-primary w-full" disabled={isPending} type="submit">
              {!isPending ? (
                "Save & Continue"
              ) : (
                <><LoaderIcon className="animate-spin size-5 mr-2" />Saving...</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;