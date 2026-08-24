"use client";

import { Button, PasswordField, TextField } from "@/components/ui";
import { AppImages } from "@/utils/assets/app_image";
import Image from "next/image";
import React from "react";
import { useAuthHooks } from "../data/hooks/auth.hooks";
import { useFormik } from "formik";
import { AuthValidations } from "../validations/validations";
import LoadingOverlay from "@/components/shared/loading_overlay";

const LoginPage: React.FC = () => {
  const { isLoading, handleLoginUser } = useAuthHooks();

  const formik = useFormik({
    initialValues: { password: "", email: "" },
    validationSchema: AuthValidations.loginValidationSchema,
    onSubmit: async (values) => {
      await handleLoginUser({ email: values.email, password: values.password });
    },
  });

  return (
    <div className="flex min-h-screen w-full">
      {isLoading && <LoadingOverlay />}
      <div className="hidden lg:flex lg:w-1/2 bg-[#F7F7F7] relative overflow-hidden flex-col justify-between p-12">
        <Image
          src={AppImages.logo}
          width={140}
          height={40}
          alt="CHLPS"
          style={{ width: "auto", height: "auto" }}
        />
        <div className="max-w-md">
          <h2 className="text-[32px] font-bold text-black leading-tight">
            Welcome Admin
          </h2>
          <p className="text-sm text-[#717171] mt-3">
            Sign in to manage programs, courses, students, and operations for
            CHLPS.
          </p>
        </div>
        <p className="text-xs text-[#717171]">CHLPS Admin</p>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-[440px]">
          <div className="mb-8 lg:hidden">
            <Image src={AppImages.logo} width={120} height={36} alt="CHLPS" style={{ width: "auto", height: "auto" }} />
          </div>
          <div className="mb-8">
            <h1 className="text-[24px] font-bold text-black mb-1.5">
              Welcome back to CHLPS
            </h1>
            <p className="text-sm text-[#717171]">
              Please enter your details to sign in.
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5">
            <TextField
              name="email"
              label="Email Address"
              type="email"
              placeholder="Enter your email..."
              required
              size="lg"
              className="h-[50px]"
              value={formik.values.email}
              error={formik.errors.email}
              touched={formik.touched.email}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
            />

            <PasswordField
              name="password"
              label="Password"
              placeholder="••••••••••••••"
              value={formik.values.password}
              error={formik.errors.password}
              touched={formik.touched.password}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              required
              size="lg"
              className="h-[50px]"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              className="mt-1 h-[50px]"
            >
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
