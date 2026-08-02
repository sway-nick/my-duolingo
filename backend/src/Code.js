function doGet(e) {
  return jsonResponse({
    data: {
      service: 'My Duolingo API',
      version: '0.1.0',
    },
  });
}
