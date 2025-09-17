import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const DomainParameters = a.customType({
  s3_prefix: a.string().required(),
});

const schema = a.schema({
  UserProfile: a
    .model({
      userId: a
        .id()
        .required()
        .authorization((allow) => [allow.ownerDefinedIn('userId').identityClaim('sub').to(['read'])]),
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
        .authorization((allow) => [allow.ownerDefinedIn('userId').identityClaim('sub').to(['read'])]),
      name: a.string().required(),
      status: a.string().required(),
      parameters: DomainParameters
    })
    .identifier(["userId", "name"])
    .authorization(allow => [allow.ownerDefinedIn('userId').identityClaim('sub')])
  ,
  Invoice: a
    .model({
      userId: a
        .id()
        .required()
        .authorization((allow) => [allow.ownerDefinedIn('userId').identityClaim('sub').to(['read'])]),
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
