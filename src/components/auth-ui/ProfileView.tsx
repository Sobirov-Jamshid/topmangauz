"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";

interface DummyUser {
  username: string;
  email: string;
  avatar?: string | null;
  date_joined: string;
}

export default function ProfileView() {
  const user: DummyUser = {
    username: "demo",
    email: "demo@example.com",
    avatar: null,
    date_joined: new Date().toISOString(),
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 text-white">
      <Card className="w-full max-w-md">
        <CardHeader className="flex items-center gap-4">
          <Avatar className="size-16">
            {user.avatar && <AvatarImage src={user.avatar} alt={user.username} />}
            <AvatarFallback className="bg-[#ff9900] text-black font-bold text-xl">
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{user.username}</CardTitle>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(user.date_joined).toLocaleDateString()}
            </p>
          </div>
          <div className="ml-auto">
            <DialogTrigger asChild>
              <Button size="sm" variant="secondary">
                Tahrirlash
              </Button>
            </DialogTrigger>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Qo'shimcha ma'lumotlar joyi */}
        </CardContent>
      </Card>
    </div>
  );
} 