import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  UserProfile: a
    .model({
      userId: a
        .id()
        .required()
        // Allow owner to set on create, but not update later
        .authorization((allow) => [allow.ownerDefinedIn('userId').identityClaim('sub').to(['read','create'])]),
      firstName: a.string(),
      lastName: a.string(),
      taxNumber: a.string(),
      companyName: a.string(),
      companyAddress: a.string(),
      companyAddressCity: a.string(),
      companyAddressPostalCode: a.string()
    })
    .identifier(['userId'])
    .authorization((allow) => [allow.ownerDefinedIn('userId').identityClaim('sub')]),

  Domain: a
    .model({
      userId: a
        .id()
        .required()
        // Allow owner to set on create, but not update later
        .authorization((allow) => [allow.ownerDefinedIn('userId').identityClaim('sub').to(['read','create','delete'])]),
      name: a.string().required(),
      s3_prefix: a.string().required(),
      infraReady: a.boolean().required(),
      url: a.string(),
      toBeDeleted: a.boolean().required().default(false)
    })
    .identifier(["userId", "name"])
    .authorization(allow => [
      allow.ownerDefinedIn('userId').identityClaim('sub').to(['read','create','update','delete'])
    ])
  ,
  Invoice: a
    .model({
      userId: a
        .id()
        .required()
        // Allow owner to set on create, but not update later
        .authorization((allow) => [allow.ownerDefinedIn('userId').identityClaim('sub').to(['read','create'])]),
      issueDate: a.string().required(),
      net: a.float().required(),
      gross: a.float().required(),
      vatRate: a.float().required(),
      fileName: a.string().required(),
      currency: a.string() // e.g., PLN, EUR. Optional; UI defaults to PLN
    })
    .identifier(["userId", "issueDate"]) // sort by issueDate within user
    .authorization(allow => [allow.ownerDefinedIn('userId').identityClaim('sub')])
  ,
  // Applications attached to domains (e.g., STATIC site or WORDPRESS instance)
  Application: a
    .model({
      userId: a.id().required()
        .authorization((allow) => [allow.ownerDefinedIn('userId').identityClaim('sub').to(['read','create','update','delete'])]),
      domain: a.string().required(),
      appName: a.string().required(), // logical name or subdomain label (e.g., "www", "app1")
      // store as string for now; allowed values: STATIC | WORDPRESS
      type: a.string().required(),
      fqdn: a.string().required(),
      infraReady: a.boolean().required(),
      s3Prefix: a.string(), // for STATIC or uploads path for WORDPRESS if desired
      subdomain: a.string(),
      toBeDeleted: a.boolean().required().default(false),
    })
    .identifier(['userId','domain','appName'])
    .authorization((allow) => [allow.ownerDefinedIn('userId').identityClaim('sub').to(['read','create','update','delete'])])
});

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
