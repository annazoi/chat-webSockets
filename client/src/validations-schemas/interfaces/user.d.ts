export interface Signup {
  username: string;
  avatar?: string;
}

export interface Signin {
  username: string;
}

export interface User {
  id: string;
  username: string;
  avatar?: string;
}
