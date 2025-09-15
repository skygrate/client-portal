import { defineStorage } from "@aws-amplify/backend";

export const content = defineStorage({
  name: "content",            // friendly name (Amplify will generate the real bucket name)
  access: (allow) => ({
    // Authenticated users can manage site files. No guest access here.
    "public/sites/*": [
      allow.authenticated.to(["get", "list", "write", "delete"]),
    ],
  }),
});