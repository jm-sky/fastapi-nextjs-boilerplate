'use client';

import { Button } from "../ui/button";
import { useAuth } from "@/context/auth.context";

export default function NavbarUser() {
  const { logout } = useAuth();

  return (
    <div className="flex items-center gap-2 px-4">
      <Button variant="outline" onClick={() => logout()}>
        Logout
      </Button>
    </div>
  );
}
