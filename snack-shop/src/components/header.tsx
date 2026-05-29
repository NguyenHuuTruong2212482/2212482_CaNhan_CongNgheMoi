"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      const u = data.session?.user ?? null;
      setUser(u);

      if (u) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', u.id).single();
        setIsAdmin(profile?.role === 'admin');
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        supabase.from('profiles').select('role').eq('id', u.id).single().then(res => setIsAdmin(res.data?.role === 'admin'));
      } else setIsAdmin(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="flex items-center justify-between px-8 py-4 border-b">
      <Link href="/" className="text-2xl font-bold">
        Snack Shop
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link href={isAdmin ? "/orders" : "/cart"} className="border px-4 py-2 rounded">
              {isAdmin ? 'Orders' : 'Cart'}
            </Link>

            <Link href="/profile" className="border px-4 py-2 rounded">
              Profile
            </Link>

            <p>{user.email}</p>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="border px-4 py-2 rounded">
              Login
            </Link>

            <Link
              href="/register"
              className="bg-black text-white px-4 py-2 rounded"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
