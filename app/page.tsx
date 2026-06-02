"use client";
import { createClient } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) router.push("/dashboard");
    });
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: "http://localhost:3000" }
    });
    if (error) alert(error.message);
    else alert("Success! Check your email for the Magic Link.");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <form onSubmit={handleLogin} className="w-full max-w-md bg-[#111] p-10 rounded-3xl border border-gray-800 shadow-2xl">
        <h1 className="text-4xl font-extrabold mb-8 text-[#FFD700] text-center tracking-tighter">EstateAI</h1>
        <p className="text-gray-400 text-center mb-8">Sign in to access your dashboard</p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full p-4 rounded-xl bg-[#222] border border-gray-700 mb-6 outline-none focus:border-[#FFD700] transition-all"
        />
        <button type="submit" className="w-full p-4 rounded-xl bg-[#FFD700] text-black font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all">
          Send Magic Link
        </button>
      </form>
    </div>
  );
}