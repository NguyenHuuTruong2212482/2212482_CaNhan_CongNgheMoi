"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();
  }, []);

  if (!user) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <div className="p-10 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>

      <div className="border p-6 rounded-xl space-y-3">
        <p>
          <b>Email:</b> {user.email}
        </p>

        <p>
          <b>User ID:</b> {user.id}
        </p>

        <p>
          <b>Created:</b> {new Date(user.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
