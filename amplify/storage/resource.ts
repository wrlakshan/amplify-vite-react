import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "todoStorage",
  access: (allow) => ({
    "media/*": [allow.authenticated.to(["read", "write"]), allow.guest.to(["read", "write", "delete"])],
  }),
});
