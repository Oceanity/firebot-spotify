import { objectWalkPath } from "./object";

describe("Object Helpers", () => {
  //#region objectWalkPath
  describe("objectWalkPath", () => {
    let expectedObject: Record<string, any>;
    let expectedKey: string;

    beforeEach(() => {
      expectedObject = { foo: "bar" };
      expectedKey = "foo";
    });

    it("returns expected object when no path provided", () => {
      expect(objectWalkPath(expectedObject)).toEqual(expectedObject);
    });

    it("returns expected object when path is whitespace/empty string", () => {
      expect(objectWalkPath(expectedObject, " ")).toEqual(expectedObject);
    });

    it("returns expected value when path provided", () => {
      expect(objectWalkPath(expectedObject, expectedKey)).toEqual(
        expectedObject[expectedKey]
      );
    });

    it("returns expected value when operating on array", () => {
      let expectedArray = [expectedObject, { baz: "qux" }];

      expect(objectWalkPath(expectedArray, "0")).toEqual(expectedObject);
    });

    it("returns expected value when nested path provided", () => {
      let nestedObject = { foo: { bar: "baz" } };

      expect(objectWalkPath(nestedObject, "foo.bar")).toEqual("baz");
    });

    it("returns expected value when nested array path provided", () => {
      let nestedArray = [{ foo: { bar: "baz" } }];

      expect(objectWalkPath(nestedArray, "0.foo.bar")).toEqual("baz");
    });

    it("returns empty string when path does not exist", () => {
      expect(objectWalkPath(expectedObject, "baz")).toEqual("");
    });
  });
  //#endregion
});
