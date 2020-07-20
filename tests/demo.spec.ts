function sum(a: number, b: number): number {
  return a + b;
}

describe("Demo test", () => {
  it("Should be fine", () => {
    expect(sum(2, 3)).toEqual(5);
  });
});
