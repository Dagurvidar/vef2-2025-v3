import { serve } from "@hono/node-server";
import { Hono } from "hono";
import {
  createCategory,
  getCategories,
  getCategory,
  validateCategory,
  updateCategory,
  deleteCategory,
} from "./categories.db.js";

const app = new Hono();

app.get("/", (c) => {
  const data = {
    hello: "hono",
  };

  return c.json(data);
});

app.get("/categories", async (c) => {
  const categories = await getCategories();
  return c.json(categories);
});

app.get("/categories/:slug", async (c) => {
  const slug = c.req.param("slug");

  // Validate á hámarkslengd á slug

  const category = await getCategory(slug);
  console.log(category);

  if (!category) {
    return c.json({ message: "not found" }, 404);
  }

  return c.json(category);
});

app.post("/categories", async (c) => {
  let categoryToCreate: unknown;
  try {
    categoryToCreate = await c.req.json();
    console.log(categoryToCreate);
  } catch (e) {
    return c.json({ error: "invalid json" }, 400);
  }

  const validCategory = validateCategory(categoryToCreate);

  if (!validCategory.success) {
    return c.json(
      { error: "invalid data", errors: validCategory.error.flatten() },
      400
    );
  }

  const createdCategory = await createCategory(validCategory.data);

  return c.json(createdCategory, 201);
});

app.patch("/categories/:slug", async (c) => {
  try {
    const slug = c.req.param("slug");
    const body = await c.req.json();
    console.log(body);

    if (!body.title && !body.slug) {
      return c.json(
        { error: "Must provide either title or slug (description)" },
        400
      );
    }

    const updatedCategory = await updateCategory(body, slug);
    if (updatedCategory.count === 0) {
      return c.json({ error: "category not found" }, 404);
    }

    return c.json({ message: "database updated successfully" }, 200);
  } catch (e) {
    console.error(e);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.delete("/categories/:slug", async (c) => {
  try {
    const slug = c.req.param("slug");

    const deletedCategory = await deleteCategory(slug);
    if (deletedCategory.count === 0) {
      return c.json({ error: "category couldn't be deleted" }, 404);
    }

    return c.body(null, 204);
  } catch (error) {
    console.error(c.json({ error: "internal server error" }, 500));
  }
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
