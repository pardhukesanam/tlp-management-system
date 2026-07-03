import { useState } from "react";
import { api } from "../api/client";

interface Props {
  onSuccess: () => void;
}

export default function ChangePassword({
  onSuccess,
}: Props) {
  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] = useState("");

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      localStorage.setItem(
        "mustChangePassword",
        "false"
      );

      alert("Password changed successfully.");

      onSuccess();

    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          "Unable to change password."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212]">
      <form
        onSubmit={handleSubmit}
        className="bg-[#1e1e1e] border border-[#30363d] rounded-xl p-8 w-[420px] space-y-4"
      >
        <h2 className="text-xl font-bold text-white">
          Change Password
        </h2>

        <p className="text-sm text-gray-400">
          You must change your temporary password before continuing.
        </p>

        {error && (
          <div className="text-red-400 text-sm">
            {error}
          </div>
        )}

        <input
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) =>
            setCurrentPassword(e.target.value)
          }
          className="w-full p-3 rounded bg-[#121212] border border-[#30363d]"
        />

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) =>
            setNewPassword(e.target.value)
          }
          className="w-full p-3 rounded bg-[#121212] border border-[#30363d]"
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(e.target.value)
          }
          className="w-full p-3 rounded bg-[#121212] border border-[#30363d]"
        />

        <button
          className="w-full bg-blue-600 p-3 rounded"
          type="submit"
        >
          Change Password
        </button>
      </form>
    </div>
  );
}