import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

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
});

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});