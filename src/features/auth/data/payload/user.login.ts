export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  picture?: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
}
