import { useState } from "react";
import AuthenticationRepository from "../repository/auth_repository";
import { useDispatch } from "react-redux";
import {
  ChangePasswordPayload,
  LoginPayload,
  UpdateProfilePayload,
} from "../payload/user.login";
import { useRouter } from "next/navigation";
import { updateUser, UserState } from "../../reducers/user_slice";
import { saveUserToDB } from "@/lib/storage/user_db";
import { AppDispatch } from "@/lib/store/store";
import { useToast } from "@/components/ui";

export function useAuthHooks() {
  const { toast } = useToast();
  const authRepo = new AuthenticationRepository();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleLoginUser = async (data: LoginPayload) => {
    try {
      setIsLoading(true);
      const res = await authRepo.loginUser(data);
      if (res.success && res.data) {
        const { user, accessToken } = res.data;
        const userData: UserState = {
          userId: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
          userRole: user.role,
          token: accessToken,
          phoneNumber: user.phone ?? "",
          avatar: user.picture ?? "",
          loginAt: new Date().toISOString(),
        };
        dispatch(updateUser(userData));
        await saveUserToDB(userData);
        toast(res.message, "success");
        router.replace("/");
      } else {
        toast(res.message, "danger");
      }
    } catch (e) {
      console.error(e);
      toast("Sorry an error occurred", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (payload: UpdateProfilePayload) => {
    try {
      setIsLoading(true);
      const res = await authRepo.updateProfile(payload);
      if (res.success) {
        const userData: Partial<UserState> = {
          firstName: payload.firstName,
          lastName: payload.lastName,
          fullName: `${payload.firstName ?? ""} ${payload.lastName ?? ""}`.trim(),
          avatar: payload.picture,
        };
        dispatch(updateUser(userData));
        await saveUserToDB(userData);
        toast(res.message, "success");
        return true;
      }
      toast(res.message, "danger");
      return false;
    } catch (e) {
      console.error(e);
      toast("Sorry an error occurred", "danger");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (payload: ChangePasswordPayload) => {
    try {
      setIsLoading(true);
      const res = await authRepo.changePassword(payload);
      if (res.success) {
        toast(res.message, "success");
        return true;
      }
      toast(res.message, "danger");
      return false;
    } catch (e) {
      console.error(e);
      toast("Sorry an error occurred", "danger");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadImage = async (file: File) => {
    try {
      setIsLoading(true);
      const res = await authRepo.uploadImage(file);
      if (res.success && res.url) {
        return res.url;
      }
      toast(res.message, "danger");
      return null;
    } catch (e) {
      console.error(e);
      toast("Sorry an error occurred", "danger");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleLoginUser,
    handleUpdateProfile,
    handleChangePassword,
    handleUploadImage,
    isLoading,
    toast,
    router,
  };
}
