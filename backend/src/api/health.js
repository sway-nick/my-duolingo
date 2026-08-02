/**
 * Health endpoint.
 */
function healthEndpoint() {
  return jsonResponse({
    data: {
      service: 'My Duolingo API',
      version: '0.1.0',
      status: 'OK',
    },
  });
}
