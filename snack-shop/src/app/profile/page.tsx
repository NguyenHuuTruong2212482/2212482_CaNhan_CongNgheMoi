"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

type Profile = {
  id: string;
  display_name: string;
  avatar_url: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);

  // ĐƯA HÀM LÊN TRƯỚC
  const getProfile = async () => {
    // lấy user login
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setUser(user);

    // lấy profile
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setProfile(data);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      // lấy user login
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setUser(user);

      // lấy profile
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
      }
    };

    loadProfile();
  }, []);

  if (!user) {
    return <div className="p-10">Chưa đăng nhập</div>;
  }

  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold mb-8">Profile</h1>

      <div className="border p-6 rounded-xl max-w-md shadow">
        {profile?.avatar_url && (
          <img
            src={profile.avatar_url}
            alt="avatar"
            className="w-24 h-24 rounded-full mb-4"
          />
        )}

        <p className="mb-3">
          <strong>Email:</strong> {user.email}
        </p>

        <p className="mb-3">
          <strong>Name:</strong> {profile?.display_name || "No name"}
        </p>

        <p className="break-all">
          <strong>User ID:</strong> {user.id}
        </p>
      </div>
    </div>
  );
}
