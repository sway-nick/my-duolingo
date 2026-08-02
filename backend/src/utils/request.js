/**
 * Parses JSON body from POST request.
 *
 * @param {Object} e
 * @returns {Object}
 */
function getJsonBody(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return {};
  }

  try {
    return JSON.parse(e.postData.contents);
  } catch (error) {
    throw new Error('Invalid JSON payload.');
  }
}

/**
 * Returns query parameters.
 *
 * @param {Object} e
 * @returns {Object}
 */
function getQuery(e) {
  return (e && e.parameter) || {};
}

/**
 * Checks that required fields exist.
 *
 * @param {Object} data
 * @param {string[]} fields
 */
function validateRequired(data, fields) {
  const missing = fields.filter(
    (field) => data[field] === undefined || data[field] === null || data[field] === '',
  );

  if (missing.length > 0) {
    throw new Error(`Required fields are missing: ${missing.join(', ')}`);
  }
}
