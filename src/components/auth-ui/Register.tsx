"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center">Ro‘yxatdan o‘tish</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block mb-1 text-sm text-white" htmlFor="username">
                Foydalanuvchi nomi
              </label>
              <input
                id="username"
                className="w-full rounded-md bg-[#1a1a1a] border border-[#2a2a2a] p-2 text-white focus:outline-none focus:ring-1 focus:ring-[#ff9900]"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm text-white" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full rounded-md bg-[#1a1a1a] border border-[#2a2a2a] p-2 text-white focus:outline-none focus:ring-1 focus:ring-[#ff9900]"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm text-white" htmlFor="password">
                Parol
              </label>
              <input
                id="password"
                type="password"
                className="w-full rounded-md bg-[#1a1a1a] border border-[#2a2a2a] p-2 text-white focus:outline-none focus:ring-1 focus:ring-[#ff9900]"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Ro‘yxatdan o‘tish
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 