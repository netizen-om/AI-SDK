"use server";

import { db } from "@/lib/db";
import { TemplateFolder } from "../lib/path-to-json";
import { currentUser } from "@/modules/auth/action";

export const getPlaygroundById = async (id: string) => {
  try {
    const playgound = await db.playground.findUnique({
      where: { id },
      select: {
        templateFiles: {
          select: {
            content: true,
          },
        },
      },
    });

    return playgound;
  } catch (error) {
    console.error("Eror geting playgound : ", error);
  }
};

export const SaveUpdatedCode = async (
  playgroundId: string,
  data: TemplateFolder
) => {
  const user = await currentUser();
  if (!user) return null;

  try {
    const updatedPlaygound = await db.templateFile.upsert({
        where : { playgroundId },
        update : {
            content : JSON.stringify(data)
        },
        create : {
            playgroundId,
            content : JSON.stringify(data),
        }
    })

    return updatedPlaygound

  } catch (error) {
    console.error("SaveUpdatedCode error:", error);
    return null;
  }
};
