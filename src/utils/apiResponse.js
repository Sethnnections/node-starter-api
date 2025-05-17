class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }

  static success(res, data, message = "Success", statusCode = 200) {
    return res.status(statusCode).json(new ApiResponse(statusCode, data, message));
  }

  static created(res, data, message = "Resource created") {
    return res.status(201).json(new ApiResponse(201, data, message));
  }

  static noContent(res, message = "No content") {
    return res.status(204).json(new ApiResponse(204, null, message));
  }
}

module.exports = ApiResponse;