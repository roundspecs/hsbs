"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Card, CardContent, CardDescription, CardTitle } from "../ui/card";

type Props = {
  name: string;
  slug: string;
};

export default function WorkspaceCard({ name, slug }: Props) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <li>
      <Link href={`/w/${slug}`} className="block">
        <Card className="cursor-pointer hover:shadow-md transition">
          <CardContent className="flex items-center gap-4">
            <Avatar>
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{name}</CardTitle>
              <CardDescription>Slug: {slug}</CardDescription>
            </div>
          </CardContent>
        </Card>
      </Link>
    </li>
  );
}
