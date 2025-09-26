'use client';

import { Button } from "../ui/button";
import { useAuth } from "@/context/auth.context";

const { logout } = useAuth();

export default function NavbarUser() {
  return (
    <div className="flex items-center gap-2 px-4">
      <Button variant="outline" onClick={() => logout()}>
        Logout
      </Button>
    </div>
  );
}
