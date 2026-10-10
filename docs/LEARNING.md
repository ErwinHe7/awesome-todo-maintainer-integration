# Read and debug the Todo API

This learning fork preserves the original project and its attribution. Start with [the runnable CRUD lab](https://github.com/ErwinHe7/hackathon-crud-lab) for practice without a live Notion account.

Read `server.js` → `middleware/auth.js` → `app.js`. The routes delegate to `createTodo`, `readTodo`, `updateTodo`, and `deleteTodo`. Authentication creates the Notion client; `app.js` maps SDK responses into the extension's data shape.

## Fix included in this fork

One missing `Priority` property or a missing title/remarks array used to throw inside `readTodo`, making the whole list return `{success:false}`. Optional chaining now guards each missing field and array access. Token logging was removed from the authentication middleware.

Run the actual module against test doubles:

```sh
node --test test/read-todo.test.cjs
```

All four tests pass without installing packages or contacting Notion. They cover a mixed complete/sparse list, missing arrays, an empty database, and a rejected upstream query. They do not validate a live Notion SDK/version integration.

Learning task: predict the result of a record with no `Priority`. Explain where a property guard stops and why indexing an optional array needs its own guard. Compare the previous version through the fork's commit diff, then read the test that reproduces it.

The legacy SDK and deployment configuration require separate integration work before live use. Use your own disposable configuration; the local lab is the default learning path.
