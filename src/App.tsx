import { Button, Card, Divider, Flex, Heading, Text } from "@aws-amplify/ui-react";
import { StorageImage, StorageManager } from "@aws-amplify/ui-react-storage";
import { generateClient } from "aws-amplify/data";
import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });

    client.queries.sayHello({
      name: "Amplify",
    });

    const fetchData = async () => {
      try {
        const { data: events } = await client.models.Events.list();
        console.log("🚀 ~ fetchData ~ events:", events);
      } catch (error) {
        console.error("Error fetching events", error);
      }
    };

    fetchData();
  }, []);

  function createTodo({ key, content }: { key: string; content: string }) {
    client.models.Todo.create({
      content,
      key,
    });
  }

  function deleteTodos(id: string) {
    client.models.Todo.delete({ id });
  }

  // async function grabURL(path: string) {
  //   console.log("path", path);
  //   const { url } = await getUrl({ path });
  //   console.log("url", url);
  //   return url.toString();
  // }

  return (
    <>
      <Heading width="30vw" level={1}>
        My Todos
      </Heading>

      <StorageManager
        path="media/"
        acceptedFileTypes={["image/*"]}
        maxFileCount={1}
        onUploadStart={({ key }) => {
          const content = window.prompt("Todo Content");
          if (!key || !content) return;
          createTodo({ key, content });
        }}
        components={{
          Container({ children }) {
            return <Card variation="elevated"> {children}</Card>;
          },
          DropZone({ children, displayText, inDropZone, ...rest }) {
            return (
              <Flex
                alignItems="center"
                direction="column"
                padding="medium"
                backgroundColor={inDropZone ? "primary.10" : ""}
                {...rest}>
                <Text> Drop file here</Text>
                <Divider size="small" label="or" maxWidth="10rem" />
                {children}
              </Flex>
            );
          },
          FilePicker({ onClick }) {
            return (
              <Button onClick={onClick} variation="primary">
                Select File
              </Button>
            );
          },
        }}
      />

      {todos.map((todo) => (
        <li key={todo.id} onClick={() => deleteTodos(todo.id)}>
          <Flex justifyContent="space-between">
            <Text>{todo.content}</Text>
            {todo.key ? <StorageImage alt={todo.content || ""} path={todo.key} width="100px" /> : null}
          </Flex>
        </li>
      ))}
    </>
  );
}

export default App;
