export function isCourseCode(courseCode: string): boolean {
  return Boolean(courseCode.match(/^[A-Z]{4}[0-9]{4}$/)?.[0]);
}

export function generateID(len: number) {
  let result = '';
  const characters = '0123456789';
  for (let i = 0; i < (len); i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}