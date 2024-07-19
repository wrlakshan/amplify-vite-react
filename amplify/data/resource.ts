import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { sayHello } from "../functions/say-hello/resource";
import { schema as generatedSqlSchema } from "./schema.sql";

const sqlSchema = generatedSqlSchema
  .authorization((allow) => [allow.authenticated()])
  .renameModels(() => [["events", "Events"]]);

const schema = a
  .schema({
    Comment: a
      .model({
        details: a.string(),
        todoId: a.id(),
        todo: a.belongsTo("Todo", "todoId"),
      })
      .secondaryIndexes((index) => [index("todoId")]),
    Todo: a.model({
      content: a.string().required(),
      key: a.string(),
      type: a.enum(["isDone", "read", "update"]),
      comments: a.hasMany("Comment", "todoId"),
    }),
    sayHello: a
      .query()
      .arguments({
        name: a.string(),
      })
      .returns(a.string())
      .handler(a.handler.function(sayHello)),
  })
  .authorization((allow) => [allow.authenticated()]);

const combinedSchema = a.combine([schema, sqlSchema]);
export type Schema = ClientSchema<typeof combinedSchema>;

export const data = defineData({
  schema: combinedSchema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
