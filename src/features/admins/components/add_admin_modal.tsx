"use client";

import { useEffect, useState } from "react";
import { Modal, Button, PhoneField } from "@/components/ui";
import { TextField, PasswordField } from "@/components/ui/TextField";
import { CreateAdminPayload } from "../domain/data/response/admin_response";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateAdminPayload) => Promise<boolean>;
  isSubmitting: boolean;
}

const EMPTY = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

export function AddAdminModal({ open, onClose, onSubmit, isSubmitting }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(EMPTY);
      setError("");
    }
  }, [open]);

  async function handleSubmit() {
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    const ok = await onSubmit(form);
    if (ok) onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Add New Admin" size="md">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          label="First name"
          required
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
        />
        <TextField
          label="Last name"
          required
          value={form.lastName}
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
        />
        <TextField
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <PhoneField
          label="Phone"
          value={form.phone}
          onChange={(phone) => setForm({ ...form, phone })}
        />
        <PasswordField
          label="Password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <PasswordField
          label="Confirm password"
          required
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
        />
      </div>
      {error && <p className="text-sm text-[#E84D52] mt-3">{error}</p>}
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button loading={isSubmitting} onClick={handleSubmit}>
          Create admin
        </Button>
      </div>
    </Modal>
  );
}
