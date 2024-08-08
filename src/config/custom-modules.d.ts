interface User {
  _id: string;
}

declare module Express {
  interface Request {
    user?: User;
  }
}
