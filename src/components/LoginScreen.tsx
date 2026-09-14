"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { useShop } from "@/context/ShopContext";

export function LoginScreen() {
  const { signIn } = useShop();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const ok = signIn(username, password);
    if (!ok) {
      setError("الاسم أو كلمة السر غلط.");
      return;
    }
    router.replace("/");
  }

  return (
    <div className="flex min-h-full items-center justify-center px-5 py-12">
      <section className="shop-card w-full max-w-md rounded-3xl p-6 sm:p-8" aria-label="تسجيل الدخول">
        <div className="flex flex-col items-center text-center">
          <BrandLogo size="md" />
          <h1 className="mt-4 font-serif text-3xl text-rose-900">بوتيك YAL</h1>
          <p className="mt-2 text-sm leading-7 text-rose-600/80">سجّلي دخولج عشان نفتح الصفحة المناسبة لج.</p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block text-sm">
            <span className="mb-1 block text-rose-700">الاسم أو رقم الموظفة</span>
            <input
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                setError("");
              }}
              autoComplete="username"
              className="w-full rounded-2xl border-0 bg-rose-50 px-3 py-2.5 text-rose-900 outline-none ring-rose-200 focus:ring-2"
              placeholder="مالك أو مريم"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-rose-700">كلمة السر</span>
            <input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              autoComplete="current-password"
              className="w-full rounded-2xl border-0 bg-rose-50 px-3 py-2.5 text-rose-900 outline-none ring-rose-200 focus:ring-2"
            />
          </label>
          {error ? (
            <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" className="shop-btn w-full rounded-2xl px-4 py-3 text-sm">
            دخول
          </button>
        </form>

        <p className="mt-5 text-center text-xs leading-6 text-rose-500">
          المالكة: مالك و yal
          <br />
          الموظفة: اسمج أو رقمج و 1234
        </p>
      </section>
    </div>
  );
}
