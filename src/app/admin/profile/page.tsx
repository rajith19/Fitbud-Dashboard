"use client";

import { useState, useEffect } from "react";
import { useUserManagement } from "@/hooks/useUserManagement";
import { useUserStore } from "@/lib/userStore";
import UserAddressCard from "@/components/user-profile/UserAddressCard";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { validateFullName } from "@/utils/validation";
import type { UserProfile, UpdateUserData, FormErrors } from "@/types";

export default function Profile() {
  const { user } = useUserStore();
  const { getCurrentUserProfile, updateCurrentUserProfile, loading } = useUserManagement();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<UpdateUserData>({
    full_name: "",
    avatar_url: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isEditing, setIsEditing] = useState(false);

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
        });
      }
    };

    loadProfile();
  }, [user, getCurrentUserProfile]);

  const handleInputChange = (field: keyof UpdateUserData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
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

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const success = await updateCurrentUserProfile(formData);
    if (success) {
      setIsEditing(false);
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
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-5 flex items-center justify-between lg:mb-7">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Profile</h3>
          {profile && !isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              size="sm"
              className="bg-blue-500 hover:bg-blue-600"
            >
              Edit Profile
            </Button>
          )}
        </div>

        {/* Enhanced Profile Form */}
        {isEditing && profile ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                placeholder="Enter your full name"
              />
              {errors.full_name && <p className="mt-1 text-sm text-red-500">{errors.full_name}</p>}
            </div>

            <div>
              <Label>Avatar URL</Label>
              <Input
                type="url"
                value={formData.avatar_url}
                onChange={(e) => handleInputChange("avatar_url", e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
              {errors.avatar_url && (
                <p className="mt-1 text-sm text-red-500">{errors.avatar_url}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="bg-green-500 hover:bg-green-600">
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="bg-gray-500 hover:bg-gray-600"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <UserMetaCard />
            <UserInfoCard />
            <UserAddressCard />
          </div>
        )}
      </div>
    </div>
  );
}
