const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found!" });
  }

  request.user = user;
  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const user = users.find((user) => user.username === username);

  if (user) {
    response.status(400).json({ error: "User already exists" });
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: [],
  });
  response.status(201).send("User created!");
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).send(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const {
    user,
    body: { title, done, deadline },
  } = request;

  user.todos.push({
    id: uuidv4(),
    title,
    done,
    deadline,
    created_at: new Date(),
  });

  return response.status(201).send(user.todos);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const {
    user,
    params: { id },
    body: { title, deadline },
  } = request;
  const task = user.todos.find((todo) => todo.id === id);

  if (!task) {
    return response.status(400).json({ error: "To do not found!" });
  }

  task.title = title;
  task.deadline = deadline;
  return response.status(200).send(user.todos);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const {
    user,
    params: { id },
    body: { done },
  } = request;
  const task = user.todos.find((todo) => todo.id === id);

  if (!task) {
    return response.status(400).json({ error: "To do not found!" });
  }

  task.done = done;
  return response.status(200).send(user.todos);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const {
    user,
    params: { id },
  } = request;
  const task = user.todos.find((todo) => todo.id === id);

  if (!task) {
    return response.status(400).json({ error: "To do not found!" });
  }

  user.todos.splice(task, 1);

  return response.status(204).send(user.todos);
});

module.exports = app;
