"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 1. Initial check
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) router.replace("/dashboard");
    };
    checkUser();

    // 2. Listener (Fixes the state sync error)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.replace("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { 
        emailRedirectTo: `${window.location.origin}/dashboard` 
      }
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Success! Check your email for the link.");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <form onSubmit={handleLogin} className="w-full max-w-md bg-[#111] p-10 rounded-3xl border border-gray-800 shadow-2xl">
        <h1 className="text-4xl font-extrabold mb-2 text-[#FFD700] text-center tracking-tighter">EstateAI</h1>
        <p className="text-gray-400 text-center mb-8 text-sm uppercase tracking-widest">Forensic Intelligence Portal</p>
        
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="operator@estate.ai"
          required
          className="w-full p-4 rounded-xl bg-[#222] border border-gray-700 mb-6 outline-none focus:border-[#FFD700]"
        />
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full p-4 rounded-xl bg-[#FFD700] text-black font-bold text-lg hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "TRANSMITTING..." : "REQUEST ACCESS"}
        </button>
      </form>
    </div>
  );
}