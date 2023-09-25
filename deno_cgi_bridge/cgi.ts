/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Deno CGI Bridge
 *
 * serve exposes a function that reads a CGI style http request.
 */

async function streamHeader(
  response: Response,
  target: WritableStream<Uint8Array>,
) {
  const encoder_stream = new TextEncoderStream();
  const STDOUT = encoder_stream.writable.getWriter();
  const header_done = encoder_stream.readable.pipeTo(target, {
    preventClose: true,
    preventAbort: true,
  });

  await STDOUT.write(`Status: ${response.status} ${response.statusText} \n`);
  for (const pair of response.headers.entries()) {
    const line = `${pair[0]}: ${pair[1]} \n`;
    await STDOUT.write(line);
  }
  await STDOUT.write("\n");
  await STDOUT.close();
  await header_done;
}

function getCGIRequest() {
  const PATH_INFO = Deno.env.get("PATH_INFO");
  const QUERY_STRING = Deno.env.get("QUERY_STRING");
  const REMOTE_ADDR = Deno.env.get("REMOTE_ADDR");
  const REQUEST_METHOD = Deno.env.get("REQUEST_METHOD") as string;
  const SERVER_NAME = Deno.env.get("SERVER_NAME");
  const SERVER_PROTOCOL = Deno.env.get("SERVER_PROTOCOL");
  const isHTTPS = SERVER_PROTOCOL?.toLocaleLowerCase().includes("https");

  const url = new URL(
    `${
      isHTTPS ? "https" : "http"
    }://${SERVER_NAME}${PATH_INFO}?${QUERY_STRING}`,
  );

  const request = new Request(url, {
    method: REQUEST_METHOD,
    body: ["POST", "PUT"].includes(REQUEST_METHOD)
      ? Deno.stdin.readable
      : undefined,
  });
  const info: Deno.ServeHandlerInfo = {
    remoteAddr: {
      transport: "tcp",
      hostname: REMOTE_ADDR as string,
      port: 80,
    },
  };

  return { request, info };
}

/**
 * Creates a "server" that reads a network Requests
 * from the GCI enviroment variables.
 *
 * Calls the ServeHandler with the request, the given response
 * will be streamed back to the Client.
 *
 * @param server - The Handler for the request
 */
export async function serve(server: Deno.ServeHandler) {
  const { request, info } = getCGIRequest();
  const response: Response = await server(request, info);

  await streamHeader(response, Deno.stdout.writable);
  await response.body?.pipeTo(Deno.stdout.writable);
}
