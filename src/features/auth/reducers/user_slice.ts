import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UserRole = "admin" | "sub-admin" | "instructor" | string;

export interface UserState {
  email?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  userRole?: UserRole | null;
  token?: string;
  userId?: string;
  loginAt?: string | null;
  phoneNumber?: string | null;
  avatar?: string | null;
  permissions?: string[];
}

const initialState: UserState = {
  fullName: "",
  firstName: "",
  lastName: "",
  email: "",
  userId: "",
  userRole: "",
  token: "",
  phoneNumber: "",
  avatar: "",
  loginAt: null,
  permissions: [],
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateUser: (state, action: PayloadAction<Partial<UserState>>) => {
      return { ...state, ...action.payload };
    },
    resetUser: () => initialState,
  },
});

export const { updateUser, resetUser } = userSlice.actions;
export default userSlice.reducer;
