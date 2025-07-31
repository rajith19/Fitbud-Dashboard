"use client";

import { useState, useEffect } from "react";
import { useUserManagement } from "@/hooks/useUserManagement";
import { useUserStore } from "@/lib/userStore";
import { useSupabase } from "@/hooks/useSupabase";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { validateFullName, validateEmail } from "@/utils/validation";
import { handleError, handleSuccess } from "@/utils/errorHandling";
import type { UserProfile, UpdateUserData, FormErrors } from "@/types";
import Image from "next/image";

interface ExtendedFormData extends UpdateUserData {
  email?: string;
  phone?: string;
  bio?: string;
  location?: string;
  website?: string;
  social_links?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

interface BlockedUserInfo {
  id: string;
  blocker: {
    id: string;
    full_name: string;
    email: string;
  };
  reason: string;
  created_at: string;
}

export default function Profile() {
  const { user, roles } = useUserStore();
  const { supabase } = useSupabase();
  const { getCurrentUserProfile, updateCurrentUserProfile, loading } = useUserManagement();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<ExtendedFormData>({
    full_name: "",
    avatar_url: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    website: "",
    social_links: {
      facebook: "",
      twitter: "",
      linkedin: "",
      instagram: "",
    },
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isEditing, setIsEditing] = useState(false);
  const [blockedInfo, setBlockedInfo] = useState<BlockedUserInfo[]>([]);
  const [loadingBlocked, setLoadingBlocked] = useState(false);

  // Check if current user is blocked by anyone
  const checkBlockedStatus = async () => {
    if (!user) return;

    setLoadingBlocked(true);
    try {
      const { data, error } = await supabase
        .from("UserBlocksWithProfiles")
        .select("*")
        .eq("blocked.id", user.id);

      if (error) throw error;

      setBlockedInfo(data as unknown as BlockedUserInfo[]);
    } catch (error) {
      console.error("Failed to check blocked status:", error);
      handleError(error, "Failed to load blocked status");
    } finally {
      setLoadingBlocked(false);
    }
  };

  // Load user profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      const userProfile = await getCurrentUserProfile();
      if (userProfile) {
        setProfile(userProfile);
        setFormData({
          full_name: userProfile.full_name || "",
          avatar_url: userProfile.avatar_url || "",
          email: userProfile.email || "",
          phone: "",
          bio: "",
          location: "",
          website: "",
          social_links: {
            facebook: "",
            twitter: "",
            linkedin: "",
            instagram: "",
          },
        });
      }

      // Check blocked status
      await checkBlockedStatus();
    };

    loadProfile();
  }, [user, getCurrentUserProfile]);

  const handleInputChange = (field: keyof ExtendedFormData, value: string) => {
    if (field === "social_links") return; // Handle social links separately

    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationErrors: FormErrors = {};

    if (formData.full_name) {
      const nameError = validateFullName(formData.full_name);
      if (nameError) {
        validationErrors.full_name = nameError;
      }
    }

    if (formData.email) {
      const emailError = validateEmail(formData.email);
      if (emailError) {
        validationErrors.email = emailError;
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Only update fields that are part of the UserProfile
    const updateData: UpdateUserData = {
      full_name: formData.full_name,
      avatar_url: formData.avatar_url,
    };

    const success = await updateCurrentUserProfile(updateData);
    if (success) {
      setIsEditing(false);
      handleSuccess("Profile updated successfully");
      // Reload profile
      const updatedProfile = await getCurrentUserProfile();
      if (updatedProfile) {
        setProfile(updatedProfile);
      }
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        avatar_url: profile.avatar_url || "",
        email: profile.email || "",
        phone: "",
        bio: "",
        location: "",
        website: "",
        social_links: {
          facebook: "",
          twitter: "",
          linkedin: "",
          instagram: "",
        },
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Please sign in to view your profile
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Blocked Status Alert */}
      {blockedInfo.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Account Blocked
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>Your account has been blocked by the following users:</p>
                <ul className="mt-2 space-y-1">
                  {blockedInfo.map((block) => (
                    <li key={block.id} className="flex items-center justify-between">
                      <span>
                        <strong>{block.blocker.full_name}</strong> ({block.blocker.email})
                      </span>
                      <span className="text-xs">
                        {new Date(block.created_at).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 lg:p-8 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">User Profile</h1>
          {profile && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Profile
            </button>
          )}
        </div>

        {/* Enhanced Profile Form */}
        {isEditing && profile ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <Label>
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange("full_name", e.target.value)}
                    placeholder="Enter your full name"
                    className="mt-1"
                  />
                  {errors.full_name && (
                    <p className="mt-1 text-sm text-red-500">{errors.full_name}</p>
                  )}
                </div>

                <div>
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your.email@example.com"
                    className="mt-1"
                    disabled
                  />
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed here</p>
                </div>

                <div>
                  <Label>Avatar URL</Label>
                  <Input
                    type="url"
                    value={formData.avatar_url}
                    onChange={(e) => handleInputChange("avatar_url", e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="mt-1"
                  />
                  {errors.avatar_url && (
                    <p className="mt-1 text-sm text-red-500">{errors.avatar_url}</p>
                  )}
                </div>

                <div>
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="mt-1"
                  />
                </div>

                <div className="lg:col-span-2">
                  <Label>Bio</Label>
                  <Input
                    type="text"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Location</Label>
                  <Input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="City, Country"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Website</Label>
                  <Input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Social Links
              </h3>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <Label>Facebook</Label>
                  <Input
                    type="url"
                    value={formData.social_links?.facebook || ""}
                    onChange={(e) => handleSocialLinkChange("facebook", e.target.value)}
                    placeholder="https://facebook.com/username"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Twitter</Label>
                  <Input
                    type="url"
                    value={formData.social_links?.twitter || ""}
                    onChange={(e) => handleSocialLinkChange("twitter", e.target.value)}
                    placeholder="https://twitter.com/username"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>LinkedIn</Label>
                  <Input
                    type="url"
                    value={formData.social_links?.linkedin || ""}
                    onChange={(e) => handleSocialLinkChange("linkedin", e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Instagram</Label>
                  <Input
                    type="url"
                    value={formData.social_links?.instagram || ""}
                    onChange={(e) => handleSocialLinkChange("instagram", e.target.value)}
                    placeholder="https://instagram.com/username"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          /* Profile Display */
          <div className="space-y-8">
            {/* User Header */}
            <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start">
              <div className="relative">
                <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-gray-200 dark:border-gray-700">
                  {profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt="Profile"
                      width={96}
                      height={96}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                      <svg
                        className="h-12 w-12 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  )}
                </div>
                {/* Status Indicator */}
                <div className="absolute -right-1 -bottom-1 h-6 w-6 rounded-full border-2 border-white bg-green-400 dark:border-gray-800"></div>
              </div>

              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                  {profile?.full_name || "No name set"}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">{profile?.email}</p>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                    {roles[0] || "user"}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    {profile?.status || "active"}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Information Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Account Information
                </h3>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">User ID</p>
                    <p className="font-mono text-sm text-gray-800 dark:text-white/90">{user.id}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-sm text-gray-800 dark:text-white/90">{profile?.email}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</p>
                    <p className="text-sm text-gray-800 capitalize dark:text-white/90">
                      {roles.join(", ") || "user"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                    <p className="text-sm text-gray-800 capitalize dark:text-white/90">
                      {profile?.status || "active"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Member Since
                    </p>
                    <p className="text-sm text-gray-800 dark:text-white/90">
                      {profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString()
                        : "Unknown"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Profile Stats
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Profile Completion
                    </span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-white/90">
                      {Math.round(
                        (((profile?.full_name ? 1 : 0) + (profile?.avatar_url ? 1 : 0)) / 2) * 100
                      )}
                      %
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Blocked By
                    </span>
                    <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                      {loadingBlocked ? "Loading..." : blockedInfo.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Last Updated
                    </span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-white/90">
                      {profile?.updated_at
                        ? new Date(profile.updated_at).toLocaleDateString()
                        : "Never"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {(formData.bio || formData.location || formData.website) && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Additional Information
                </h3>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  {formData.bio && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Bio</p>
                      <p className="text-sm text-gray-800 dark:text-white/90">{formData.bio}</p>
                    </div>
                  )}

                  {formData.location && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Location
                      </p>
                      <p className="text-sm text-gray-800 dark:text-white/90">
                        {formData.location}
                      </p>
                    </div>
                  )}

                  {formData.website && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Website
                      </p>
                      <a
                        href={formData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {formData.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
