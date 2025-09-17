import { defineStorage } from "@aws-amplify/backend";

export const content = defineStorage({
  name: "content",            // friendly name (Amplify will generate the real bucket name)
  isDefault: true,
  access: (allow) => ({
    // Authenticated users can manage site files. No guest access here.
    "public/sites/*": [
      allow.authenticated.to(["get", "list", "write", "delete"]),
    ],
  }),
});

export const billing = defineStorage({
  name: "billing",
  access: (allow) => ({
    // Invoice PDFs per user, readable by the authenticated owner.
    // Place invoices under an explicit top-level prefix to satisfy placeholder rules.
    // Supported layouts:
    // - invoices/{identity_sub}/*
    // - invoices/{entity_id}/*
    "invoices/{identity_sub}/*": [allow.authenticated.to(["get"])],
    "invoices/{entity_id}/*": [allow.authenticated.to(["get"])],
  }),
});
