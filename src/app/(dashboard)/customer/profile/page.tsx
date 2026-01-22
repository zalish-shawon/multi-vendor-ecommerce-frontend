/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { AuthService } from "@/services/auth.service";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export default function ProfilePage() {
  const user = AuthService.getCurrentUser();
  type ProfileFormValues = {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    image?: FileList | null;
  };
  const { register, handleSubmit } = useForm<ProfileFormValues>({
    defaultValues: {
      name: user?.name,
      email: user?.email,
      phone: user?.phone || "",
      address: user?.address || "",
      image: undefined,
    },
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: ProfileFormValues) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("name", data.name as any);
    formData.append("phone", data.phone as any);
    formData.append("address", data.address as any);
    if (data.image?.[0]) {
      formData.append("image", data.image[0]);
    }

    try {
      const res = await api.put("/auth/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Update local storage user data
      localStorage.setItem(
        "user",
        JSON.stringify({ ...user, ...res.data.user }),
      );
      toast.success("Profile updated successfully");
      window.location.reload(); // Refresh to show new image/data
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.profileImg} />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Label>Profile Picture</Label>
                <Input type="file" {...register("image")} accept="image/*" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input {...register("name")} />
              </div>
              <div className="space-y-2">
                <Label>Email (Read Only)</Label>
                <Input
                  {...register("email")}
                  disabled
                  className="bg-slate-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input {...register("phone")} placeholder="+880..." />
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                {...register("address")}
                placeholder="Full delivery address"
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
