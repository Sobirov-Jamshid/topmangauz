"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function ProfileEditModal() {
  const [form, setForm] = useState({ username: "demo", email: "demo@example.com" });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          Tahrirlash
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Profilni tahrirlash</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block mb-1 text-sm" htmlFor="username">
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
            <label className="block mb-1 text-sm" htmlFor="email">
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
          <DialogFooter>
            <Button type="submit">Saqlash</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 