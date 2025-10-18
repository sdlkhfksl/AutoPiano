const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'

export function nanoid(size = 10): string {
  let id = ''
  for (let i = 0; i < size; i += 1) {
    const index = Math.floor(Math.random() * ALPHABET.length)
    id += ALPHABET[index]
  }
  return id
}
