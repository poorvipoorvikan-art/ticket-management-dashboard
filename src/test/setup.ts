import "@testing-library/jest-dom/vitest";
import axios from "axios";
import { afterAll, afterEach, beforeAll } from "vitest";
import { apiClient } from "../services/apiClient";
import { server } from "./mocks/server";

apiClient.defaults.adapter = axios.getAdapter("http");

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});