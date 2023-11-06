import { fileURLToPath } from "node:url";
import { createPage, setup } from "@nuxt/test-utils";

await setup({
  rootDir: fileURLToPath(new URL("../", import.meta.url)),
  browser: true,
  runner: "jest",
});

describe("browser", () => {
  it("runs a test", async () => {
    const page = await createPage("/");
    const text = await page.getByRole("heading",{ name: 'Welcome to Nuxt!' }).innerText()
    await expect(text).toContain(
      "Welcome to Nuxt!"
    );
  });
});
