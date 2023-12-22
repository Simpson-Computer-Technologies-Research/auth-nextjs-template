import { Prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Response } from "@/lib/responses";
import { genId } from "@/lib/crypto";

/**
 * Get all of the users
 * @param req The request object
 * @returns The response object
 */
export async function GET(req: NextRequest) {
  return await Prisma.getUsers()
    .then((users) => {
      return NextResponse.json({ users, ...Response.Success }, { status: 200 });
    })
    .catch((err) => {
      return NextResponse.json(Response.InternalError, { status: 500 });
    });
}

/**
 * Add an user to the users database
 * @param req The request object
 * @returns The response object
 */
export async function PUT(req: NextRequest) {
  // Get the user's bearer token from the headers
  const secret = req.headers.get("Authorization");
  if (!secret) {
    return NextResponse.json(Response.InvalidHeaders, { status: 400 });
  }

  // Get the user's info from the request body
  const { name, email, image } = await req.json();
  if (!name || !email || !image) {
    return NextResponse.json(Response.InvalidBody, { status: 400 });
  }

  // Get the user's info
  const user = await Prisma.getUser(secret);

  // If the user doesn't exist, create them
  if (!user) {
    const id: string = await genId();

    await Prisma.createUser(id, name, email, image, secret);

    return NextResponse.json(
      {
        user: {
          id,
          name,
          email,
          image,
          permissions: [],
          purchasedEventIds: [],
        },
        ...Response.Success,
      },
      { status: 200 }
    );
  }

  // If the user's name has changed, update it
  if (user.name !== name) {
    await Prisma.updateUserName(secret, name);
  }

  // If the user's image has changed, update it
  if (user.image !== image) {
    await Prisma.updateUserImage(secret, image);
  }

  // Return the user's info
  return NextResponse.json(
    {
      user: {
        id: user.id,
        name,
        email,
        image,
      },
      ...Response.Success,
    },
    { status: 200 }
  );
}
