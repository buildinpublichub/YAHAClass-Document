// Greeter
export function greet(name) {
  return `Hello, ${name}!`;
}

export function greetAll(names) {
  return names.map((n) => greet(n));
}
