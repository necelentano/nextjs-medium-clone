import type { NextApiRequest, NextApiResponse } from "next";
import SanityClient from "@sanity/client";

export const config = {
  // Find your project ID and dataset in `sanity.json` in your studio project.
  // These are considered "public", but you can use environment variables
  // if you want differ between local dev and production
  // https://nextjs.org/docs/basic-features/environment-variables
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  // Set useCdn to `false` if your application require the fresheest possible
  // data always (potentialy slightly slower and a bit expensive).
  // Authenticated request (like preview) will always bypass the CDN
  useCdn: process.env.NODE_ENV === "production",
  token: process.env.SANITY_API_TOKEN,
};

const client = SanityClient(config);

export default async function createComment(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { _id, name, email, comment } = JSON.parse(req.body);

  try {
    await client.create({
      _type: "comment",
      post: {
        _type: "reference",
        _ref: _id,
      },
      name,
      email,
      comment,
    });
  } catch (error) {
    return res.status(500).json({ message: `Couldn't submit comment`, error });
  }

  return res.status(200).json({ message: "Comment submitted" });
}
