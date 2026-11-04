import type { LoginCredentials, User } from "../types/auth.types";

interface MockAccount extends User {
  password: string;
}

const mockAccounts: MockAccount[] = [
  {
    id: "admin-1",
    name: "Alex Admin",
    email: "admin@example.com",
    password: "admin123",
    role: "Administrator"
  },
  {
    id: "manager-1",
    name: "Morgan Manager",
    email: "manager@example.com",
    password: "manager123",
    role: "Support Manager"
  },
  {
    id: "agent-1",
    name: "Avery Agent",
    email: "agent@example.com",
    password: "agent123",
    role: "Support Agent"
  }
];

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

const toUser = ({ password: _password, ...user }: MockAccount): User => user;

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    await wait(300);

    const account = mockAccounts.find(
      (item) =>
        item.email.toLowerCase() === credentials.email.trim().toLowerCase() &&
        item.password === credentials.password
    );

    if (!account) {
      throw new Error("Invalid email or password.");
    }

    return toUser(account);
  },

  getSupportAgents(): User[] {
    return mockAccounts
      .filter((account) => account.role === "Support Agent")
      .map(toUser);
  }
};