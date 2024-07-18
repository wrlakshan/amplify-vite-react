import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { sayHello } from "../functions/say-hello/resource";
import { schema as generatedSqlSchema } from "./schema.sql";

const sqlSchema = generatedSqlSchema
  .setAuthorization((models) => [
    // Model-level authorization rules
    models.events.authorization((allow) => allow.guest()),
  ])
  .authorization((allow) => allow.guest())
  .renameModels(() => [["events", "Events"]]);

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any user authenticated via an API key can "create", "read",
"update", and "delete" any "Todo" records.
=========================================================================*/
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
  .authorization((allow) => [allow.publicApiKey()]);

const combinedSchema = a.combine([schema, sqlSchema]);
export type Schema = ClientSchema<typeof combinedSchema>;

export const data = defineData({
  schema: combinedSchema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
