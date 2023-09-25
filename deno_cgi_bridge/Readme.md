## Setup

This was only tested so far using caddy + gci module

Example Caddyfile:

```Caddyfile
{
        order cgi before respond
}

someDomain {
        cgi /* /var/lib/caddy/app.ts 
}
```

## Example

```
import { serve } from "./cgi.ts";

// Define your own server handler or middleware here
const myServerHandler = async (request: Request, info: any) => {
  // Implement your CGI program logic here and return a Response.
  // You can use the CGI environment variables provided in 'info'.

  const responseBody = "Hello, CGI World!\n";

  return new Response(responseBody, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
};

// Start the server
serve(myServerHandler);
```

## Example 2 Hono

Given it exposes a generic fetch api, it can be used with other frameworks i.e
[Hono](https://hono.dev/)

```
import { serve } from "./cgi.ts";
import {Hono} from "https://deno.land/x/hono@v3.2.7/mod.ts"; 

const app = new Hono();

app.get("/", (context)=>{
    context.status(200)
    return context.body("hello world")
});
serve(app.fetch)
```
