"use client";

import { DashboardLayout } from "@/components";
import { Button, PasswordField, TextField } from "@/components/ui";
import { useFormik } from "formik";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { AuthValidations } from "@/features/auth/validations/validations";
import { useAuthHooks } from "@/features/auth/data/hooks/auth.hooks";
import LoadingOverlay from "@/components/shared/loading_overlay";

export default function ProfilePage() {
  const user = useSelector((state: RootState) => state.user);
  const {
    isLoading,
    handleUpdateProfile,
    handleChangePassword,
    handleUploadImage,
  } = useAuthHooks();

  const profileForm = useFormik({
    enableReinitialize: true,
    initialValues: {
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
    },
    validationSchema: AuthValidations.profileValidationSchema,
    onSubmit: async (values) => {
      await handleUpdateProfile(values);
    },
  });

  const passwordForm = useFormik({
    initialValues: {
      oldPassword: "",
      newPassword: "",
      newPasswordConfirmation: "",
    },
    validationSchema: AuthValidations.passwordValidationSchema,
    onSubmit: async (values, helpers) => {
      const ok = await handleChangePassword(values);
      if (ok) helpers.resetForm();
    },
  });

  return (
    <DashboardLayout title="My Profile">
      {isLoading && <LoadingOverlay />}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-[#E7E9EB] p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-black text-white flex items-center justify-center text-3xl font-semibold overflow-hidden">
              {user.avatar ? (
                 
                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                (user.fullName || "A")[0]
              )}
            </div>
            <h2 className="mt-3 font-semibold">{user.fullName}</h2>
            <p className="text-sm text-[#717171]">{user.email}</p>
            <p className="text-xs text-[#717171] mt-1 capitalize">{user.userRole}</p>
            <label className="mt-4">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = await handleUploadImage(file);
                  if (url) await handleUpdateProfile({ picture: url });
                }}
              />
              <span className="inline-flex h-9 px-4 items-center rounded-lg border border-[#E7E9EB] text-sm cursor-pointer hover:bg-[#F7F7F7]">
                Update photo
              </span>
            </label>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-5">
          <form
            onSubmit={profileForm.handleSubmit}
            className="bg-white rounded-xl border border-[#E7E9EB] p-6 space-y-4"
          >
            <h3 className="font-semibold">Update profile</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <TextField
                name="firstName"
                label="First name"
                value={profileForm.values.firstName}
                onChange={profileForm.handleChange}
                error={profileForm.errors.firstName}
                touched={profileForm.touched.firstName}
              />
              <TextField
                name="lastName"
                label="Last name"
                value={profileForm.values.lastName}
                onChange={profileForm.handleChange}
                error={profileForm.errors.lastName}
                touched={profileForm.touched.lastName}
              />
            </div>
            <Button type="submit" loading={isLoading}>
              Save changes
            </Button>
          </form>

          <form
            onSubmit={passwordForm.handleSubmit}
            className="bg-white rounded-xl border border-[#E7E9EB] p-6 space-y-4"
          >
            <h3 className="font-semibold">Change password</h3>
            <PasswordField
              name="oldPassword"
              label="Current password"
              value={passwordForm.values.oldPassword}
              onChange={passwordForm.handleChange}
              error={passwordForm.errors.oldPassword}
              touched={passwordForm.touched.oldPassword}
            />
            <PasswordField
              name="newPassword"
              label="New password"
              value={passwordForm.values.newPassword}
              onChange={passwordForm.handleChange}
              error={passwordForm.errors.newPassword}
              touched={passwordForm.touched.newPassword}
            />
            <PasswordField
              name="newPasswordConfirmation"
              label="Confirm password"
              value={passwordForm.values.newPasswordConfirmation}
              onChange={passwordForm.handleChange}
              error={passwordForm.errors.newPasswordConfirmation}
              touched={passwordForm.touched.newPasswordConfirmation}
            />
            <Button type="submit" loading={isLoading}>
              Update password
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
