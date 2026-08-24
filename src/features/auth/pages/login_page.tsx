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
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden items-center justify-center px-12">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 800 900"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
        >
          <circle cx="40" cy="860" r="420" fill="#2E2878" />
          <rect
            x="560"
            y="20"
            width="240"
            height="150"
            rx="6"
            fill="#2E2878"
            transform="rotate(32 680 95)"
          />
          <rect
            x="30"
            y="390"
            width="100"
            height="100"
            fill="#35308A"
            transform="rotate(45 80 440)"
          />
          <polygon points="800,360 800,530 680,445" fill="#2E2878" />
          <rect
            x="540"
            y="700"
            width="200"
            height="120"
            rx="4"
            fill="#35308A"
            transform="rotate(-22 640 760)"
          />
          <circle cx="720" cy="240" r="18" fill="#35308A" />
        </svg>

        <div className="relative z-10 flex flex-col items-center text-center max-w-md gap-10">
          <Image
            src={AppImages.fullLogo}
            width={320}
            height={110}
            alt="CHLPS"
            className="w-[280px] h-auto object-contain"
            priority
          />
          <div>
            <h2 className="text-[32px] font-bold text-white leading-tight">
              Welcome Admin!
            </h2>
            <p className="text-base text-white/80 mt-4 leading-relaxed">
              Sign in to manage programs, courses, students, and operations for
              CHLPS.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-[440px]">
          <div className="mb-8 lg:hidden">
            <Image src={AppImages.fullLogo} width={180} height={60} alt="CHLPS" className="w-[180px] h-auto" />
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
