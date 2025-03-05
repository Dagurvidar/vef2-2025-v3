import { z } from "zod";
import { PrismaClient, Prisma } from "@prisma/client";
import { createFactory } from "hono/factory";
import type { JsonArray } from "@prisma/client/runtime/library";

const CategorySchema = z.object({
  id: z.number(),
  title: z
    .string()
    .min(3, "title must be at least three letters")
    .max(1024, "title must be at most 1024 letters"),
  slug: z.string(),
});

const CategoryToCreateSchema = z.object({
  title: z
    .string()
    .min(3, "title must be at least three letters")
    .max(1024, "title must be at most 1024 letters"),
});

type Category = z.infer<typeof CategorySchema>;
type CategoryToCreate = z.infer<typeof CategoryToCreateSchema>;

const prisma = new PrismaClient();

export async function getCategories(
  limit: number = 10,
  offset: number = 0
): Promise<Array<Category>> {
  const categories = await prisma.categories.findMany();
  console.log("categories :>> ", categories);
  return categories;
}

export async function getCategory(slug: string): Promise<Category | null> {
  const category = await prisma.categories.findUnique({
    where: { slug },
  });
  console.log(category);

  return category ?? null;
}

export function validateCategory(categoryToValidate: unknown) {
  const result = CategoryToCreateSchema.safeParse(categoryToValidate);

  return result;
}

export async function createCategory(
  categoryToCreate: CategoryToCreate
): Promise<Category> {
  const createdCategory = await prisma.categories.create({
    data: {
      title: categoryToCreate.title,
      slug: categoryToCreate.title.toLowerCase().replace(" ", "-"),
    },
  });

  return createdCategory;
}

export async function updateCategory(
  body: JsonArray,
  slug: string
): Promise<Prisma.BatchPayload> {
  console.log("recieved json:", body);

  const updatedCategory = await prisma.categories.updateMany({
    where: { slug },
    data: body,
  });

  return updatedCategory;
}

export async function deleteCategory(
  slug: string
): Promise<Prisma.BatchPayload> {
  const deleted = await prisma.categories.deleteMany({
    where: { slug },
  });
  return deleted;
}
