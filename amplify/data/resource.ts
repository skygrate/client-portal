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
      status: a.string().required(), //'New', 'Ready', 'Online', 'Error'
      s3_prefix: a.string().required(),
      infraReady: a.boolean().required(),
      url: a.string()
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
});

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
