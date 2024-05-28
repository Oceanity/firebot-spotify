export default class ResponseError extends Error {
  data: any;

  constructor(message: string, data: any) {
    super(message);
    this.name = this.constructor.name; // Set the error name to the class name
    this.data = data;

    // Set the prototype explicitly, because extending built-ins like Error in TypeScript requires it
    Object.setPrototypeOf(this, ResponseError.prototype);
  }
}
