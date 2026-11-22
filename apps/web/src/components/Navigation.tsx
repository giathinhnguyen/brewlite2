"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ComponentProps } from "react";

/** Client redirect after authentication or payment verification. */
export function Navigate({ to, replace = false }: { to: string; replace?: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (replace) router.replace(to);
    else router.push(to);
  }, [router, to, replace]);
  return <p role="status" className="p-8 text-center">Đang chuyển trang...</p>;
}

type NavLinkProps = Omit<ComponentProps<typeof Link>, "href" | "className"> & {
  to: string;
  end?: boolean;
  className?: string | ((state: { isActive: boolean }) => string);
};

/** Next.js Link with active styles for the shop and admin menus. */
export function NavLink({ to, end, className, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === to || (!end && to !== "/" && pathname.startsWith(`${to}/`));
  return <Link {...props} href={to} aria-current={isActive ? "page" : undefined}
    className={typeof className === "function" ? className({ isActive }) : className} />;
}
