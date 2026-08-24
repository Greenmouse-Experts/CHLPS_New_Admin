"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserFromDB } from "../storage/user_db";
import { updateUser } from "@/features/auth/reducers/user_slice";
import { RootState } from "@/lib/store/store";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const existingToken = useSelector((state: RootState) => state.user.token);
  const [isLoading, setIsLoading] = useState(!existingToken);

  useEffect(() => {
    if (existingToken) {
      setIsLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const users = await getUserFromDB();
        const user = users?.[0];

        if (!user?.token) {
          router.replace("/auth/login");
          return;
        }

        dispatch(updateUser(user));
      } catch (error) {
        console.error("Auth check failed:", error);
        router.replace("/auth/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [dispatch, existingToken, router]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F7F7F7]">
        <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
