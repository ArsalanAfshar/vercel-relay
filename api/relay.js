export const config = { runtime: "edge" };

export default async function handler(request) {
  if (request.method === "GET") {
    return new Response(JSON.stringify({ status: "Relay is Active" }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const req = await request.json();
    if (!req.u) {
      return new Response(JSON.stringify({ error: "Missing URL" }), { status: 400 });
    }

    const targetUrl = req.u;
    const response = await fetch(targetUrl, {
      method: req.m || "GET",
      headers: req.h || {},
      body: req.b ? Buffer.from(req.b, 'base64') : undefined
    });

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    const headers = {};
    response.headers.forEach((v, k) => { headers[k] = v; });

    return new Response(JSON.stringify({
      s: response.status,
      h: headers,
      b: base64
    }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
