import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const DomainParameters = a.customType({
  s3_prefix: a.string().required(),
});

const schema = a.schema({
  UserProfile: a
    .model({
      userId: a.id().required(),
      firstName: a.string(),
      lastName: a.string(),
      taxNumber: a.string(),
      companyName: a.string(),
      companyAddress: a.string(),
      companyAddressCity: a.string(),
      companyAddressPostalCode: a.string()
    })
    .identifier(['userId'])
    .authorization((allow) => [allow.owner()]),

  Domain: a
    .model({
      userId: a.id().required(),
      name: a.string().required(),
      status: a.string().required(),
      parameters: DomainParameters
    })
    .identifier(["userId", "name"])
    .authorization(allow => [allow.ownerDefinedIn('userId')])
});

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});